import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { GrupoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-grupo',
  templateUrl: 'ver-grupo.html',
})
export class VerGrupoPage {

  objFamiliar:any;
  objGrupo:any;
  integrantes:any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public alertCtrl: AlertController, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider, private _gp: GrupoProvider) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("grupo")) {
      this.objGrupo = navParams.get("grupo");
      this.integrantes = this.objGrupo.detallegrupo;
      // this.cargarIntegrantes();
    }

    if (navParams.get("integrantes")) {
      this.integrantes = navParams.get("integrantes")
    }
  }

  cargarIntegrantes() {
    // let cargarPeticion = this.loadingCtrl.create({
    //   content: 'cargando lista de integrantes',
    //   enableBackdropDismiss: true
    // });
    //
    // cargarPeticion.present();
    //
    // let peticion/* = this._ip.seleccionarAmigos(
    //   this.idFamiliar,
    //   this.objFamiliar.codigo
    // );*/
    //
    // cargarPeticion.onDidDismiss( () => {
    //   peticionEnCurso.unsubscribe();
    // });
    //
    // let peticionEnCurso = peticion.map( resp => {
    //   let datos = resp.json();
    //
    //   if (datos.success) {
    //     datos = datos.response;
    //     this.grupos = [];
    //
    //     for (let indice in datos) {
    //       let grupo = datos[indice];
    //       this.grupos.push(grupo);
    //
    //       // if (this.platform.is("cordova")) {
    //       //   this.agregarInvitacionLocal(amigo);
    //       // }
    //
    //     }
    //
    //     this.util.ordenar(this.grupos, "nombre");
    //
    //   } else {
    //     let mensaje:string = datos.message;
    //
    //     /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
    //     if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
    //       this.util.toast(mensaje);
    //     }
    //   }
    //
    // }).subscribe(
    //   success => {
    //     cargarPeticion.dismiss();
    //     this.noHayConexion = false;
    //   },
    //   err => {
    //     cargarPeticion.dismiss();
    //     this.noHayConexion = true;
    //     // this.cargarAmigosLocal();
    //   }
    // );
  }

  public gestoActualizar(refresher) {
    this.cargarIntegrantes();
    refresher.complete();
  }

  public agregarIntegrante() {
    let parametros = {
      familiar: this.objFamiliar,
      grupo: this.objGrupo,
      integrantes: this.integrantes
    }

    this.navCtrl.push('RegistrarInvitadoGrupoPage', parametros);
  }

  public confirmarEliminarIntegrante(indice, slidingItem) {
    let alert = this.alertCtrl.create({
      title: '¿quitar integrante del grupo?',
      buttons: [
        {
          text: 'no',
          handler: () => { slidingItem.close() }
        },
        {
          text: 'si',
          handler: () => { this.eliminarIntegrante(indice) }
        }
      ]
    });

    alert.present();
  }

  private eliminarIntegrante(indice) {
    let integrante = this.integrantes[indice];

    let cargarPeticion = this.loadingCtrl.create({
      content: 'quitando integrante',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._gp.deleteInvitadoGrupo(
      integrante.id,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    // si cancela antes de que se complete la peticion
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.integrantes.splice(indice, 1);
      } else {
        let alert = this.alertCtrl.create({
          title: 'hubo un error al quitar el integrante',
          buttons: [ {text: 'ok'} ]
        });

        alert.present();
      }
    }).subscribe(
      success => {
        cargarPeticion.dismiss()
      },
      err => {
        cargarPeticion.dismiss();
        this.util.toast('hubo un error al conectarse con el servidor');
      }
    );
  }

}
