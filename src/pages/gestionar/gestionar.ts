import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AdministradorProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-gestionar',
  templateUrl: 'gestionar.html',
})
export class GestionarPage {

  private objCondominio:any;
  private lista:any[]; /* la lista con usuario, roles y privilegios */

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public loadingCtrl: LoadingController, public popoverCtrl: PopoverController,
      private _ap: AdministradorProvider, private util: UtilServiceProvider) {
    // if (navParams.get("navCtrl")) this.navCtrl = navParams.get("navCtrl");

    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
      this.cargarUsuarios();
    }
  }

  public desplegarMenu(evento) {
    let popover = this.popoverCtrl.create("PopoverGestionarPage");

    popover.present({
      ev: evento
    });
  }

  public verPermisos(item) {
    let parametros = {
      privilegios: item.privilegios
    }

    this.navCtrl.push('GestionarPermisosPage', parametros);
  }

  public gestoActualizar(refresher) {
    this.cargarUsuarios();
    refresher.complete();
  }

  private cargarUsuarios() {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando usuarios y privilegios.',
      dismissOnPageChange: false
    });

    cargarPeticion.present();

    let peticion = this._ap.cargarUsuariosPrivilegios(
      this.objCondominio.fkcondominio
    );

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;
        this.lista = [];

        for (let i in datos) {
          let dato = datos[i];

          /* */
          if (dato.nombre_rol.toLowerCase() === "super administrador") {
            continue;
          }

          let privilegios = [];
          /* {id: 0, fkuser: 0, boton: '', estado: false} */
          for (let j in dato.privilegios) {
            let privilegio = dato.privilegios[j];
            privilegios.push(privilegio);
          }

          let parametros = {
            usuario: {
              id: dato.id,
              nombre: dato.nombre,
              correo: dato.correo
            },
            rol: {
              fkrol: dato.fkrol,
              nombre_rol: dato.nombre_rol
            },
            condominio: {
              fkcondominio: dato.fkcondominio,
              nombre_condominio: dato.nombre_condominio
            },
            privilegios: privilegios
          };

          this.lista.push(parametros);
        } /* fin for */
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      }, err => {
        this.util.toast(`Hubo un error al conectarse con el servidor.`);
        cargarPeticion.dismiss();
      }
    );
  }

}
