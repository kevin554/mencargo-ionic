import { Component } from '@angular/core';
import { Events, IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { FamiliaProvider, UtilServiceProvider, FamiliarDao } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-notificaciones',
  templateUrl: 'ver-notificaciones.html',
})
export class VerNotificacionesPage {

  private objFamiliar:any;
  private notificaciones:any[];
  private noHayConexion:boolean;

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

  private cargarNotificaciones() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando notificaciones',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.obtenerNotificaciones(
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();

      if (!this.notificaciones) {
        this.noHayConexion = true;
      }
    })

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.notificaciones = [];

        for (let indice in datos) {
          let notificacion = datos[indice];
          this.notificaciones.push(notificacion);

          // if (this.platform.is("cordova")) {
          //   this.agregarNotificacionLocal(notificacion);
          // }
        }

        /* voy a ordenar las notificaciones */
        this.notificaciones.sort(this.comparadorDinamico("id"));
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.utiles.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        this.noHayConexion = false;
        cargarPeticion.dismiss();
      },
      err => {
        // this.noHayConexion = true;
        cargarPeticion.dismiss();
        // this.cargarNotificacionesLocal();
      }
    );
  }

  // cargarNotificacionesLocal() {
  //   if (this.platform.is("cordova")) {
  //     this.familiarDao.getDatabaseState().subscribe( listo => {
  //       if (listo) {
  //         this.familiarDao.seleccionarTodas().then( (datos)  => {
  //           if (datos.length == 0) {
  //             this.noHayConexion = true;
  //             return;
  //           }
  //
  //           this.notificaciones = [];
  //
  //           for (let i in datos) {
  //             let notificacion = datos[i];
  //             this.notificaciones.push(notificacion);
  //           }
  //
  //           /* voy a ordenar las notificaciones */
  //           this.notificaciones.sort(this.comparadorDinamico("id"));
  //         }); /* fin de familiarDao.seleccionarTodas() */
  //       }
  //
  //     }); /* fin del getDatabaseState */
  //   }
  // }

  // private agregarNotificacionLocal(notificacion) {
  //   /* el objeto listo para insertar en local */
  //   let obj = {
  //     id: notificacion.id,
  //     titulo: notificacion.titulo,
  //     mensaje: notificacion.mensaje,
  //     fkfamilia: notificacion.fkfamilia,
  //     fkcondominio: notificacion.condominio,
  //     fecha: notificacion.fecha_notificacion,
  //     lectura: notificacion.fecha_lectura
  //   }
  //
  //   this.familiarDao.insertar(obj);
  // }

  private comparadorDinamico(nombreColumna) {
    /* 1 ascendente, -1 descendente */
    let tipoOrdenamiento = -1;

    return function(a, b) {
      if (a[nombreColumna] < b[nombreColumna])
        return -1 * tipoOrdenamiento;

      if (a[nombreColumna] > b[nombreColumna])
        return 1 * tipoOrdenamiento;

      return 0;
    }
  }

  public eliminar(indice, slidingItem) {
    let notificacion = this.notificaciones[indice];

    let cargarPeticion = this.loadingCtrl.create({
      content: 'eliminando la notificacion',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.eliminarNotificacion(
      notificacion.id, this.objFamiliar.id, this.objFamiliar.codigo);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        this.notificaciones.splice(indice, 1);

        /* si la notificacion no fué leída */
        if (notificacion.fecha_lectura == "None") {
          this.events.publish('disminuirContadorNotificaciones');
        }

        // this.familiarDao.eliminar(notificacion.id);
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        slidingItem.close();
        this.noHayConexion = false;
      }, err => {
        cargarPeticion.dismiss();
        slidingItem.close();
        this.noHayConexion = true;
      }
    )
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
