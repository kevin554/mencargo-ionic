import { Component } from '@angular/core';
import { AlertController, IonicPage, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';
import { AdministradorProvider, EventoProvider, MovimientoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-visitas',
  templateUrl: 'visitas.html',
})
export class VisitasPage {

  private visitas:any[];
  /* lista auxiliar para restaurar la lista despues de una busqueda */
  private visitasAux:any[];
  private objCondominio:any; /* {fkcondominio, nombre_condominio} */
  private objUsuario:any;
  private fecha:any;
  public noHayConexion:boolean;
  public hayQueRegistrarSalida:boolean;
  private busqueda:string;
  cabecera:any = [ "ingreso", "nombre", "vivienda" ];
  columnaOrdenada:string;
  private cargarPeticion:Loading;
  private peticionEnCurso:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _mp: MovimientoProvider, public loadingCtrl: LoadingController,
      public alertCtrl: AlertController, private util: UtilServiceProvider,
      private _ep: EventoProvider, private _ap: AdministradorProvider) {
    this.fecha = this.util.getFechaNormal();
    this.busqueda = "";

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

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

    if (this.columnaOrdenada == columnaSeleccionada) {
      this.columnaOrdenada = undefined;
    } else {
      this.columnaOrdenada = columnaSeleccionada;
    }

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
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando visitas',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._mp.getInvitadosDeCondominio(
      this.objUsuario.id,
      this.objUsuario.codigo,
      this.objCondominio.fkcondominio,
      this.util.getFechaFormateada(this.fecha)

    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;
        this.visitas = [];
        this.visitasAux = [];

        for (let indice in datos) {
          let visita = datos[indice];

          this.visitas.push(visita);
          this.visitasAux.push(visita);
        }
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
          this._ap.setSesionAnulada(true);
        }
      }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
        this.noHayConexion = false;
      },
      err => {
        this.cargarPeticion.dismiss();
        this.noHayConexion = true;
        this.util.toast('Hubo un error al conectarse con el servidor.');
      }
    );
  }

  public buscarVisitas() {
    this.visitas = this.visitasAux;

    if (!this.busqueda) {
      return;
    }

    this.busqueda = this.busqueda.trim();

    this.visitas = this.visitas.filter(
      (visita) => {
        let nombre = visita.invitado_nombre.toLowerCase();
        this.busqueda = this.busqueda.toLowerCase();

        return (nombre.indexOf(this.busqueda) > -1);
      }
    );

    // let cargarPeticion = this.loadingCtrl.create({
    //   content: 'Cargando visitas',
    //   enableBackdropDismiss: true
    // });
    //
    // cargarPeticion.present();
    //
    // let peticion = this._mp.buscarVisitas(
    //   this.objCondominio.fkcondominio,
    //   this.busqueda,
    //   this.util.getFechaFormateada(this.fecha),
    //   this.objUsuario.id,
    //   this.objUsuario.codigo
    // );
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
    //     this.visitas = [];
    //
    //     for (let indice in datos) {
    //       let visita = datos[indice];
    //       this.visitas.push(visita);
    //     }
    //   } else {
    //     let mensaje:string = datos.message;
    //
    //     /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
    //     if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
    //       this.util.toast(mensaje);
    //       this._ap.setSesionAnulada(true);
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
    //     this.util.toast('Hubo un error al conectarse con el servidor.');
    //   }
    // );
  }

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
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Registrando hora de salida.',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion;

    if (visita.tipo == "Invitacion") {
      peticion = this._mp.registrarSalida(
        visita.id,
        this.objUsuario.id,
        this.objUsuario.codigo
      );
    } else if (visita.tipo == "Evento") {
      peticion = this._ep.registrarSalidaInvitadoEvento(
        visita.id,
        this.objUsuario.id,
        this.objUsuario.codigo
      );
    }

    if (!peticion) {
      return;
    }

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        /* fecha y hora */
        let fecha = this.util.getFechaHoraNormal();
        visita.hora_salida = fecha;
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
          this._ap.setSesionAnulada(true);
        }
      }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
        slidingItem.close();
        this.noHayConexion = false;
      }, err => {
        this.cargarPeticion.dismiss();
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
