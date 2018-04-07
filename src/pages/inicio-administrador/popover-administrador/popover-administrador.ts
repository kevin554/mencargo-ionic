import { Component } from '@angular/core';
import { App, IonicPage, LoadingController, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppState } from '../../../app/app.global';
import { AdministradorProvider } from '../../../providers/index.services';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-popover-administrador',
  templateUrl: 'popover-administrador.html',
})
export class PopoverAdministradorPage {

  private objRol;
  private objCondominio;
  private objUsuario;

  constructor(public viewCtrl: ViewController, public app: App,
      public navParams: NavParams, private _ap: AdministradorProvider,
      public navCtrl: NavController, private firebase: Firebase,
      public loadingCtrl: LoadingController, public global: AppState) {
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
      condominio: this.objCondominio
    }

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push('GestionarPage', parametros);

    this.viewCtrl.dismiss(); // para cerrar el menu
  }

  public cerrarSesion() {
    this._ap.cerrarSesion();

    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cerrando la sesion',
      enableBackdropDismiss: true
    });

    this.firebase.unregister().then(
      success => {

      }
    ).catch(
      error => {

      }
    )

    let peticion = this._ap.actualiazarToken(
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

      console.log(`la respuesta del servidor fue ${JSON.stringify(datos)}`)

      if (datos.success) {

      } else {

      }

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
    navCtrlPadre.setRoot('InicioPage');
  }

}
