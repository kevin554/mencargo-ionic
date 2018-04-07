import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { FamiliaProvider } from '../../providers/index.services'

@IonicPage()
@Component({
  selector: 'page-ver-notificacion',
  templateUrl: 'ver-notificacion.html',
})
export class VerNotificacionPage {

  idCondominio:any;
  idMovimiento:any;
  objFamiliar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public loadingCtrl: LoadingController, private _fp: FamiliaProvider) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("idCondominio")) {
      this.idCondominio = navParams.get("idCondominio");
    }

    if (navParams.get("idMovimiento")) {
      this.idMovimiento = navParams.get("idMovimiento");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VerNotificacionPage');
  }

  public no() {
    // consumir un servicio para notificar al condominio que la visita no llego
    let cargarPeticion = this.loadingCtrl.create({
      content: 'notificando',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.notificarVisitaSinLlegada(
      this.objFamiliar.id,
      this.objFamiliar.codigo,
      this.idMovimiento,
      this.idCondominio
    )

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      console.log('la respuesta ' + JSON.stringify(datos));

      if (datos.success) {

      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.navCtrl.setRoot('InicioPropietarioPage');
      }, err => {
        cargarPeticion.dismiss();
      }
    );
  }

  public si() {
    this.navCtrl.setRoot('InicioPropietarioPage');
  }

}
