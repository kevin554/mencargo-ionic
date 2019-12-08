import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AlertController, Events, IonicPage, LoadingController, ModalController, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { EventoProvider, FamiliaProvider, UsuarioProvider, UtilServiceProvider, NotificacionDao } from '../../providers/index.services';
import { CallNumber } from '@ionic-native/call-number';
import { Firebase } from '@ionic-native/firebase';
import { SwalComponent } from '@toverux/ngx-sweetalert2';

@IonicPage()
@Component({
  selector: 'page-inicio-propietario',
  templateUrl: 'inicio-propietario.html',
})
export class InicioPropietarioPage {

  @ViewChild('alertaIngreso') public alertaIngreso: SwalComponent;
  private idFamiliar:any;
  private objPropietario:Familiar;
  private botonTocado:string; /* para animar los botones al tocarlos */
  public hayNotificacionSinLeer:boolean;
  public hayEvento:boolean; /* para saber si hay un evento en transcurso */
  private animacionBotonNotificacion:number;

  /* TIPOS DE ANIMACIONES */
  public SIN_ANIMACION:number = 0;
  public ANIMACION_TA_DA:number = 1;
  public ANIMACION_SWING:number = 2;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public loadingCtrl: LoadingController, public popoverCtrl: PopoverController,
      private firebase: Firebase, private _fp: FamiliaProvider,
      private _up: UsuarioProvider, private util: UtilServiceProvider,
      private callNumber: CallNumber, private alertCtrl: AlertController,
      private notificacionDao: NotificacionDao, private events: Events,
      private platform: Platform, public detectorRef: ChangeDetectorRef,
      public modalCtrl: ModalController, private _ep: EventoProvider) {
    this.animacionBotonNotificacion = this.SIN_ANIMACION;

    if (_up.activo()) {
      this.idFamiliar = _up.getId();
      this.objPropietario = _up.getUsuario();
    }

    if (this.objPropietario.token.toLowerCase() === 'sin token') {
      this.obtenerToken();
      this.cargarNotificacionesServidor();
      this.cargarEventoEnCurso();
    }

    events.subscribe("hayNotificacionSinLeer", (hayNotificacion) => {
      this.hayNotificacionSinLeer = hayNotificacion;

      this._up.setHayNotificacionSinLeer(hayNotificacion);
    });

    /* para estar al tanto de las notificaciones que llegarán */
    this.recibirNotificaciones();

    this.hayNotificacionSinLeer = this._up.getHayNotificacionSinLeer();
  }

  /* hay que verificar si hay algun evento en transcurso */
  ionViewDidEnter() {
    // console.log(`la pagina de inicio se ejecuta cada vez que se inicia la applicacion`);

    this.animacionBotonNotificacion = this.SIN_ANIMACION;
    this.botonTocado = undefined;

    // console.log(`la fecha en el usuario provider (${this._up.getFechaEvento()})`);

    if (!this._up.getFechaEvento()) {
      this.hayEvento = false;
    } else {
      let fin = new Date(this._up.getFechaEvento())
      let hoy = new Date();

      // console.log(`la fecha del celu es (${hoy}) y la fecha en que finaliza el evento es (${fin})`);

      let cantidad = fin.getTime() - hoy.getTime();
      // console.log(`la cantidad de ms que hay entre hoy a la fecha del final del evento es: ${cantidad}, si es positivo significa hay un evento en curso`);

      /* el evento finalizó */
      if (cantidad <= 0) {
        this.hayEvento = false;

        this._up.setIdEvento(undefined);
        this._up.establecerFechaEvento(undefined);
        this.hayEvento = false;
      } else {
        this.hayEvento = true;
      }
    }

    this.detectorRef.detectChanges();
    // console.log(`se refresco la pantalla`)
  }

  ionViewDidLoad() {
    this._up.cargarStorage().then( () => {
      /* la primera vez que habra la app, debe mostrarse el tutorial */
      let seEjecutoAntes = this._up.getseEjecutoAntesInicio();

      if (!seEjecutoAntes) {
        let param = {
          tutorial: "inicio"
        }

        let config = {
          showBackdrop: true,
          enableBackdropDismiss: true
        }

        let profileModal = this.modalCtrl.create("TutorialPage", param, config);

        profileModal.onDidDismiss( datos => {
          /* se cerró el tutorial */
          this._up.setseEjecutoAntesInicio(true);
        });

        profileModal.present();
      }
    });
  }

  cargarNotificacionesServidor() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando notificaciones',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.obtenerNotificaciones(
      this.objPropietario.id,
      this.objPropietario.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let notificaciones = [];
        this.hayNotificacionSinLeer = false;

        for (let indice in datos) {
          let notificacion = datos[indice];
          notificaciones.push(notificacion);

          if (this.platform.is("cordova")) {
            this.agregarNotificacionLocal(notificacion);
          }

          if (notificacion.fecha_lectura == "None") {
            this.hayNotificacionSinLeer = true;
          }
        }

      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith('Código ya utilizado')) {
          this.util.toast(mensaje);
        }
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

  cargarEventoEnCurso() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Verificando la existencia de algún evento en curso.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ep.listaEventoFamiliar(
      this.objPropietario.id,
      this.objPropietario.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let eventoEnCurso;

        for (let indice in datos) {
          let evento = datos[indice];

          if (eventoEnCurso) {
            if (evento.id > eventoEnCurso.id) {
              eventoEnCurso = evento;
            }

          } else {
            eventoEnCurso = evento;
          }
        }

        if (eventoEnCurso) {
          // guardar la fecha y hora del evento SUMADAS LAS 48 HORAS
          let hoy = new Date(eventoEnCurso.fecha);
          let pasadoManiana = new Date();
          pasadoManiana.setDate(hoy.getDate() + 2);

          this._up.establecerFechaEvento(pasadoManiana);
          this._up.setIdEvento(eventoEnCurso.id);

          this.hayEvento = true;
        }

      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith('Código ya utilizado')) {
          this.util.toast(mensaje);
        }
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

  agregarNotificacionLocal(notificacion) {
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

    this.notificacionDao.insertar(obj);
  }

  private recibirNotificaciones() {
    /* para tomar acciones cuando el usuario toque la notificacion */
    if (this.objPropietario.token != "Sin Token") {
      this.firebase.onNotificationOpen().subscribe(

        success => {
          if (success.message_body) {
            let mensaje:string = success.message_body;

            /* si el mensaje es de tipo 'Nico hace X minutos...' */
            if (mensaje.startsWith(`${this.objPropietario.nombre} ${this.objPropietario.apellido} hace `)) {
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
                this.mostrarEstadoIngreso(mensaje, true);
                // this.util.toast(mensaje)
              } else {
                this.mostrarEstadoIngreso(mensaje, true);
              }

            } else {
              this.events.publish("hayNotificacionSinLeer", true);

              switch (this.animacionBotonNotificacion) {
                case 0:
                  this.animacionBotonNotificacion = this.ANIMACION_TA_DA;
                  break;

                case 1:
                  this.animacionBotonNotificacion = this.ANIMACION_SWING;
                  break;

                case 2:
                  this.animacionBotonNotificacion = this.ANIMACION_TA_DA;
                  break;
              }

              this.detectorRef.detectChanges()

              /* si la app estaba abierta, animo el boton de notificaciones e
                incremento el contador de no-leídos en 1*/
              if (!success.tap) {

              } else {
                // deberia abrir la notificacion directamente
                this.verNotificaciones();
              }

            }

          } /* fin if(success.message_body) */

        }, err => {
          console.log(`error ${JSON.stringify(err)}`)
        }
      )
    }
  }

  /**
  * muestra en pantalla completa si el ingreso/salida fue exitoso o no
  */
  private mostrarEstadoIngreso(mensaje, estado: boolean) {
    this.alertaIngreso.title = mensaje;
    this.alertaIngreso.type = "warning";

    this.alertaIngreso.show();
  }

  public tap(boton) {
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

      case "Lista de Invitados":
        this.verListaDeInvitados();
        break;

      case "Grupos":
        this.verGrupos();
        break;

      case "Notificaciones":
        this.verNotificaciones();
        break;
    }
  }

  private verListaDeInvitados() {
    let parametros = {
      familiar: this.objPropietario,
      viendoListaInvitados: true
    };

    this.navCtrl.push('VerContactosEventoPage', parametros);
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
      content: 'Obteniendo token.',
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
      content: 'Almacenando el token.',
      enableBackdropDismiss: true
    });

    let peticion = this._fp.actualizarToken(
      this.idFamiliar,
      this.objPropietario.codigo,
      token
    );

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
      content: 'Obteniendo el número del condominio.',
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
      message: `Llamar a la administración del condominio al ${telefono}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Llamar',
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

  public verGrupos() {
    let parametros = {
      familiar: this.objPropietario
    }

    this.navCtrl.push("VerGruposPage", parametros);
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
