import { Component } from '@angular/core';
import { Events, IonicPage, LoadingController, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { AdministradorProvider, MovimientoProvider, UtilServiceProvider } from '../../providers/index.services';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-inicio-administrador',
  templateUrl: 'inicio-administrador.html',
})
export class InicioAdministradorPage {

  private objUsuario:ModeloAdministrador;
  private objCondominio:ModeloCondominio;
  private objRol:ModeloRol;
  private objConfigCondominio:ModeloConfiguracionCondominio;

  private privilegios:ModeloPrivilegio[];
  private botonTocado:string; /* para animar los botones al tocarlos */

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private barcodeScanner: BarcodeScanner, public loadingCtrl: LoadingController,
      public platform: Platform, public popoverCtrl: PopoverController,
      private _mp: MovimientoProvider, private _ap: AdministradorProvider,
      public util: UtilServiceProvider, events: Events,
      private firebase: Firebase) {
    let datos = JSON.parse(this._ap.datos);

    let objetos = {
      usuario: {
        id: datos.id,
        nombre: datos.nombre,
        correo: datos.correo,
        token: datos.token,
        codigo: datos.codigo
      },
      rol: {
        fkrol: datos.fkrol,
        nombre_rol: datos.nombre_rol
      },
      condominio: {
        fkcondominio: datos.fkcondominio,
        nombre_condominio: datos.nombre_condominio
      },
      privilegios: datos.privilegios
    }

    this.objUsuario = objetos.usuario;
    this.objCondominio = objetos.condominio;
    this.objRol = objetos.rol;
    this.privilegios = objetos.privilegios

    events.subscribe("reintentar", () => {
      this.registrarMovimiento("ingreso");
    })

    events.subscribe("registroManual", () => {
      this.solicitudDeIngreso();
    })

    if (this.objUsuario.token.toLowerCase() === 'sin token') {
      console.log(`comprobando si el token es 'sin token', procedemos a obtener el token (el obj es ${JSON.stringify(objetos)})`)

      this.obtenerToken();
    }

    this.recibirNotificaciones();
    this.obtenerParametrosCondominio();
  }

  ionViewWillEnter() {
    this.botonTocado = undefined;
  }

  public tap(boton) {
    this.botonTocado = boton;

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
    }
  }

  public fueTocado(boton) {
    let fueTocado = boton === this.botonTocado

    return fueTocado;
  }

  public desplegarMenu(evento) {
    let parametros = {
      rol: this.objRol,
      condominio: this.objCondominio,
      usuario: this.objUsuario
    };

    let popover = this.popoverCtrl.create('PopoverAdministradorPage', parametros);

    popover.present({
      ev: evento,
    });
  }

  public verViviendas() {
    let parametros = {
      condominio: this.objCondominio
    };

    this.navCtrl.push('ViviendasPage', parametros);
  }

  public verVisitas() {
    let parametros = {
      condominio: this.objCondominio
    };

    this.navCtrl.push('VisitasPage', parametros);
  }

  public registrarMovimiento(tipo) {
    if (tipo === "salida") {
      let parametros = {
        condominio: this.objCondominio,
        hayQueRegistrarSalida: true
      };

      this.navCtrl.push('VisitasPage', parametros);
      return;
    }

    if (!this.platform.is("cordova")) {
      this.procesarMovimiento("ingreso", 106);
      return;
    }

    let preferenciasAndroid:BarcodeScannerOptions = {
      prompt: 'Coloque un código QR en el interior del rectángulo del visor para escanear',
      resultDisplayDuration: 500,
      showTorchButton: true
    }

    this.barcodeScanner.scan(preferenciasAndroid).then( datos => {
      // presionó la tecla atrás
      if (datos.cancelled) {
        this.botonTocado = undefined;
        return;
      }

      this.procesarMovimiento(tipo, datos.text);
    }).catch( error => {
      this.botonTocado = undefined;
    });
  }

  private procesarMovimiento(tipo, datos) {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'verificando invitacion',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._mp.registrarIngreso(datos);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    })

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      /* está así 0: {id, fkinvitado, invitado_nombre, invitado_ci, placa...} */
      let invitado = datos.response.invitacion;

      /* y lo necesito así: {id, fkinvitado, invitado_nombre, invitado_ci, placa...} */
      if (datos.success) {
        invitado = invitado[0];
      }

      let parametros = {
        ingresoExitoso: datos.success,
        mensaje: datos.message,
        usuario: this.objUsuario,
        configuracionCondominio: this.objConfigCondominio,
        invitado: datos.success ? invitado : undefined
      }

      this.navCtrl.push("EstadoIngresoPage", parametros);

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.botonTocado = undefined;
      }, err => {
        this.util.toast('no se pudo conectar al servidor');
        cargarPeticion.dismiss();
        this.botonTocado = undefined;
      }
    )
  }

  public solicitudDeIngreso() {
    let parametros = {
      usuario: this.objUsuario,
      configuracionCondominio: this.objConfigCondominio
    }

    this.navCtrl.push('RegistrarIngresoManualPage', parametros);
  }

  /**
  * Para determinar si se debe mostrar un boton en base al privilegio
  */
  puede(privilegioSolicitado:string):boolean {
    if (this.objRol.nombre_rol === "Super Administrador") return true;

    for (let privilegio of this.privilegios) {
      if (privilegio.boton.toLowerCase() === privilegioSolicitado.toLowerCase() &&
          privilegio.estado) {
        return true;
      }
    }

    return false;
  }

  recibirNotificaciones() {
    /* para poder tomar acciones cuando el usuario toque la notificacion */
    if (this.objUsuario.token != "Sin Token") {
      this.firebase.onNotificationOpen().subscribe(
        /*
        success {
          "priority":"high",
          "tap":false,
          "body":"puede pelarmela",
          "sound":"default",
          "title":"Sr.",
          "content_available":"true"

        }

        como lo devuelve el backend:
        success {
          "google.sent_time":1521608890822,
          "google.ttl":2419200,
          "tap":true,
          "from":"120452764810",
          "google.message_id":"0:1521608890830349%d72bd950d72bd950",
          "collapse_key":"bo.com.cloudbit.tefor"
        }
        */
        success => {
          console.log(`success ${JSON.stringify(success)}`)

          if (success.message_body) {
            let mensaje:string = success.message_body;

            /* si el mensaje es de tipo */
            if (mensaje.toLowerCase().startsWith(`una visita no ha llegado a la vivienda`)) {
              let alerta = success.alerta;

                // this.navCtrl.setRoot('InicioAdministradorPage');
                this.util.toast(`${alerta}`);
              }
            }

        }, err => {
          console.log(`error ${JSON.stringify(err)}`)
        }
      )
    }
  }

  private obtenerToken() {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'obteniendo token',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    this.firebase.getToken().then(
      token => {
        this.actualizarToken(token);
      }).catch(
        error => {
          this.util.toast(`hubo un error al obtener el token (${JSON.stringify(error)})`);
        }
      );

    cargarPeticion.dismiss();
  }

  private actualizarToken(token) {
    console.log(`el token es ${token}`)

    if (!token) {
      return;
    }

    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'almacenando el token',
      enableBackdropDismiss: true
    });

    let peticion = this._ap.actualiazarToken(
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

      console.log(`la respuesta del servidor fue ${JSON.stringify(datos)}`)

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
      content: 'almacenando el token',
      enableBackdropDismiss: true
    });

    let peticion = this._ap.obtenerParametrosCondominio(this.objCondominio.fkcondominio);

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        /* están así {0: {"correo","telefono","celular","ci","placa",
            "permanencia","fkcondominio"}} */
        datos = datos.response;

        /* y los necesito así {"correo","telefono","celular","ci","placa",
            "permanencia","fkcondominio"} */
        datos = datos[0];

        this._ap.setConfiguracionCondominio(datos);
        this.objConfigCondominio = datos;

      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      error => {
        cargarPeticion.dismiss();
        this.objConfigCondominio = this._ap.getConfiguracionCondominio();
      }
    );
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
