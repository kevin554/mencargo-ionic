import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { InvitadoProvider, MovimientoProvider, UtilServiceProvider ,InvitadoDao } from "../../providers/index.services";

@IonicPage()
@Component({
  selector: 'page-registrar-invitacion',
  templateUrl: 'registrar-invitacion.html',
})
export class RegistrarInvitacionPage {

  private formuRegInv:FormGroup;
  private detallado:boolean; // para expandir el formulario
  private error_nombre:string;
  private error_apellido:string;
  private error_cantidad:string;
  private error_tiempo:string;
  private error_ci:string;
  private error_celular:string;
  private error_placa:string;
  private intentoIngresar:boolean;

objFamiliar:any;
  private idFamiliar:any;
  private soloRegistrarAmigo:any; // para omitir el dato de la placa
  private amigos:any; // para actualizar la lista de amigos al crear un amigo
  private objAmigo:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
      private _mp: MovimientoProvider, private util: UtilServiceProvider,
      private _ip: InvitadoProvider, private invitadoDao: InvitadoDao,
      private platform: Platform) {
    this.formuRegInv = this.formBuilder.group({
      fecha: [''],
      nombre: ['', Validators.compose([Validators.required]) ],
      apellido: ['', Validators.required],
      cantidad: ['', Validators.compose([Validators.required])],
      tiempo: [''],
      ci: [''],
      expedicion: ['SC'],
      celular: [''],
      placa: ['']
    });

    this.formuRegInv.get('fecha').setValue(this.util.getFechaNormal());
    this.formuRegInv.get('cantidad').setValue(24);
    this.formuRegInv.get('tiempo').setValue("horas");

    if (navParams.get("idFamiliar")) {
      this.idFamiliar = navParams.get("idFamiliar");
    }

    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("amigo")) {
      this.objAmigo = navParams.get("amigo");
      this.cargarDatosAlFormulario(this.objAmigo);
    }

    if (navParams.get("amigos")) {
      this.amigos = navParams.get("amigos");
    }

    if (navParams.get("soloRegistrarAmigo")) {
      this.soloRegistrarAmigo = navParams.get("soloRegistrarAmigo");
    }
  }

  private cargarDatosAlFormulario(datos) {
    this.formuRegInv.get('nombre').setValue(datos.nombre);
    this.formuRegInv.get('apellido').setValue(datos.apellido);
    if (datos.ci) {
      this.formuRegInv.get('ci').setValue(datos.ci);
    }
    if (datos.celular) {
      this.formuRegInv.get('celular').setValue(datos.celular);
    }
  }

  public guardarContacto() {
    let obj = this.getInvitadoDeFormulario();

    if (!obj) {
      return;
    }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'guardando contacto',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let adicionadoPor = "";

    let peticion;
    if (!this.objAmigo) {
      peticion = this._ip.insertar(obj.nombre, obj.apellido,
        obj.ci, "SC",
        obj.celular,
        obj.fkfamilia, adicionadoPor, this.util.getFechaActual(), this.objFamiliar.codigo);
    } else {
      peticion = this._ip.actualizar(obj.id, obj.nombre, obj.apellido,
        obj.ci,
        "SC", obj.celular, obj.fkfamilia, adicionadoPor,
        this.util.getFechaActual(), this.objFamiliar.codigo);
    }

    /* si se cancela antes de que se complete la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        /* agrego el amigo a la lista si es nuevo */
        if (!this.objAmigo) {
          /* actualizo el id */
          obj.id = datos.idvisita;

          this.amigos.push(obj);

          // if (this.platform.is("cordova")) {
          //   let objAInsertar = {
          //     id: obj.id,
          //     nombre: obj.nombre,
          //     apellido: obj.apellido,
          //     ci: obj.ci,
          //     expedicion: "SC",
          //     celular: obj.celular,
          //     fkfamilia: obj.fkfamilia,
          //     fkcondominio: this.objFamiliar.condominio
          //   }
          //
          //   this.invitadoDao.insertar(objAInsertar);
          // }

        } else {
          this.objAmigo.nombre = obj.nombre;
          this.objAmigo.apellido = obj.apellido;
          this.objAmigo.ci = obj.ci;
          this.objAmigo.celular = obj.celular;

          // if (this.platform.is("cordova")) {
          //   let objAInsertar = {
          //     id: this.objAmigo.id,
          //     nombre: this.objAmigo.nombre,
          //     apellido: this.objAmigo.apellido,
          //     ci: this.objAmigo.ci,
          //     expedicion: "SC",
          //     celular: this.objAmigo.celular,
          //     fkfamilia: this.objAmigo.fkfamilia,
          //     fkcondominio: this.objAmigo.fkcondominio
          //   }
          //
          //   this.invitadoDao.insertar(objAInsertar);
          // }

        }

        this.navCtrl.pop();
      }

    }).subscribe(
      sucess => {
        cargarPeticion.dismiss()
      },
      errr => {
        cargarPeticion.dismiss()
      }
    );
  }

  public mostrarFormularioDetallado() {
    this.detallado = !this.detallado;
  }

  public enviarInvitacion() {
    this.insertarInvitacion();
  }

  private insertarInvitacion() {
    let obj = this.getInvitacionDeFormulario();

    if (!obj) {
      return;
    }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'generando invitacion',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let adicionadoPor = "";
    let observacion = "";
    let horaIngreso = "";

    let peticion = this._mp.insertarInvitacionDesdeFamiliar(obj.nombre, obj.apellido,
      obj.cantidad,
      obj.tiempo, obj.fecha, obj.ci, obj.expedicion, obj.celular, obj.placa,
      obj.idFamiliar, obj.idInvitado, observacion, adicionadoPor,
      this.util.getFechaActual(), this.objFamiliar.codigo);

    /* si se cancela antes de que se complete la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response; /* {idvisita, idmovimiento} */

        this.navCtrl.pop();

        let parametros = {
          idInvitado: datos.idmovimiento,
          nombreInvitado: (obj.nombre + ' ' + obj.apellido)
        }

        this.navCtrl.push('CodigoInvitacionPage', parametros);
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
        }
      }

    }).subscribe(
      sucess => {
        cargarPeticion.dismiss()
      },
      errr => {
        cargarPeticion.dismiss()
      }
    );
  }

  private getInvitacionDeFormulario():ModeloInvitacion {
    this.error_nombre = "";
    this.error_apellido = "";
    this.error_cantidad = "";
    this.error_tiempo = "";
    this.error_ci = "";
    this.error_celular = "";
    this.error_placa = "";

    if (!this.formuRegInv.valid) {
      this.intentoIngresar = true;
    } else {
      let fecha = this.formuRegInv.value.fecha;
      let nombre = this.formuRegInv.value.nombre.trim();
      let apellido = this.formuRegInv.value.apellido.trim();
      let ci = this.formuRegInv.value.ci;
      let expedicion = this.formuRegInv.value.expedicion;
      let celular = this.formuRegInv.value.celular;
      let placa = this.formuRegInv.value.placa.trim();
      let cantidad = 24;//this.formuRegInv.value.cantidad;
      let tiempo = "horas";//this.formuRegInv.value.tiempo;

      this.intentoIngresar = false;

      if (!nombre) {
        this.formuRegInv.controls['nombre'].markAsDirty();
        this.error_nombre = 'el nombre no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!apellido) {
        this.formuRegInv.controls['apellido'].markAsDirty();
        this.error_apellido = 'el apellido no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!ci) {
        ci = 0;
      }

      if (!celular) {
        celular = 0;
      }

      let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ.]{1,50}$");
      if (!expNombre.test(nombre)) {
        this.formuRegInv.controls['nombre'].markAsDirty();
        this.error_nombre = `el nombre solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      if (!expNombre.test(apellido)) {
        this.formuRegInv.controls['apellido'].markAsDirty();
        this.error_apellido = `el apellido solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      let regExpNumerica = new RegExp("[0-9]+$");
      if (ci && !regExpNumerica.test(ci)) {
        this.formuRegInv.controls['ci'].markAsDirty();
        this.error_ci = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      if (celular && !regExpNumerica.test(celular)) {
        this.formuRegInv.controls['celular'].markAsDirty();
        this.error_celular = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      // if (!cantidad) {
      //   this.formuRegInv.controls['cantidad'].markAsDirty();
      //   this.error_cantidad = `debe especificar la duracion de la invitacion`;
      //
      //   this.intentoIngresar = true;
      // }

      if (this.intentoIngresar) {
        return;
      }

      let id = 0;
      fecha = this.util.getFechaFormateada(fecha);
      // fecha += this.util.getFechaActual().substring(10, 19)

      let invitacion:ModeloInvitacion = {
        idInvitado: id,
        nombre: nombre,
        apellido: apellido,
        cantidad: cantidad,
        tiempo: tiempo,
        fecha: fecha,
        ci: ci,
        expedicion: expedicion,
        celular: celular,
        placa: placa,
        idFamiliar: this.idFamiliar
      }

      return invitacion;
    } // formulario validado
  }

  private getInvitadoDeFormulario() {
    this.error_nombre ="";
    this.error_apellido = "";
    this.error_ci = "";
    this.error_celular = "";

    /* */
    let cantidad = this.formuRegInv.value.cantidad;

    if (!this.formuRegInv.valid && cantidad) {
      this.intentoIngresar = true;
    } else {
      let nombre = this.formuRegInv.value.nombre.trim();
      let apellido = this.formuRegInv.value.apellido.trim();
      let ci = this.formuRegInv.value.ci;
      let celular = this.formuRegInv.value.celular;

      this.intentoIngresar = false;

      if (!nombre) {
        this.formuRegInv.controls['nombre'].markAsDirty();
        this.error_nombre = 'el nombre no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!apellido) {
        this.formuRegInv.controls['apellido'].markAsDirty();
        this.error_apellido = 'el apellido no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!ci) {
        ci = 0;
      }

      if (!celular) {
        celular = 0;
      }

      let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ]{1,50}$");
      if (!expNombre.test(nombre)) {
        this.formuRegInv.controls['nombre'].markAsDirty();
        this.error_nombre = `el nombre solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      if (!expNombre.test(apellido)) {
        this.formuRegInv.controls['apellido'].markAsDirty();
        this.error_apellido = `el apellido solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      let regExpNumerica = new RegExp("[0-9]+$");
      if (ci && !regExpNumerica.test(ci)) {
        this.formuRegInv.controls['ci'].markAsDirty();
        this.error_ci = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      if (celular && !regExpNumerica.test(celular)) {
        this.formuRegInv.controls['celular'].markAsDirty();
        this.error_celular = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      if (this.intentoIngresar) {
        return;
      }

      let id = this.objAmigo ? this.objAmigo.id : 0;

      let invitado = {
        id: id,
        nombre: nombre,
        apellido: apellido,
        ci: ci,
        // expedicion: expedicion,
        celular: celular,
        fkfamilia: this.objFamiliar.id
      }

      return invitado;
    } // formulario validado
  }

}

interface ModeloInvitacion {

  nombre:any;
  apellido:any;
  cantidad:any;
  tiempo:any;
  fecha:any;
  ci:any;
  expedicion:any;
  celular:any;
  placa:any;
  idFamiliar:any;
  idInvitado:any;

}
