import { Component } from '@angular/core';
import { Events, IonicPage, Loading, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { FamiliaProvider, UtilServiceProvider, FamiliarDao } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-notificaciones',
  templateUrl: 'ver-notificaciones.html',
})
export class VerNotificacionesPage {

  private objFamiliar:any;
  private notificaciones:any[];
  private cargarPeticion:Loading;
  private peticionEnCurso:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _fp: FamiliaProvider, public loadingCtrl: LoadingController,
      private utiles: UtilServiceProvider, private familiarDao: FamiliarDao,
      public events: Events, private platform: Platform) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }
  }

  ionViewDidLoad() {
    this.cargarNotificaciones();
  }

  /* voy a revisar la lista de notificaciones para ver si queda alguna sin
    leer */
  ionViewDidEnter() {
    if (this.notificaciones) {
      this.verificarSiExisteAlgunaNotificacionSinLeer();
    }
  }

  verificarSiExisteAlgunaNotificacionSinLeer() {
    this.events.publish("hayNotificacionSinLeer", false);

    for (let notificacion of this.notificaciones) {
      if (notificacion.fecha_lectura == "None") {
        this.events.publish("hayNotificacionSinLeer", true);
        break;
      }
    }
  }

  /* cuando se presione la tecla atrás, es necesario finalizar con cualquier
    peticion que se esté ejecutando */
  ionViewWillLeave() {
    if (this.cargarPeticion) {
      this.cargarPeticion.dismiss();
    }
  }

  private cargarNotificaciones() {
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando notificaciones',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._fp.obtenerNotificaciones(
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.notificaciones = [];

        for (let indice in datos) {
          let notificacion = datos[indice];
          this.notificaciones.push(notificacion);

          if (this.platform.is("cordova")) {
            this.agregarNotificacionLocal(notificacion);
          }

          if (notificacion.fecha_lectura == "None") {
            this.events.publish("hayNotificacionSinLeer", true);
          }
        }

        /* voy a ordenar las notificaciones */
        this.utiles.ordenarPorId(this.notificaciones, "id", -1);
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.utiles.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
      },
      err => {
        this.cargarPeticion.dismiss();
        this.cargarNotificacionesLocal();
      }
    );
  }

  cargarNotificacionesLocal() {
    if (this.platform.is("cordova")) {
      this.familiarDao.getDatabaseState().subscribe( listo => {
        if (listo) {
          this.familiarDao.seleccionarTodas().then( (datos)  => {

            this.notificaciones = [];

            for (let i in datos) {
              let notificacion = datos[i];
              this.notificaciones.push(notificacion);

              this.verificarSiExisteAlgunaNotificacionSinLeer();
            }

            /* voy a ordenar las notificaciones */
            this.utiles.ordenarPorId(this.notificaciones, "id", -1);
          }); /* fin de familiarDao.seleccionarTodas() */
        }

      }); /* fin del getDatabaseState */
    }
  }

  private agregarNotificacionLocal(notificacion) {
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

  public eliminar(indice, slidingItem) {
    let notificacion = this.notificaciones[indice];

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Eliminando la notificación',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._fp.eliminarNotificacion(
      notificacion.id,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        this.notificaciones.splice(indice, 1);

        this.verificarSiExisteAlgunaNotificacionSinLeer();

        if (this.platform.is("cordova")) {
          this.familiarDao.eliminar(notificacion.id);
        }

      }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
        slidingItem.close();
      }, err => {
        this.cargarPeticion.dismiss();
        slidingItem.close();
      }
    );
  }

  public obtenerSoloFecha(fecha:string) {
    return fecha.substr(0, 10);
  }

  public verNotificacion(notificacion) {
    let parametros = {
      familiar: this.objFamiliar,
      notificacion: notificacion
    }

    this.navCtrl.push('VerDetalleNotificacionPage', parametros);
  }

}
