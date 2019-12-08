import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertController, IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { ViviendaDao, ViviendaProvider, AdministradorProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'ver-perfil-vivienda',
  templateUrl: 'ver-perfil-vivienda.html',
})
export class VerPerfilViviendaPage {

  private objVivienda:ModeloVivienda;
  private objUsuario:any;
  private seEstaEditando:boolean;
  public textoGuardarEditar:string;

  private formularioVivienda:FormGroup;
  /* para mostrar los errores en caso de incoherencia en el formulario */
  public error_familia:string;
  public error_telefono:string;
  public error_celular:string;
  public error_direccion:string;
  private intentoIngresar:boolean;

  constructor(public navCtrl: NavController, private _vp: ViviendaProvider,
      public navParams: NavParams, public formBuilder: FormBuilder,
      private _ap: AdministradorProvider, public loadingCtrl: LoadingController,
      public alertCtrl: AlertController, public util: UtilServiceProvider,
      private viviendaDao: ViviendaDao, public platform: Platform) {
    this.formularioVivienda = this.formBuilder.group({
      familia: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      celular: ['']
    });

    if (navParams.get('usuario')) {
      this.objUsuario = navParams.get('usuario');
    }

    if (navParams.get('vivienda')) {
      this.objVivienda = navParams.get('vivienda');
      this.cargarDatosAlFormulario(this.objVivienda);
    }

    this.seEstaEditando = true;
    this.textoGuardarEditar = "guardar";
  }

  ionViewCanLeave() {
    let obj = this.getViviendaDelFormulario();

    // si los datos no son validos
    if (!obj) {
      return true;
    }

    if (this.laViviendaCambio(obj)) {
      return this.mostrarAlertaGuardarCambios();
    }

    return true;
  }

  /**
  * Devuelve verdadero si la familia, direccion o telefono de la vivienda fueron
  * modificados
  */
  private laViviendaCambio(vivienda) {
    return this.objVivienda.familia !== vivienda.familia ||
      this.objVivienda.direccion !== vivienda.direccion ||
      this.objVivienda.numero !== vivienda.numero ||
      this.objVivienda.telefono !== vivienda.telefono;
  }

