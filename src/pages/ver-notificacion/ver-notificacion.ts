import { Component } from '@angular/core';
import { IonicPage, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';
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
  private cargarPeticion:Loading;
  private peticionEnCurso:any;

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

  /* cuando se presione la tecla atrás, es necesario finalizar con cualquier
    peticion que se esté ejecutando */
  ionViewWillLeave() {
    if (this.cargarPeticion) {
      this.cargarPeticion.dismiss();
    }
  }

  public no() {
    // consumir un servicio para notificar al condominio que la visita no llego
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando la notificación',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._fp.notificarVisitaSinLlegada(
      this.objFamiliar.id,
      this.objFamiliar.codigo,
      this.idMovimiento,
      this.idCondominio
    );

    /* si se cancela la espera antes de que finalice la peticion */
    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) { }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
        this.navCtrl.setRoot('InicioPropietarioPage');
      }, err => {
        this.cargarPeticion.dismiss();
      }
    );
  }

  public si() {
    this.navCtrl.setRoot('InicioPropietarioPage');
  }

}
