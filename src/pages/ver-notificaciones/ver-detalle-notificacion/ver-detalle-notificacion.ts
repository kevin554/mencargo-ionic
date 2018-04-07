import { Component } from '@angular/core';
import { Events, IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { FamiliaProvider, UtilServiceProvider, FamiliarDao } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-detalle-notificacion',
  templateUrl: 'ver-detalle-notificacion.html',
})
export class VerDetalleNotificacionPage {

  private objNotificacion:any;
  private objFamiliar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public loadingCtrl:LoadingController, private _fp: FamiliaProvider,
      private utiles:UtilServiceProvider, private familiarDao: FamiliarDao,
      private events: Events, private platform: Platform) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("notificacion")) {
      this.objNotificacion = navParams.get("notificacion");
    }
  }

  ionViewDidLoad() {
    if (this.objNotificacion.fecha_lectura != "None") {
      return;
    }

    /* marcar como leída */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando notificacion',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.leerNotificacion(
      this.objNotificacion.id,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    )

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.objNotificacion.fecha_lectura = this.utiles.getFechaHoraNormal()

        if (this.platform.is("cordova")) {
          this.insertarEnLocal(this.objNotificacion);
        }

        this.events.publish('disminuirContadorNotificaciones');
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      err => {
        cargarPeticion.dismiss();
      }
    );
  }

  private insertarEnLocal(notificacion) {
    /* el objeto listo para insertar en local */
    let obj = {
      id: notificacion.id,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      fkfamilia: notificacion.fkfamilia,
      fkcondominio: notificacion.condominio,
      fecha: notificacion.fecha_notificacion,
      lectura: notificacion.fecha_lectura
    }

    this.familiarDao.insertar(obj);
  }

}
