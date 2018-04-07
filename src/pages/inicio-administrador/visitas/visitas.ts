import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';

import { MovimientoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-visitas',
  templateUrl: 'visitas.html',
})
export class VisitasPage {

  private visitas:any[];
  private objCondominio:any; /* {fkcondominio, nombre_condominio} */
  private fecha:any;
  private noHayConexion:boolean;
  private hayQueRegistrarSalida:boolean;
  private busqueda:string;
  cabecera:any = [ "ingreso", "nombre", "vivienda" ];
  columnaOrdenada:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _mp: MovimientoProvider, public loadingCtrl: LoadingController,
      public alertCtrl: AlertController, private util: UtilServiceProvider) {
    this.fecha = this.util.getFechaNormal();
    this.busqueda = "";

    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");

      this.cargarVisitas();
    }

    if (navParams.get("hayQueRegistrarSalida")) {
      this.hayQueRegistrarSalida = navParams.get("hayQueRegistrarSalida");
    }
  }

  public ordenar(filtro) {
    this.visitas.sort(this.comparadorDinamico(filtro, filtro));
  }

  private comparadorDinamico(nombreColumna, columnaSeleccionada) {
    let tipoOrdenamiento = this.columnaOrdenada == columnaSeleccionada ? -1 : 1;

    this.columnaOrdenada = columnaSeleccionada;

    return function(a, b) {
      if (a[nombreColumna] < b[nombreColumna])
        return -1 * tipoOrdenamiento;

      if (a[nombreColumna] > b[nombreColumna])
        return 1 * tipoOrdenamiento;

      return 0;
    }
  }

  public verVisita(visita) {
    let parametros = {
      visita: visita
    }

    this.navCtrl.push('VerVisitaPage', parametros);
  }

  private cargarVisitas() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando visitas',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._mp.getInvitadosDeCondominio(
      this.objCondominio.fkcondominio, this.fecha);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;
        this.visitas = [];

        for (let indice in datos) {
          let visita = datos[indice];
          this.visitas.push(visita);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.noHayConexion = false;
      },
      err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
        this.util.toast('hubo un error al conectarse con el servidor');
      }
    );
  }

  public buscarVisitas() {
    // if (this.hayQueRegistrarSalida) {
    //   this.buscarVisitasLocal();
    //   return;
    // }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando visitas',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._mp.buscarVisitas(this.objCondominio.fkcondominio, this.busqueda);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;
        this.visitas = [];

        for (let indice in datos) {
          let visita = datos[indice];
          this.visitas.push(visita);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.noHayConexion = false;
      },
      err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
        this.util.toast('hubo un error al conectarse con el servidor');
      }
    );
  }

  // public buscarVisitasLocal() {
  //   let visitas = [];
  //
  //   this.visitas = this.visitas.filter(
  //     visita => {
  //
  //       if ( visita.invitado_nombre.toLowerCase().startsWith(this.busqueda.toLowerCase()) ) {
  //         visitas.push(visita);
  //       }
  //
  //     }
  //   )
  //
  //   console.log(visitas)
  // }

  public confirmarRegistrarSalida(visita, slidingItem) {
    let alert = this.alertCtrl.create({
    title: `¿Registrar salida de ${visita.invitado_nombre} ${visita.invitado_apellido}?`,
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        handler: () => {
          slidingItem.close();
        }
      },
      {
        text: 'Si',
        handler: () => {
          this.registrarSalida(visita, slidingItem);
        }
      }
    ]
  });
  alert.present();
  }

  private registrarSalida(visita, slidingItem) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'registrando hora de salida',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._mp.registrarSalida(visita.id);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        /* fecha y hora */
        let fecha = this.util.getFechaNormal() + this.util.getFechaActual().substring(10, 19);
        visita.hora_salida = fecha;
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

  obtenerHora(fecha:string) {
    if (!fecha || fecha.toLowerCase() === "none") {
      return "";
    }

    /* hay 10 letras que ocupa la fecha  */
    return fecha.substring(10, fecha.length);
  }

  noSalioDelCondominio(visita):boolean {
    if (!visita.hora_salida) {
      return true;
    }

    let horaSalida = visita.hora_salida.trim().toLowerCase()

    return horaSalida != "none";
  }

}
