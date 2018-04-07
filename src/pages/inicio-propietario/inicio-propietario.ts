import { Component, ChangeDetectorRef, ElementRef, Renderer } from '@angular/core';
import { AlertController, Events, IonicPage, LoadingController, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { FamiliaProvider, UsuarioProvider, UtilServiceProvider, ViviendaProvider, FamiliarDao } from '../../providers/index.services';
import { CallNumber } from '@ionic-native/call-number';
import { Firebase } from '@ionic-native/firebase';
import { Badge } from '@ionic-native/badge';

/*
hay 3 tipos de notificaciones, 2 de tipo visita y 1 del backend
respecto a las visitas
  la app abierta
    "tap":false,
    "body":"Melina Fuster, su visita Leandro ha llegado y se dirige a su domicilio.",
    "title":"Su visita esta en camino."

  la app en 2do plano
    "google.sent_time":1522700715231,
    "google.ttl":2419200,
    "message_body":"Melina Fuster, su visita Dominick ha llegado y se dirige a su domicilio.",
    "message_title":"Su visita esta en camino.",
    "tap":true,
    "from":"120452764810",
    "google.message_id":"0:1522700715238896%d72bd950d72bd950",
    "collapse_key":"bo.com.cloudbit.tefor"

cuando llega la visita
  la app abierta
    "message_body":"Melina hace 1 minutos que ingresó su visita. ¿Ha llegado a su domicilio?",
    "message_title":"MENCARGO",
    "idmovimiento":"562",
    "tap":false,
    "body":"Melina hace 1 minutos que ingresó su visita. ¿Ha llegado a su domicilio?",
    "title":"MENCARGO"

  la app en 2do plano
    "google.sent_time":1522446783674,
    "google.ttl":2419200,
    "message_body":"Melina hace 1 minutos que ingresó su visita. ¿Ha llegado a su domicilio?",
    "message_title":"MENCARGO",
    "idmovimiento":"569",
    "tap":true,
    "from":"120452764810",
    "google.message_id":"0:1522446783680936%d72bd950d72bd950",
    "collapse_key":"bo.com.cloudbit.tefor"

desde el backend
  la app abierta:
    "tap":false,
    "title":"Mencargo"
    "body":"Gracias por utilizar la app",

  la app en 2do plano
    "google.sent_time":1522700573570,
    "google.ttl":2419200,
    "message_body":"Notificacion de prueba",
    "message_title":"Mencargo",
    "tap":true,"from":"120452764810",
    "google.message_id":"0:1522700573577242%d72bd950d72bd950",
    "collapse_key":"bo.com.cloudbit.tefor"
*/
@IonicPage()
@Component({
  selector: 'page-inicio-propietario',
  templateUrl: 'inicio-propietario.html',
})
export class InicioPropietarioPage {

  private idFamiliar:any;
  private objPropietario:Familiar;
  private botonTocado:string; /* para animar los botones al tocarlos */
  private animarBotonNotificacion:boolean;
  private animarBotonNotificacionOtraVez:boolean = true;
  private contadorNotificaciones:number;
  // private seCargoDelServidor:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public loadingCtrl: LoadingController, public popoverCtrl: PopoverController,
      private firebase: Firebase, private _fp: FamiliaProvider,
      private _up: UsuarioProvider, private util: UtilServiceProvider,
      private callNumber: CallNumber, private alertCtrl: AlertController,
      private _vp: ViviendaProvider, private familiarDao: FamiliarDao,
      private platform: Platform, private events: Events,
      public detectorRef: ChangeDetectorRef, private badge: Badge,
      public element: ElementRef, public renderer: Renderer) {
    this.contadorNotificaciones = 0;
    // this.badge.clear().then(succes=> {}).catch(err => {});;

    if (_up.activo()) {
      this.idFamiliar = _up.getId();
      this.objPropietario = _up.getUsuario();
    }

    if (this.objPropietario.token.toLowerCase() === 'sin token') {
      this.obtenerToken();
    }

    this.recibirNotificaciones();

    this.cargarNotificacionesServidor();

    // this.cargarNotificacionesLocal();

    events.subscribe("disminuirContadorNotificaciones", () => {
      this.contadorNotificaciones--;
      // this.badge.decrease(1).then(succes=> {}).catch(err => {});
      detectorRef.detectChanges();
    });

    events.subscribe("aumentarContadorNotificaciones", () => {
      this.contadorNotificaciones++;

      this.firebase.setBadgeNumber(this.contadorNotificaciones);
      // this.badge.increase(1).then(succes=> {}).catch(err => {});
      detectorRef.detectChanges();
    });

    events.subscribe("animar", (animar) => {
      // this.renderer.setElementStyle(animar, "animation", "swing linear 1s")
      // this.detectorRef.detectChanges();
      this.renderer.setElementStyle(animar, "animation", "ta-da linear 1s")
      this.renderer.setElementStyle(animar, "animation-iteration-count", "1")
      this.renderer.setElementStyle(animar, "transform-origin", "50% 50%")
    });

    events.subscribe("desanimar", (animar) => {
      this.renderer.setElementStyle(animar, "animation", "none")
      this.events.publish("animar", animar);
      // this.detectorRef.detectChanges();

    });
  }

  // cargarNotificacionesLocal() {
  //   if (this.platform.is("cordova")) {
  //     this.familiarDao.getDatabaseState().subscribe( listo => {
  //       if (listo) {
  //         this.familiarDao.seleccionarTodas().then( (datos)  => {
  //           this.contadorNotificaciones = 0;
  //
  //           for (let i in datos) {
  //             let notificacion = datos[i];
  //
  //             if (notificacion.lectura == "None") {
  //               this.contadorNotificaciones++;
  //             }
  //           }
  //
  //           if (this.seCargoDelServidor) {
  //             return;
  //           }
  //
  //           if (datos.length == 0) {
  //             this.cargarNotificacionesServidor();
  //             return;
  //           }
  //
  //
  //         }); /* fin de familiarDao.seleccionarTodas() */
  //       }
  //
  //     }); /* fin del getDatabaseState */
  //   }
  // }

  cargarNotificacionesServidor() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando notificaciones',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.obtenerNotificaciones(
      this.objPropietario.id,
      this.objPropietario.codigo
    )

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        // this.seCargoDelServidor = true;

        datos = datos.response;

        this.contadorNotificaciones = 0;
        this.badge.clear();

        let notificaciones = [];

        for (let indice in datos) {
          let notificacion = datos[indice];
          notificaciones.push(notificacion);

          // if (this.platform.is("cordova")) {
          //   this.agregarNotificacionLocal(notificacion);
          // }

          if (notificacion.fecha_lectura == "None") {
            this.events.publish("aumentarContadorNotificaciones");
          }
        }

      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        // this.cargarNotificacionesLocal();
      },
      err => {
        cargarPeticion.dismiss();
      }
    );
  }

  // agregarNotificacionLocal(notificacion) {
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

  private recibirNotificaciones() {
    /* para poder tomar acciones cuando el usuario toque la notificacion */
    if (this.objPropietario.token != "Sin Token") {
      this.firebase.onNotificationOpen().subscribe(

        success => {

          console.log(`success ${JSON.stringify(success)}`);

          if (success.message_body) {
            let mensaje:string = success.message_body;

            /* si el mensaje es de tipo 'Nico hace X minutos...' */
            if (mensaje.startsWith(`${this.objPropietario.nombre} hace `)) {
              let idMovimiento = success.idmovimiento;

              let parametros = {
                familiar: this.objPropietario,
                idCondominio: this.objPropietario.condominio,
                idMovimiento: idMovimiento
              }

              // si no fue tocada, deberia mostrar una notificacion local talvez
              if (success.tap) {
                this.navCtrl.setRoot('VerNotificacionPage', parametros);
              } else {
                this.navCtrl.push('VerNotificacionPage', parametros);
              }

              /* si el mensaje es de tipo 'Nicolas Duran, su visita X ha llegado
                y se dirige a su domicilio' */
            } else if (mensaje.startsWith(`${this.objPropietario.nombre} ${this.objPropietario.apellido}, su visita`)) {
              /* si la app estaba ejecutandose, debería mostrar una notificacion
                local*/
              if (!success.tap) {
                this.util.toast(mensaje)
              }
            } else {
              this.events.publish("aumentarContadorNotificaciones");

              /* si la app estaba abierta, animo el boton de notificaciones e
                incremento el contador de no-leídos en 1*/
              if (!success.tap) {
                // this.animarBotonNotificacion = false;
                // this.animarBotonNotificacion = true;

              } else {
                this.verNotificaciones();
              }

            }

          } /* fin if(success.message_body) */

          // /* así se reciben las notificaciones de visitas */
          // if (success.message_body) {
          //   let mensaje:string = success.message_body;
          //
          //   /* si el mensaje es de tipo 'Nico hace X minutos...' */
          //   if (mensaje.startsWith(`${this.objPropietario.nombre} hace `)) {
          //     let idMovimiento = success.idmovimiento;
          //
          //     /* si llegó en segundo plano */
          //     // si no fue tocada, deberia mostrar una notificacion local talvez
          //     let parametros = {
          //       familiar: this.objPropietario,
          //       idCondominio: this.objPropietario.condominio,
          //       idMovimiento: idMovimiento
          //     }
          //
          //     /* si llegó en segundo plano */
          //     if (success.tap) {
          //       this.navCtrl.setRoot('VerNotificacionPage', parametros);
          //     } else { /* si la app ya estaba abierta */
          //       this.navCtrl.push('VerNotificacionPage', parametros);
          //     }
          //   } /* fin */
          //
          //
          //   /* si el mensaje es de tipo 'Nicolas Duran, su visita X ha llegado y se dirige a su domicilio' */
          //   if (mensaje.startsWith(`${this.objPropietario.nombre} ${this.objPropietario.apellido}, su visita`)) {
          //
          //     /* si la app estaba ejecutandose, debería mostrar una notificacion local*/
          //     if (!success.tap) {
          //       this.util.toast(mensaje)
          //     }
          //   } /* fin */
          //
          // } else if (success.body) { /* así se recibe desde el backend */
          //   let mensaje:string = success.body;
          //
          //   /* si el mensaje es de tipo 'Nicolas Duran, su visita X ha llegado y se dirige a su domicilio' */
          //   if (mensaje.startsWith(`${this.objPropietario.nombre} ${this.objPropietario.apellido}, su visita`)) {
          //     this.events.publish("aumentarContadorNotificaciones");
          //   } else if (mensaje.startsWith(`${this.objPropietario.nombre} hace `)) {
          //
          //   } else { // si es desde el backend
          //
          //     if (!success.tap) {
          //
          //     } else {
          //       this.verNotificaciones();
          //     }
          //
          //     this.events.publish("aumentarContadorNotificaciones");
          //   } /* fin de esta especie de switch */
          //
          // }

        }, err => {
          console.log(`error ${JSON.stringify(err)}`)
        }
      )
    }
  }

  ionViewWillEnter() {
    this.botonTocado = undefined;
    this.animarBotonNotificacion = false;
  }
  claseCss:string;
  public tap(boton, animar?:ElementRef) {
    this.botonTocado = boton;

    switch (boton) {
      case "Enviar Invitacion":
        this.enviarInvitacion();
        break;

      case "Contactos":
       this.verContactos();
       break;

      case "Soporte Tecnico":
        this.solicitarSoporte();
        break;

      case "Crear Evento":
        this.crearEvento();
        break;

      case "Notificaciones":
        // console.log(this.animarBotonNotificacion)
        console.log(animar)

        // this.events.publish("desanimar", animar);


        this.animarBotonNotificacion = !this.animarBotonNotificacion;
        this.animarBotonNotificacionOtraVez = !this.animarBotonNotificacionOtraVez;
        // this.animarBotonNotificacion = false;
        // this.animarBotonNotificacion = true;
        // console.log(animar)

        // this.verNotificaciones();
        break;
    }
  }

  animate() {
    this.animarBotonNotificacion = true;

    // this.detectorRef.reattach();

  }

  desanimate() {
    // this.detectorRef.detach();
    this.animarBotonNotificacion = false;
  }

  /**
  * Útil para dar una sensacion de pulsación en los botones
  */
  public fueTocado(boton) {
    let fueTocado = boton === this.botonTocado;

    return fueTocado;
  }

  public desplegarMenu(evento) {
    let parametros = {
      familiar: this.objPropietario
    }
    let popover = this.popoverCtrl.create('PopoverPropietarioPage', parametros);

    popover.present({
      ev: evento
    });
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
        error => { }
      );

    cargarPeticion.dismiss();
  }

  private actualizarToken(token) {
    if (!token) {
      return;
    }

    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'almacenando el token',
      enableBackdropDismiss: true
    });

    let peticion = this._fp.actualizarToken(this.idFamiliar, this.objPropietario.codigo, token);

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.objPropietario.token = token;
        this._up.ingresar(this.objPropietario);

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

  public enviarInvitacion() {
    let parametros = {
      idFamiliar: this.idFamiliar,
      familiar: this.objPropietario,
      soloRegistrarAmigo: false
    }

    this.navCtrl.push("RegistrarInvitacionPage", parametros);
  }

  public verContactos() {
    let parametros = {
      familiar: this.objPropietario
    };

    this.navCtrl.push('AmigosPage', parametros);
  }

  public solicitarSoporte() {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'obteniendo el numero del condominio',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.obtenerParametrosCondominio(
      this.objPropietario.id,
      this.objPropietario.codigo,
      this.objPropietario.condominio
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    })

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        /* los datos están así -> 0: {correo, telefono, celular, fkcondominio} */
        datos = datos.response;

        /* y los necesito así -> {correo, telefono, celular, fkcondominio} */
        datos = datos[0];
        let telefono = datos.telefono;

        this._up.setTelefonoCondominio(telefono);
        this.confirmarRealizarLlamada(telefono);
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.botonTocado = undefined; /* el boton a su color normal */
      }, err => {
        cargarPeticion.dismiss();
        this.botonTocado = undefined; /* el boton a su color normal */

        /* hubo un error al procesar la peticion, por lo tanto intentaré
          obtener el telefono si ya lo tenía guardado anteriormente */
        let telefono = this._up.getTelefonoCondominio();
        if (telefono) {
          this.realizarLlamada(telefono);
        }
      }
    )
  }

  private confirmarRealizarLlamada(telefono) {
    let alert = this.alertCtrl.create({
      message: `Llamar a la administracion del condominio al ${telefono}`,
      buttons: [
        {
          text: 'cancelar',
          role: 'cancel'
        },
        {
          text: 'llamar',
          handler: () => {
            this.realizarLlamada(telefono);
          }
        }
      ]
    });

    alert.present();
  }

  private realizarLlamada(telefono) {
    this.callNumber.callNumber(telefono, true).then(
      result => { }
    ).catch(
      error => { }
    );
  }

  private crearEvento() {
    let parametros = {
      familiar: this.objPropietario
    }

    this.navCtrl.push('CrearEventoPage', parametros);
  }

  private verNotificaciones() {
    let parametros = {
      familiar: this.objPropietario
    }

    this.navCtrl.push('VerNotificacionesPage', parametros);
  }

}

interface Familiar {

  id:any;
  nombre:any;
  apellido:any;
  ci:any;
  expedicion:any;
  genero:any;
  celular:any;
  telefono:any;
  correo:any;
  token:any;
  fkvivienda:any;
  condominio:any;
  codigo:any;

}
