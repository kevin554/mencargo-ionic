import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IonicPage, LoadingController, ModalController, NavController, NavParams, Platform, ViewController } from 'ionic-angular';

import { AdministradorProvider, FamiliaProvider, UtilServiceProvider } from '../../providers/index.services';
import { TextoMinusculaPipe } from '../../pipes/texto-minuscula/texto-minuscula';

@IonicPage()
@Component({
  selector: 'page-registrar-familiar',
  templateUrl: 'registrar-familiar.html',
})
export class RegistrarFamiliarPage {

  private objVivienda:any;
  private objFamiliar:ModeloFamiliar;
  private dePago:boolean;
  private listaFamiliares:any[];
  private qrDisponibles:any;
  private titulo:string;

  private formuRegFam:FormGroup;
  private intentoIngresar:any;
  private noHayConexion:boolean;
  private error_nombre:string;
  private error_apellido:string;
  private error_celular:string;
  private error_telefono:string;
  private error_correo:string;
  private error_ci:string;
  /* cuando se introduce un correo, ngModelChange se ejecuta demasiadas veces
  provocando stackoverflow, la idea con la sgte variable es hacer que
  ngModelChange se ejecute una sóla vez cada vez que cambie el correo */
  private correoModificado:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public formBuilder: FormBuilder, private _fp: FamiliaProvider,
      public modalCtrl: ModalController, public platform: Platform,
      public loadingCtrl: LoadingController, private _ap: AdministradorProvider,
      public viewCtrl: ViewController, public util: UtilServiceProvider) {
    this.formuRegFam = this.formBuilder.group({
      numero_casa: ['', Validators.compose([Validators.required]) ],
      nombre: ['', Validators.compose([Validators.required]) ],
      apellido: ['', Validators.required],
      sexo: [''],
      celular: [''],
      telefono: [''],
      correo: [''],
      ci: ['', Validators.compose([Validators.required]) ],
      expedicion: ['SC']
    });

    this.titulo = "Registrar familiar";

    if (navParams.get("vivienda")) {
      this.objVivienda = navParams.get("vivienda");
      this.formuRegFam.get('numero_casa').setValue(this.objVivienda.numero);
    }

    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
      this.cargarDatosAlFormulario(this.objFamiliar);

      this.titulo = "Editar familiar";
    }

    if (navParams.get("dePago")) {
      this.dePago = navParams.get("dePago");
    }

    if (navParams.get("familiares")) {
      this.listaFamiliares = navParams.get("familiares");
    }

    if (navParams.get("qrDisponibles")) {
      this.qrDisponibles = navParams.get("qrDisponibles");
    }
  }

  private cargarDatosAlFormulario(datos) {
    this.formuRegFam.get('nombre').setValue(datos.nombre);
    this.formuRegFam.get('apellido').setValue(datos.apellido);
    this.formuRegFam.get('sexo').setValue(datos.genero);

    if (datos.celular) {
      this.formuRegFam.get('celular').setValue(datos.celular);
    }

    if (datos.telefono) {
      this.formuRegFam.get('telefono').setValue(datos.telefono);
    }

    this.formuRegFam.get('correo').setValue(datos.correo);
    this.formuRegFam.get('ci').setValue(datos.ci);
  }

  public generarQR() {
    if (this.objFamiliar) {
      this.actualizarFamiliar();
    } else {
      this.insertarFamiliar();
    }
  }

  private actualizarFamiliar() {
    let obj = this.getFamiliarDeFormulario();

    if (!obj) {
      return;
    }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'guardando',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._fp.actualizar(this.objFamiliar.id, obj.nombre,
      obj.apellido,
      obj.telefono, obj.celular, obj.ci, obj.correo, obj.genero,
      this.objVivienda.id, obj.expedicion, this._ap.getNombre(),
      this.util.getFechaActual());

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        // actulizo los datos del familiar
        this.objFamiliar.nombre = obj.nombre;
        this.objFamiliar.apellido = obj.apellido;
        this.objFamiliar.genero = obj.genero;
        this.objFamiliar.celular = obj.celular;
        this.objFamiliar.telefono = obj.telefono;
        this.objFamiliar.correo = obj.correo;
        this.objFamiliar.ci = obj.ci;
        this.objFamiliar.expedicion = obj.expedicion;

        let toast = this.util.toastCtrl.create({
          message: 'datos actualizados correctamente',
          duration: 1500,
          showCloseButton: true
        });

        toast.present();
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss()
      },
      err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    );
  }

  private insertarFamiliar() {
    let obj = this.getFamiliarDeFormulario();

    if (!obj) {
      return;
    }

    let cargarPeticion = this.loadingCtrl.create({
      enableBackdropDismiss: true
    });

    cargarPeticion.present();
    let adicional = this.dePago ? 1 : 0;

    let peticion = this._fp.insertar(obj.nombre, obj.apellido,
      obj.telefono, obj.celular,
      obj.ci, obj.correo, obj.genero, this.objVivienda.id, obj.expedicion,
      this._ap.getNombre(), this.util.getFechaActual(), this._ap.getId(),
      adicional);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        // actualizando el id
        obj.id = datos.idfamiliar;

        this.listaFamiliares.push(obj);

        this.navCtrl.pop();
        this.qrDisponibles.pop();
        this.mostrarCodigoQR(obj);
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss()
      },
      err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
       }
    );
  }

  private mostrarCodigoQR(familiar) {
    let parametros = {
      idFamiliar: familiar.id
    }

    this.navCtrl.push('CodigoInvitacionPage', parametros);
  }

  private getFamiliarDeFormulario() {
    this.error_nombre = '';
    this.error_apellido = '';
    this.error_celular = '';
    this.error_telefono = '';
    this.error_correo = '';
    this.error_ci = '';

    this.intentoIngresar = false;

    if (!this.formuRegFam.valid) {
      this.intentoIngresar = true;
    } else {
      let nombre = this.formuRegFam.value.nombre.trim();
      let apellido = this.formuRegFam.value.apellido.trim();
      let sexo = this.formuRegFam.value.sexo;
      let celular = this.formuRegFam.value.celular;
      let telefono = this.formuRegFam.value.telefono;
      let correo = this.formuRegFam.value.correo.trim();
      let ci = this.formuRegFam.value.ci;
      let expedicion = this.formuRegFam.value.expedicion;

      if (!nombre) {
        this.formuRegFam.controls['nombre'].markAsDirty();
        this.error_nombre = 'el nombre no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!apellido) {
        this.formuRegFam.controls['apellido'].markAsDirty();
        this.error_apellido = 'el apellido no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!celular) {
        celular = 0;
      }

      if (!telefono) {
        telefono = 0;
      }

      if (!ci) {
        this.formuRegFam.controls['ci'].markAsDirty();
        this.error_ci = 'el carnet de identidad no puede estar vacio';

        this.intentoIngresar = true;
      }

      let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ]{1,50}$");
      if (!expNombre.test(nombre)) {
        this.formuRegFam.controls['nombre'].markAsDirty();
        this.error_nombre = `el nombre solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      if (!expNombre.test(apellido)) {
        this.formuRegFam.controls['apellido'].markAsDirty();
        this.error_apellido = `el apellido solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      let expNumerica = new RegExp("[0-9]+$");
      if (celular && !expNumerica.test(celular)) {
        this.formuRegFam.controls['celular'].markAsDirty();
        this.error_celular = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      if (telefono && !expNumerica.test(telefono)) {
        this.formuRegFam.controls['telefono'].markAsDirty();
        this.error_telefono = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      let expMail = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$");
      if (correo && !expMail.test(correo)) {
        this.formuRegFam.controls['correo'].markAsDirty();
        this.error_correo = `no es una direccion de correo valida`;

        this.intentoIngresar = true;
      }

      if (!expNumerica.test(ci)) {
        this.formuRegFam.controls['ci'].markAsDirty();
        this.error_ci = `este campo solo admite numeros`;

        this.intentoIngresar = true;
      }

      if (this.intentoIngresar) {
        return;
      }

      let familiar:ModeloFamiliar = {
        id: 0,
        nombre: nombre,
        apellido: apellido,
        genero: sexo,
        telefono: this.objFamiliar ? this.objFamiliar.telefono : 0,
        celular: celular,
        ci: ci,
        correo: correo,
        expedicion: expedicion
      }

      return familiar;
    } // formulario validado
  }

  public aMinuscula(evento) {
    /* para que el evento no se ejecute muchisimas veces de forma innecesaria */
    if (evento == this.correoModificado) {
      return;
    }

    /* ahora sí el correo es modificado */
    this.correoModificado = evento;

    /* convierto el correo a minusculas */
    let textoProcesado = TextoMinusculaPipe.prototype.transform(evento);

    this.formuRegFam.get('correo').setValue(textoProcesado);
  }

}

interface ModeloFamiliar {

  id:number;
  nombre:any;
  apellido:any;
  telefono:any;
  celular:any;
  ci:any;
  expedicion:any;
  correo:any;
  genero:any;

}
