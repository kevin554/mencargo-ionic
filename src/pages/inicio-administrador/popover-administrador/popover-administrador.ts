import { Component } from '@angular/core';
import { App, Events, IonicPage, LoadingController, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { AppState } from '../../../app/app.global';
import { AdministradorProvider, IngresosProvider, ViviendaDao } from '../../../providers/index.services';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-popover-administrador',
  templateUrl: 'popover-administrador.html',
})
export class PopoverAdministradorPage {

  public objRol;
  private objCondominio;
  private objUsuario;

  constructor(public viewCtrl: ViewController, public app: App,
      public navParams: NavParams, private _ap: AdministradorProvider,
      public navCtrl: NavController, private firebase: Firebase,
      public loadingCtrl: LoadingController, public global: AppState,
      private viviendaDao: ViviendaDao, public events: Events,
      public platform: Platform, private ingresosProvider: IngresosProvider) {
    if (navParams.get("rol")) {
      this.objRol = navParams.get("rol");
    }

    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }
  }

  public gestionar() {
    let parametros = {
      condominio: this.objCondominio,
      // navCtrl: this.navCtrl
    }
// this.viewCtrl.dismiss(); // para cerrar el menu
    // this.events.publish("gestionarPermisos");
    // this.navParams.get("gestionarPermisos")();
    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push("GestionarPage", parametros);
    // this.navCtrl.push("GestionarPage", parametros);

    this.viewCtrl.dismiss(); // para cerrar el menu
  }

  public verReportes() {
    let parametros = {
      condominio: this.objCondominio,
    }

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push("ReportesPage", parametros);

    this.viewCtrl.dismiss(); // para cerrar el menu
  }

  public cerrarSesion() {
    this._ap.cerrarSesion();
    // this.viviendaDao.eliminarTodas();
    if (this.platform.is("cordova")) this.viviendaDao.eliminarTabla();
    if (this.platform.is("cordova")) this.ingresosProvider.eliminarTabla();

    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cerrando la sesión.',
      enableBackdropDismiss: true
    });

    this.firebase.unregister().then(
      success => {

      }
    ).catch(
      error => {

      }
    )

    let peticion = this._ap.actualizarToken(
      this.objUsuario.id,
      this.objUsuario.codigo,
      "Sin Token"
    );
    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) { } else { }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      error => {
        cargarPeticion.dismiss();
      }
    );

    this.viewCtrl.dismiss(); // para cerrar el menu

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.setRoot("InicioPage");
  }

}
