import { Component, ViewChild } from '@angular/core';
import { AlertController, Events, IonicPage, LoadingController, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { AdministradorProvider, EventoProvider, MovimientoProvider, UtilServiceProvider } from '../../providers/index.services';
import { Firebase } from '@ionic-native/firebase';
import { SwalComponent } from '@toverux/ngx-sweetalert2';

@IonicPage()
@Component({
  selector: 'page-inicio-administrador',
  templateUrl: 'inicio-administrador.html',
})
export class InicioAdministradorPage {

  @ViewChild('alertaIngreso') public alertaIngreso: SwalComponent;
  private objUsuario:ModeloAdministrador;
  private objCondominio:ModeloCondominio;
  private objRol:ModeloRol;
  private objConfigCondominio:ModeloConfiguracionCondominio;

  private privilegios:ModeloPrivilegio[];
  private botonTocado:string; /* para animar los botones al tocarlos */

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private barcodeScanner: BarcodeScanner, events: Events,
      public platform: Platform, public popoverCtrl: PopoverController,
      private _mp: MovimientoProvider, private _ap: AdministradorProvider,
      public util: UtilServiceProvider, public loadingCtrl: LoadingController,
      private firebase: Firebase, private alertCtrl: AlertController,
      private _ep: EventoProvider) {
    // if (navParams.get("usuario")) {
    //   this.objUsuario = navParams.get("usuario");
    // }

    // let usuario = this._ap.getUsuario();
    // console.log(usuario);
    // let datos = JSON.parse(this._ap.datos);
    // this._ap.cargarStorage().then(
    //   () => {
    //     // let datos = JSON.parse(this._ap.preferencias);
    //
    //     // datos = datos.usuario;
    //
    //     // let objetos = {
    //     //   usuario: {
    //     //     id: datos.id,
    //     //     nombre: datos.nombre,
    //     //     correo: datos.correo,
    //     //     token: datos.token,
    //     //     codigo: datos.codigo
    //     //   },
    //     //   rol: {
    //     //     fkrol: datos.fkrol,
    //     //     nombre_rol: datos.nombre_rol
    //     //   },
    //     //   condominio: {
    //     //     fkcondominio: datos.fkcondominio,
    //     //     nombre_condominio: datos.nombre_condominio
    //     //   },
    //     //   privilegios: datos.privilegios
    //     // }
    //
        // this.objUsuario = objetos.usuario;
        // this.objCondominio = objetos.condominio;
        // this.objRol = objetos.rol;
        // this.privilegios = objetos.privilegios;

        this.objUsuario = this._ap.getUsuario();
        this.objCondominio = this._ap.getCondominio();
        this.objRol = this._ap.getRol();
        this.privilegios = this._ap.getPrivilegios();

        events.subscribe("reintentar", () => {
          this.registrarMovimiento("ingreso");
        });

        events.subscribe("registroManual", () => {
          this.solicitudDeIngreso();
        });

        // events.subscribe("gestionarPermisos", () => {
        //   this.gestionarPermisos();
        // });

        // if (this.objUsuario.token.toLowerCase() === 'sin token') {
          this.obtenerToken();
        // }

        this.recibirNotificaciones();
        this.obtenerParametrosCondominio();
      // }
    // );

  }

  ionViewWillEnter() {
    this.botonTocado = undefined;
  }

  /**
  * muestra en pantalla completa si el ingreso/salida fue exitoso o no
  */
  private mostrarEstadoIngreso(mensaje) {
    this.alertaIngreso.title = mensaje;
    this.alertaIngreso.type = "warning";

    this.alertaIngreso.show();
  }

  public tap(boton) {
    this.botonTocado = boton;

    if (this._ap.isSesionAnulada()) {
      this.mostrarMensajeSesionAnulada();
      this.botonTocado = undefined;
      return;
    }
    // if (this._ap.getSesionAnulada()) {
    //   this.mostrarMensajeSesionAnulada();
    //   this.botonTocado = undefined;
    //   return;
    // }

    switch (boton) {
      case "Ver Viviendas":
        this.verViviendas();
        break;

      case "Registrar Ingreso":
       this.registrarMovimiento("ingreso");
       break;

      case "Ver Visitas":
        this.verVisitas();
        break;

      case "Solicitud de Ingreso":
        this.solicitudDeIngreso();
        break;

      case "Registrar Salida":
        this.registrarMovimiento("salida");
        break;

      case "Enviar notificaciones":
        this.enviarNotificaciones();
        break;
    }
  }

  public fueTocado(boton) {
    return boton === this.botonTocado;
  }

  public desplegarMenu(evento) {
    let parametros = {
      rol: this.objRol,
      condominio: this.objCondominio,
      usuario: this.objUsuario
    };

    let popover = this.popoverCtrl.create("PopoverAdministradorPage", parametros);

    popover.present({
      ev: evento
    });
  }

  public verViviendas() {
    let parametros = {
      condominio: this.objCondominio,
      usuario: this.objUsuario
    };

    this.navCtrl.push("ViviendasPage", parametros);
  }

  public verVisitas() {
    let parametros = {
      condominio: this.objCondominio,
      usuario: this.objUsuario
    };

    this.navCtrl.push("VisitasPage", parametros);
  }

  public registrarMovimiento(tipo) {
    if (tipo === "salida") {
      let parametros = {
        condominio: this.objCondominio,
        hayQueRegistrarSalida: true,
        usuario: this.objUsuario
      };

      this.navCtrl.push("VisitasPage", parametros);
      return;
    }

    if (!this.platform.is("cordova")) {
      let alert = this.alertCtrl.create({
        title: 'Ingreso:',
        inputs: [
          {
            name: 'idMovimiento'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Aceptar',
            handler: data => {
              this.procesarMovimiento("ingreso", data.idMovimiento);
            }
          }
        ]
      });

      alert.present();
      return;
    }

    let preferenciasAndroid:BarcodeScannerOptions = {
      prompt: 'Coloque un código QR en el interior del rectángulo del visor para escanear',
      resultDisplayDuration: 0
    }

    this.barcodeScanner.scan(preferenciasAndroid).then( datos => {
      /* presionó la tecla atrás */
      if (datos.cancelled) {
        this.botonTocado = undefined;
        return;
      }

      this.procesarMovimiento(tipo, datos.text);
    }).catch( error => {
      this.botonTocado = undefined;
    });
  }

  private procesarMovimiento(tipo, datos:string) {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Verificando invitación',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion;

    /* es un evento */
    if (datos.endsWith("e")) {
      let idEvento = datos.substring(0, datos.length-1);

      peticion = this._ep.obtenerEventoUsuario(
        idEvento,
        this._ap.getId(),
        this._ap.getCodigo()
      );
    } else {
      peticion = this._mp.registrarIngreso(
        datos,
        this.objUsuario.id,
        this.objUsuario.codigo
      );
    }

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    })

    let peticionEnCurso = peticion.map( resp => {
      let respuesta = resp.json();

      if (respuesta.success) {

        if (datos.endsWith("e")) {
          respuesta = respuesta.response;

          let hoy = new Date();

          let dia = respuesta.fecha.substring(8, 10);
          let mes = respuesta.fecha.substring(5, 7);;
          let año = respuesta.fecha.substring(0, 4);

          let fechaInvitacion = new Date(año, mes - 1, dia);

          /* si la invitacion es para una fecha futura */
          if (hoy < fechaInvitacion) {
            this.mostrarEstadoIngreso("El evento es para el dia " +
                this.util.obtenerDia(fechaInvitacion.getDay()) + " " + dia);
            return;
          }

          let fechaFinalizacionEvento = new Date();
          fechaFinalizacionEvento.setDate(fechaInvitacion.getDate() + 2);

          if (hoy > fechaFinalizacionEvento) {
            this.mostrarEstadoIngreso("El evento ya finalizó");
            return;
          }

          let invitados = respuesta.invitados;
          let listaInvitados:any[] = [];

          for (let i in invitados) {
            let invitado = invitados[i];
            listaInvitados.push(invitado);
          }

          let parametros = {
            usuario: this.objUsuario,
            condominio: this.objCondominio,
            evento: respuesta,
            invitados: listaInvitados,
            configuracionCondominio: this.objConfigCondominio
          }

          this.navCtrl.push("InvitadosEventoPage", parametros);
        } else {
          let invitado = respuesta.response.invitacion[0];

          let parametros = {
            ingresoExitoso: respuesta.success,
            mensaje: respuesta.message,
            usuario: this.objUsuario,
            configuracionCondominio: this.objConfigCondominio,
            invitado: respuesta.success ? invitado : undefined
          }

          this.navCtrl.push("EstadoIngresoPage", parametros);
        }

      } else {
        let mensaje:string = respuesta.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
          this._ap.setSesionAnulada(true);
        } else if (mensaje == "La invitación no es valida o ya fue utilizada.") {
          this.mostrarEstadoIngreso(mensaje);
        } else {

          if (datos.endsWith("e")) {
            this.mostrarEstadoIngreso("El evento no existe o ya finalizó.");
          } else {
            // let invitado = respuesta.response.invitacion[0];

            let parametros = {
              ingresoExitoso: respuesta.success,
              mensaje: respuesta.message,
              usuario: this.objUsuario,
              configuracionCondominio: this.objConfigCondominio,
              invitado: undefined
            }

            this.navCtrl.push("EstadoIngresoPage", parametros);
            // this.mostrarEstadoIngreso("La invitación no existe o es para otra " +
            //   "fecha en adelante.");
          }

        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.botonTocado = undefined;
      }, err => {
        this.util.toast('No se pudo conectar al servidor.');
        cargarPeticion.dismiss();
        this.botonTocado = undefined;
      }
    )
  }

  public mostrarMensajeSesionAnulada() {
    this.util.toast("Se anuló la sesión de este dispositivo");
  }

  public solicitudDeIngreso() {
    let parametros = {
      usuario: this.objUsuario,
      configuracionCondominio: this.objConfigCondominio
    }

    this.navCtrl.push("RegistrarIngresoManualPage", parametros);
  }

  /**
  * Para determinar si se debe mostrar un boton en base al privilegio
  */
  public puede(privilegioSolicitado:string):boolean {
    // if (!this.objRol) return false;

    if (this.objRol.nombre_rol === "Super Administrador") return true;

    for (let privilegio of this.privilegios) {
      if (privilegio.boton.toLowerCase() === privilegioSolicitado.toLowerCase() &&
          privilegio.estado) {
        return true;
      }
    }

    return false;
  }

  public recibirNotificaciones() {
    // console.log("objUsuario.token " + this.objUsuario.token);
    if (this.objUsuario.token == "Sin Token") return;

    /* para poder tomar acciones cuando el usuario toque la notificacion */
    this.firebase.onNotificationOpen().subscribe(
      success => {

        // console.log("success on firebase.onNotificationOpen " + JSON.stringify(success));
        if (success.message_body) {
          let mensaje:string = success.message_body;

          /* si el mensaje es de tipo */
          if (mensaje.toLowerCase().startsWith(`una visita no ha llegado a la vivienda`)) {
            let alerta = success.alerta;
            this.mostrarEstadoIngreso(alerta);
          }
        }

      }, err => {
        console.log(`error ${JSON.stringify(err)}`)
      }
    );
  }

  private obtenerToken() {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Obteniendo token',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    this.firebase.getToken().then(
      token => {
        this.actualizarToken(token);
      }).catch(
        error => {
          this.util.toast(`Hubo un error al obtener el token (${JSON.stringify(error)})`, 2000);
        }
      );

    cargarPeticion.dismiss();
  }

  private actualizarToken(token) {
    if (!token) return;

    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Almacenando el token'
    });

    let peticion = this._ap.actualizarToken(
      this.objUsuario.id,
      this.objUsuario.codigo,
      token
    );

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();
      // console.log("actualizar token: " + JSON.stringify(datos));
      if (datos.success) {
        this.objUsuario.token = token;
        this._ap.setToken(token);

        this.recibirNotificaciones();
      } else {

      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      error => {
        cargarPeticion.dismiss();
      }
    );
  }

  private obtenerParametrosCondominio() {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Obteniendo las preferencias del condominio'
    });

    let peticion = this._ap.obtenerParametrosCondominio(
      this.objCondominio.fkcondominio,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response[0];

        this._ap.setParametrosCondominio(datos);
        this.objConfigCondominio = datos;
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      error => {
        cargarPeticion.dismiss();
        this.objConfigCondominio = this._ap.getParametrosCondominio();
      }
    );
  }

  private enviarNotificaciones() {
    let parametros = {
      condominio: this.objCondominio,
      usuario: this.objUsuario
    };

    this.navCtrl.push("SeleccionarDestinatariosNotificacionPage", parametros);
  }

}

interface ModeloAdministrador {

  id:number;
  nombre:string;
  correo:string;
  token:string;
  codigo:string;
}

interface ModeloCondominio {

  fkcondominio:number;
  nombre_condominio:string;

}

interface ModeloRol {

  fkrol:number;
  nombre_rol:string;

}

interface ModeloPrivilegio {

  id:number;
  fkuser:number;
  boton:string;
  estado:boolean;

}

interface ModeloConfiguracionCondominio {

  correo:string;
  telefono:any;
  celular:any;
  ci:any;
  placa:string;
  permanencia:string;
  fkcondominio:any;

}
