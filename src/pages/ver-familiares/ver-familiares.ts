import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams, PopoverController } from 'ionic-angular';

import { FamiliaProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-familiares',
  templateUrl: 'ver-familiares.html',
})
export class VerFamiliaresPage {

  private noHayConexion:boolean;
  private objVivienda:any;
  private familiares:any[]; // la lista de familiares
  private cantidadQrDisponibles:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _fp: FamiliaProvider, private alertCtrl: AlertController,
      public popoverCtrl: PopoverController, public util: UtilServiceProvider,
      public loadingCtrl: LoadingController) {
    if (navParams.get("vivienda")) {
      this.objVivienda = navParams.get("vivienda");
    }

    this.cantidadQrDisponibles = Array(3).fill(0);
  }

  ionViewDidLoad() {
    if (this.objVivienda) {
      this.cargarFamiliares();
    }
  }

  public gestoActualizar(refresher) {
    this.cargarFamiliares();
    refresher.complete();
  }

  public irAlInicio() {
    this.navCtrl.setRoot('InicioAdministradorPage');
  }

  public registrarFamiliar() {
    let cuentaDePago = this.familiares.length >= 3;

    let parametros = {
      vivienda: this.objVivienda, /* para obtener la codificacion */
      familiares: this.familiares, /* para agregar el nuevo a la lista */
      dePago: cuentaDePago,
      /* para disminuir en 1 al agregar un familiar*/
      qrDisponibles: this.cantidadQrDisponibles,
      soloLectura: false
    };

    this.navCtrl.push('RegistrarFamiliarPage', parametros);
  }

  public hayQrDisponibles():boolean {
    return this.cantidadQrDisponibles.length > 0;
  }

  public desplegarMenu(evento, familiar) {
    let parametros = {
      familiar: familiar,
      familiares: this.familiares,
      vivienda: this.objVivienda,
      dePago: false, //cuentaDePago,
      soloLectura: false
    };

    let popover = this.popoverCtrl.create('PopoverPage', parametros);
    popover.present({
      ev: evento
    });
  }

  private cargarFamiliares() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando lista de familiares',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.seleccionarPorIdVivienda(this.objVivienda.id);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();

      if (!this.familiares) {
        this.noHayConexion = true;
      }
    });

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.familiares = [];
        this.cantidadQrDisponibles = Array(3).fill(0);

        for (let indice in datos) {
          let familiar = datos[indice];
          this.familiares.push(familiar);
          this.cantidadQrDisponibles.pop();
        }
      }

    }).subscribe(
      success => {
        this.noHayConexion = false;
        cargarPeticion.dismiss();
      },
      err => {
        this.noHayConexion = true;
        cargarPeticion.dismiss();
      }
    );
  }

  public confimarEliminar(indice) {
    let alert = this.alertCtrl.create({
      title: '¿eliminar?',
      buttons: [
        {
          text: 'no'
        },
        {
          text: 'si',
          handler: () => { this.eliminar(indice) }
        }
      ]
    });

    alert.present();
  }

  private eliminar(indice) {
    let familiar = this.familiares[indice];

    let cargarPeticion = this.loadingCtrl.create({
      content: 'eliminando',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.eliminar(familiar.id);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.familiares.splice(indice, 1);

        if (this.familiares.length < 3) {
          this.cantidadQrDisponibles.push(0);
        }
      } else {
        let alert = this.alertCtrl.create({
          title: 'hubo un error al eliminar el familiar',
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
