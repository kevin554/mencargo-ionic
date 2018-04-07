import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';

import { AdministradorProvider, FamiliaProvider, InvitadoProvider,
  MovimientoProvider, ViviendaProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-registrar-ingreso-manual',
  templateUrl: 'registrar-ingreso-manual.html',
})
export class RegistrarIngresoManualPage {

  private formuRegIng:FormGroup;
  private intentoIngresar:any;
  private noHayConexion:boolean;
  private error_nombre:string;
  private error_apellido:string;
  private error_ci:string;
  private error_casa:string;
  private error_familia:string;
  private error_placa:string;
  private error_observaciones:string;

  private listaCasas:any[]
  private listaFamiliares:any[];
  private listaVisitas:any[];
  private nombreVisitaSeleccionado:string;
  objUsuario:any;
  objConfiguracionCondominio:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
      private _ap: AdministradorProvider, private _fp: FamiliaProvider,
      private _ip: InvitadoProvider, private _mp: MovimientoProvider,
      private _vp: ViviendaProvider, private util: UtilServiceProvider) {
    this.formuRegIng = this.formBuilder.group({
      nombre: ['', Validators.compose([Validators.required]) ],
      apellido: ['', Validators.required],
      ci: [''],
      id_casa: [''],
      id_familiar: [''],
      id_visita: [''],
      placa: [''],
      observaciones: ['']
    });

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

    if (navParams.get("configuracionCondominio")) {
      this.objConfiguracionCondominio = navParams.get("configuracionCondominio")
    }
  }

  /**
  * se cargan los propietarios de las viviendas en los condominios
  */
  ionViewDidLoad() {
    this.cargarViviendas();
  }

  private cargarViviendas() {
    if (this.listaCasas) {
      return;
    }

    let cargandoPeticion = this.loadingCtrl.create({
      content: 'cargando viviendas',
      enableBackdropDismiss: true
    });

    cargandoPeticion.present();

    let peticion = this._vp.seleccionarTodasPorIdCondominio(this._ap.getIdCondominio());

    cargandoPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.listaCasas = [];

        for (let i in datos) {
          let casa = datos[i];

          if (casa.familia || casa.codificacion) {
            this.listaCasas.push(casa);
          }
        }
      }

    }).subscribe(
      success => {
        cargandoPeticion.dismiss();
      }, err => {
        cargandoPeticion.dismiss();
      }
    );
  }

  public cargarFamiliares(idVivienda) {
    if (this.listaFamiliares) {
      return;
    }

    let cargandoPeticion = this.loadingCtrl.create({
      content: 'cargando familiares',
      enableBackdropDismiss: true
    });

    cargandoPeticion.present();

    let peticion = this._fp.seleccionarPorIdVivienda(idVivienda);

    cargandoPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.listaFamiliares = [];

        for (let i in datos) {
          let familiar = datos[i];
          this.listaFamiliares.push(familiar);
        }

        this.util.ordenarPorMultiplesCampos(this.listaFamiliares, "nombre",
            "apellido");
      }

    }).subscribe(
      success => {
        cargandoPeticion.dismiss();
      }, err => {
        cargandoPeticion.dismiss();
      }
    );
  }

  public cargarContactos(idFamiliar) {
    if (this.listaVisitas) {
      return;
    }

    let cargandoPeticion = this.loadingCtrl.create({
      content: 'cargando lista de contactos',
      enableBackdropDismiss: true
    });

    cargandoPeticion.present();

    let peticion = this._ip.seleccionarAmigosDesdeAdministracion(
      idFamiliar,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    cargandoPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.listaVisitas = [];

        for (let i in datos) {
          let visita = datos[i];
          this.listaVisitas.push(visita);
        }
      }

      this.util.ordenarPorMultiplesCampos(this.listaVisitas, "nombre", "apellido");

    }).subscribe(
      success => {
        cargandoPeticion.dismiss();
      }, err => {
        cargandoPeticion.dismiss();
      }
    );
  }

  /**
  * si se elige un contacto de los registrados por el propietario, se coloca
  * el nombre en el campo del nombre del invitado
  * Con esto, se obtiene el id para evitar redundancia y duplicado de datos
  * en los contactos del propietario
  */
  public seleccionarNombreVisita(idVisita) {
    for (let i in this.listaVisitas) {
      let visita = this.listaVisitas[i];

      if (visita.id === idVisita) {
        this.formuRegIng.get('nombre').setValue(visita.nombre);
        this.formuRegIng.get('apellido').setValue(visita.apellido);

        if (visita.ci) {
          this.formuRegIng.get('ci').setValue(visita.ci)
        }
      }

    }
  }

  public validarRegistroIngreso() {
    this.error_nombre = "";
    this.error_apellido = "";
    this.error_ci = "";
    this.error_placa = "";
    this.error_observaciones = "";
    this.error_casa = ""
    this.error_familia = "";

    this.intentoIngresar = false;

    if (!this.formuRegIng.valid) {
      this.intentoIngresar = true;
    } else {
      let nombre = this.formuRegIng.value.nombre.trim();
      let apellido = this.formuRegIng.value.apellido.trim();
      let ci = this.formuRegIng.value.ci;
      let idCasa = this.formuRegIng.value.id_casa;
      let idVisita = this.formuRegIng.value.id_visita;
      let idFamiliar = this.formuRegIng.value.id_familiar;
      let placa = this.formuRegIng.value.placa.trim();
      let observaciones = this.formuRegIng.value.observaciones.trim();

      /* si no se seleccionó algun contacto del propietario y tampoco se colocó
        el nombre de la visita manualmente */
      if (!idVisita && !nombre) {
        this.formuRegIng.controls["nombre"].markAsDirty();
        this.error_nombre = "el nombre no puede estar vacio";

        this.intentoIngresar = true;
      }

      if (!idVisita && !apellido) {
        this.formuRegIng.controls["apellido"].markAsDirty();
        this.error_apellido = "el apellido no puede estar vacio";

        this.intentoIngresar = true;
      }

      if (!idVisita) {
        idVisita = 0;
      }

      if (!ci && this.objConfiguracionCondominio.ci == "NO") {
        ci = 0;
      }

      if (!ci && this.objConfiguracionCondominio.ci == "SI") {
        this.formuRegIng.controls["ci"].markAsDirty();
        this.error_ci = "el ci no puede estar vacio";

        this.intentoIngresar = true;
      }

      /* si no se seleccionó la vivienda a la que se está visitando*/
      if (!idCasa) {
        this.formuRegIng.controls["id_casa"].markAsDirty();
        this.error_casa = "debe seleccionar una vivienda";

        this.intentoIngresar = true;
      }

      /* si no se seleccionó la familia a la que se está visitando*/
      if (!idFamiliar) {
        this.formuRegIng.controls["id_familiar"].markAsDirty();
        this.error_familia = "debe seleccionar un familiar";

        this.intentoIngresar = true;
      }

      if (this.intentoIngresar) {
        return;
      }

      let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ]{1,50}$");
      if (!expNombre.test(nombre)) {
        this.formuRegIng.controls["nombre"].markAsDirty();
        this.error_nombre = `el nombre solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      if (!expNombre.test(apellido)) {
        this.formuRegIng.controls["apellido"].markAsDirty();
        this.error_apellido = `el apellido solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      if (this.intentoIngresar) {
        return;
      }

      this.registrarIngreso(idVisita, idFamiliar, nombre, apellido, ci, placa,
          observaciones);
    } // formulario validado
  }

  public registrarIngreso(idInvitado, idFamiliar, nombre, apellido, ci, placa, observaciones) {
    let cargarPeticion = this.loadingCtrl.create({
      enableBackdropDismiss: true
    });

    let celular = 0;
    let cantidad = 24;
    let tiempo = "horas";
    let fecha = this.util.getFechaActual();
    let expedicion = "SC";
    let horaIngreso = this.util.getFechaActual();

    let peticionInvitado = this._mp.insertarInvitacion(nombre, apellido, cantidad, tiempo,
        fecha, ci, expedicion, celular, placa, idFamiliar, idInvitado,
        observaciones, this._ap.getNombre(), this.util.getFechaActual(), horaIngreso);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticionInvitado.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.navCtrl.pop();
        this.util.toast("Invitado Registrado", 1500);
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.noHayConexion = false;
      }, err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    ) // termina la peticion
  }

}