  public mostrarAlertaGuardarCambios(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let alerta = this.alertCtrl.create({
        title: 'La vivienda cambió',
        message: '¿Desea guardar los cambios?',
        buttons: [
          {
            text: 'No',
            handler: () => {
              alerta.dismiss().then( () => resolve(true) );
              return false;
            }
          },
          {
            text: 'Si',
            handler: () => {
              this.actualizarVivienda();
              alerta.dismiss().then( () => resolve(true) );
              return false;
            }
          }
        ]
      });

      return alerta.present();
    });
  }

  private cargarDatosAlFormulario(obj:ModeloVivienda) {
    this.formularioVivienda.get('familia').setValue(obj.familia);
    this.formularioVivienda.get('direccion').setValue(obj.direccion);

    if (obj.telefono !== 0) {
      this.formularioVivienda.get('telefono').setValue(obj.telefono);
    }

    if (obj.numero !== 0) {
      this.formularioVivienda.get('celular').setValue(obj.numero);
    }
  }

  public verFamiliares() {
    let parametros = {
      vivienda: this.objVivienda,
      usuario: this.objUsuario
    };

    this.navCtrl.push('VerFamiliaresPage', parametros);
  }

  public editar() {
    if (!this.seEstaEditando) {
      this.seEstaEditando = true;
      this.textoGuardarEditar = "Guardar";
    } else {
      this.seEstaEditando = false;
      this.textoGuardarEditar = "Editar";

      this.actualizarVivienda();
    }
  }

  private actualizarVivienda() {
    let obj = this.getViviendaDelFormulario();

    if (!obj) {
      return;
    }

    if (!this.laViviendaCambio(obj)) {
      return;
    }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'Actualizando los datos de la vivienda.'
    });

    cargarPeticion.present();

    let peticion = this._vp.actualizar(this.objVivienda.id,
      obj.familia,
      obj.direccion,
      obj.telefono,
      this.objVivienda.codificacion,
      obj.numero,
      this._ap.getIdCondominio(),
      this.util.getFechaActual(),
      this._ap.getNombre()
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.objVivienda.familia = obj.familia;
        this.objVivienda.direccion = obj.direccion;
        this.objVivienda.telefono = obj.telefono;
        this.objVivienda.numero = obj.numero;

        this.agregarEnLocal(this.objVivienda);

        this.util.toastSuperior("Datos actualizados.", 2000);
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss()
      },
      err => {
        cargarPeticion.dismiss();
        this.util.toast('Hubo un error al conectarse con el servidor.', 2000);
      }
    );
  }

  public editarCodificacion() {
    let alert = this.alertCtrl.create({
     title: 'Nueva Codificación',
     inputs: [
       {
         name: 'codificacion',
         placeholder: 'Codificación',
         value: this.objVivienda ? this.objVivienda.codificacion : ''
       }],
     buttons: [
       {
         text: 'Cancelar',
         role: 'cancel'
       },
       {
         text: 'Guardar',
         handler: datos => { this.actualizarCodificacion(datos.codificacion) }
       }]
    });

    alert.present();
  }

  private actualizarCodificacion(nuevaCodificacion) {
    if (!nuevaCodificacion) {
      this.util.toast('La codificación no puede estar vacía.', 2000);
      return;
    }

    if ( (this.objVivienda) && // si es la misma codificacion
        (this.objVivienda.codificacion === nuevaCodificacion) ) {
      return;
    }

    let expresion = new RegExp("^[a-zA-Z0-9 ñÑáéíóúÁÉÍÓÚ]{1,50}$");
    if (!expresion.test(nuevaCodificacion)) {
      this.util.toast('Sólo se acepta un máximo de 50 caracteres.', 2000);
      return;
    }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'Actualizando codificación.',
      enableBackdropDismiss: true,
    });

    cargarPeticion.present();

    let peticion = this._vp.actualizar(
      this.objVivienda.id,
      this.objVivienda.familia,
      this.objVivienda.direccion,
      this.objVivienda.telefono,
      nuevaCodificacion,
      this.objVivienda.numero,
      this._ap.getIdCondominio(),
      this.util.getFechaActual(),
      this._ap.getNombre()
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe()
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.objVivienda.codificacion = nuevaCodificacion;

        this.agregarEnLocal(this.objVivienda);
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      err => {
        cargarPeticion.dismiss();
        this.util.toast('Hubo un error al conectarse con el servidor', 2000);
      }
    );
  }

  private getViviendaDelFormulario() {
    this.error_familia = "";
    this.error_telefono = "";
    this.error_celular = "";
    this.error_direccion = "";
    this.intentoIngresar = false;

    if (!this.formularioVivienda.valid) {
      this.intentoIngresar = true;
    }

    let familia = this.formularioVivienda.value.familia.trim();
    let direccion = this.formularioVivienda.value.direccion.trim();
    let telefono = this.formularioVivienda.value.telefono;
    let celular = this.formularioVivienda.value.celular;

    if (!familia) {
      this.formularioVivienda.controls['familia'].markAsDirty();
      this.error_familia = `Este campo no puede estar vacío.`;

      this.intentoIngresar = true;
    }

    if (!telefono) {
      telefono = 0;
    }

    if (!celular) {
      celular = 0;
    }

    let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ]{1,50}$");
    if (!expNombre.test(familia)) {
      this.formularioVivienda.controls['familia'].markAsDirty();
      this.error_familia = `Este campo debe tener entre 1 a 50 letras.`;

      this.intentoIngresar = true;
    }

    let expTexto = new RegExp("^[a-zA-Z0-9 ñÑáéíóúÁÉÍÓÚ@.,()/]{0,200}$");
    if (direccion && !expTexto.test(direccion)) {
      this.formularioVivienda.controls['direccion'].markAsDirty();
      this.error_direccion = `Sólo se acepta texto con menos de 200 letras.`;

      this.intentoIngresar = true;
    }

    let expNumero = new RegExp("[0-9]+$");
    if (telefono && !expNumero.test(telefono)) {
      this.formularioVivienda.controls['telefono'].markAsDirty();
      this.error_telefono = `Sólo se aceptan números.`;

      this.intentoIngresar = true;
    }

    if (celular && !expNumero.test(celular)) {
      this.formularioVivienda.controls['celular'].markAsDirty();
      this.error_celular = `Sólo se aceptan números.`;

      this.intentoIngresar = true;
    }

    if (this.intentoIngresar) {
      return;
    }

    let vivienda = {
      familia: familia,
      direccion: direccion,
      telefono: telefono,
      numero: celular
    }

    return vivienda;
  }

  private agregarEnLocal(vivienda) {
    if (!this.platform.is("cordova")) return;

    /* el objeto listo para insertar en local */
    let obj = {
      id: vivienda.id,
      familia: vivienda.familia,
      direccion: vivienda.direccion,
      telefono: vivienda.telefono,
      codificacion: vivienda.codificacion,
      numero: vivienda.numero
    }

    this.viviendaDao.insertar(obj);
  }

}

interface ModeloVivienda {

  id:number;
  codificacion:string;
  familia:string;
  direccion:string;
  telefono:number;
  numero:number; // numero de casa
  fkcondominio:any;

}
