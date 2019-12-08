import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertController, IonicPage, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { EventoProvider, UsuarioProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-crear-evento',
  templateUrl: 'crear-evento.html',
})
export class CrearEventoPage {

  titulo:string;
  private objFamiliar:any;
  objEvento:any;

  private formuRegEv:FormGroup;
  public error_nombre:string;
  public error_descripcion:any;
  public error_inicio:any;
  private intentoIngresar:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider, private _ep: EventoProvider,
      private alertCtrl: AlertController, private _up: UsuarioProvider,
      public modalCtrl: ModalController) {
    this.formuRegEv = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      inicio: ['', Validators.required]
    });

    this.titulo = "Crear evento";

    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("evento")) {
      this.objEvento = navParams.get("evento");

      this.cargarDatosAlFormulario(this.objEvento);
      this.titulo = "Editar evento";
    }

    this.formuRegEv.get("inicio").setValue(this.util.getFechaNormal());
  }

  ionViewDidLoad() {
    /* la primera vez que habra la app, debe mostrarse el tutorial */
    let seEjecutoAntes = this._up.getSeEjecutoAntesCrearEvento();

    if (!seEjecutoAntes) {
      let param = {
        tutorial: "crear evento"
      }

      let config = {
        showBackdrop: true,
        enableBackdropDismiss: true
      }

      let profileModal = this.modalCtrl.create("TutorialPage", param, config);

      profileModal.onDidDismiss( datos => {
        /* se cerró el tutorial */
        this._up.setSeEjecutoAntesCrearEvento(true);
      });

      profileModal.present();
    }
  }

  cargarDatosAlFormulario(datos) {
    this.formuRegEv.get('nombre').setValue(datos.nombre);
    this.formuRegEv.get('descripcion').setValue(datos.descripcion);
    this.formuRegEv.get('inicio').setValue(datos.fecha);
  }

  confirmarFinalizarEvento() {
    let alert = this.alertCtrl.create({
      title: '¿Desea dar por finalizado el evento?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Si',
          handler: () => {
            this.finalizarEvento();
          }
        }
      ]
    });

    alert.present();
  }

  finalizarEvento() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Finalizando el evento',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ep.finalizarEvento(
      this.objEvento.id,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this._up.setIdEvento(undefined);
        this._up.establecerFechaEvento(undefined);

        this.navCtrl.pop();
        this.navCtrl.pop();
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
      },
      err => {
        cargarPeticion.dismiss();
      }
    );
  }

  generarInvitacion() {
    let parametros = {
      idEvento: this.objEvento.id + "e",
      nombreEvento: this.objEvento.nombre
    }

    this.navCtrl.push("CodigoInvitacionPage", parametros);
  }

  public validarFormulario() {
    this.error_nombre = "";
    this.error_descripcion = "";
    this.error_inicio = "";

    if (!this.formuRegEv.valid) {
      this.intentoIngresar = true;
    } else {
      let nombre = this.formuRegEv.value.nombre.trim();
      let descripcion = this.formuRegEv.value.descripcion.trim();
      let inicio = this.formuRegEv.value.inicio;

      this.intentoIngresar = false;

      if (!nombre) {
        this.formuRegEv.controls['nombre'].markAsDirty();
        this.error_nombre = 'El nombre no puede estar vacío';

        this.intentoIngresar = true;
      }

      if (this.intentoIngresar) {
        return;
      }

      /* si estoy actualizando un evento, tengo que poner la fecha en el
        formato adecuado */
      if (this.objEvento) {
        inicio = this.util.getFechaFormateada(inicio);
      }

      let evento = {
        nombre: nombre,
        descripcion: descripcion,
        fecha: inicio
      }

      this.siguiente(evento);
    } /* formulario validado */
  }

  private siguiente(evento) {
    if (this.objEvento) {
      /* solo me interesa actualizar el evento */
      let cargarPeticion = this.loadingCtrl.create({
        content: 'Actualizando el evento',
        enableBackdropDismiss: true
      });

      cargarPeticion.present();

      let peticion = this._ep.actualizar(
        this.objEvento.id,
        evento.nombre,
        evento.descripcion,
        evento.fecha,
        this.objFamiliar.id,
        this.objFamiliar.codigo
      );

      cargarPeticion.onDidDismiss( () => {
        peticionEnCurso.unsubscribe();
      })

      let peticionEnCurso = peticion.map( resp => {
        let datos = resp.json();

        if (datos.success) {
          this.objEvento.nombre = evento.nombre;
          this.objEvento.descripcion = evento.descripcion;
          this.objEvento.fecha = evento.fecha;

          this.navCtrl.pop();

          this.util.toast("Datos actualizados");
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
        },
        err => {
          cargarPeticion.dismiss();
        }
      );

      return;
    }

    let parametros = {
      familiar: this.objFamiliar,
      evento: evento
    }

    this.navCtrl.push('VerContactosEventoPage', parametros);
  }

  obtenerFechaActual():string {
    let fecha = new Date();

    let fechaFormateada = fecha.getFullYear() + '-' +
      this.twoDigits(fecha.getMonth() + 1) + '-' +
      this.twoDigits(fecha.getDate());

    return fechaFormateada;
  }

  twoDigits(d):string {
    if (0 <= d && d < 10)
        return "0" + d.toString();

    return d.toString();
  }

}
