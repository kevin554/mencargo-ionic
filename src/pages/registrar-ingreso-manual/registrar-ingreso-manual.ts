import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IonicPage, Loading, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { AdministradorProvider, FamiliaProvider, FamiliaresProvider, IngresosProvider, InvitadoProvider, MovimientoProvider, ViviendaDao, ViviendaProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-registrar-ingreso-manual',
  templateUrl: 'registrar-ingreso-manual.html',
})
export class RegistrarIngresoManualPage {

  private formuRegIng:FormGroup;
  private intentoIngresar:any;
  public noHayConexion:boolean;
  public error_nombre:string;
  public error_apellido:string;
  public error_ci:string;
  public error_casa:string;
  public error_familia:string;
  public error_placa:string;
  public error_observaciones:string;

  private listaCasas:any[]
  private listaFamiliares:any[];
  private listaVisitas:any[];
  public contactoPreexistenteSeleccionado:boolean;
  private objUsuario:any;
  private objConfiguracionCondominio:any;
  private cargarPeticion:Loading;
  private peticionEnCurso:any;
  /* cuando se introduce la placa, ngModelChange se ejecuta demasiadas veces
  provocando stackoverflow, la idea con la sgte variable es hacer que
  ngModelChange se ejecute una sóla vez cada vez que cambie la placa */
  private placaModificada:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
      private _ap: AdministradorProvider, private _fp: FamiliaProvider,
      private _ip: InvitadoProvider, private _mp: MovimientoProvider,
      private _vp: ViviendaProvider, private util: UtilServiceProvider,
      private _ig: IngresosProvider, public platform: Platform,
      private _familiaresProvider: FamiliaresProvider,
      private _viviendaDao: ViviendaDao) {
    this.formuRegIng = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      ci: [''],
      id_casa: [''],
      id_familiar: [''],
      id_visita: [0],
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

  /* cuando se presione la tecla atrás, es necesario finalizar con cualquier
    peticion que se esté ejecutando */
  ionViewWillLeave() {
    if (this.cargarPeticion) {
      this.cargarPeticion.dismiss();
    }
  }

  private cargarViviendas() {
    if (this.listaCasas) {
      return;
    }

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando viviendas.'
    });

    this.cargarPeticion.present();

    let peticion = this._vp.seleccionarTodasPorIdCondominio(
      this._ap.getIdCondominio(),
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
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
      }, err => {
        this.cargarPeticion.dismiss();
        this.cargarCasasLocal();
      }
    );
  }

  public cargarFamiliares(idVivienda) {
    /* si el numero de vivienda cambió y ya había una lista de familiares cargada */
    if (idVivienda && this.listaFamiliares) {
      this.listaFamiliares = undefined;
    }

    if (this.listaFamiliares) {
      return;
    }

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando familiares'
    });

    this.cargarPeticion.present();

    let peticion = this._fp.seleccionarPorIdVivienda(
      idVivienda,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
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
      }, err => {
        this.cargarPeticion.dismiss();
        this.cargarFamiliaresLocal(idVivienda);
      }
    );
  }

  public cargarContactos(idFamiliar) {
    if (idFamiliar && this.listaVisitas) {
      this.listaVisitas = undefined;
    }

    if (this.listaVisitas) {
      return;
    }

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando lista de contactos.'
    });

    this.cargarPeticion.present();

    let peticion = this._ip.seleccionarAmigosDesdeAdministracion(
      idFamiliar,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.listaVisitas = [];

        for (let i in datos) {
          let visita = datos[i];
          this.listaVisitas.push(visita);
        }
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
          this._ap.setSesionAnulada(true);
        }
      }

      this.util.ordenarPorMultiplesCampos(this.listaVisitas, "nombre", "apellido");

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
      }, err => {
        this.cargarPeticion.dismiss();
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
    this.formuRegIng.get('nombre').setValue("");
    this.formuRegIng.get('apellido').setValue("");
    this.formuRegIng.get('ci').setValue("");

    this.contactoPreexistenteSeleccionado = false;

    for (let i in this.listaVisitas) {
      let visita = this.listaVisitas[i];

      if (visita.id === idVisita) {
        this.formuRegIng.get('nombre').setValue(visita.nombre);
        this.formuRegIng.get('apellido').setValue(visita.apellido);

        if (visita.ci) {
          this.formuRegIng.get('ci').setValue(visita.ci)
        } else {
          this.formuRegIng.get('ci').setValue("");
        }

        this.contactoPreexistenteSeleccionado = true;
        return;
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
    }

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
      this.error_nombre = "El nombre no puede estar vacío.";

      this.intentoIngresar = true;
    }

    if (!idVisita && !apellido) {
      this.formuRegIng.controls["apellido"].markAsDirty();
      this.error_apellido = "El apellido no puede estar vacío.";

      this.intentoIngresar = true;
    }

    if (!idVisita) {
      idVisita = 0;
    }

    /* si el ci no es obligatorio */
    if (!ci && this.objConfiguracionCondominio.ci == "NO") {
      ci = 0;
    }

    if (!ci && this.objConfiguracionCondominio.ci == "SI") {
      this.formuRegIng.controls["ci"].markAsDirty();
      this.error_ci = "El ci no puede estar vacío.";

      this.intentoIngresar = true;
    }

    /* si la placa es obligatoria */
    if (!placa && this.objConfiguracionCondominio.placa == "SI") {
      this.formuRegIng.controls["placa"].markAsDirty();
      this.error_placa = "La placa no puede estar vacía.";

      this.intentoIngresar = true;
    }

    /* si no se seleccionó la vivienda a la que se está visitando*/
    if (!idCasa) {
      this.formuRegIng.controls["id_casa"].markAsDirty();
      this.error_casa = "Debe seleccionar una vivienda.";

      this.intentoIngresar = true;
    }

    /* si no se seleccionó la familia a la que se está visitando*/
    if (!idFamiliar) {
      this.formuRegIng.controls["id_familiar"].markAsDirty();
      this.error_familia = "Debe seleccionar un familiar.";

      this.intentoIngresar = true;
    }

    if (this.intentoIngresar) {
      return;
    }

    let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ]{1,50}$");
    if (!expNombre.test(nombre)) {
      this.formuRegIng.controls["nombre"].markAsDirty();
      this.error_nombre = `El nombre sólo puede tener entre 1 a 50 letras.`;

      this.intentoIngresar = true;
    }

    if (!expNombre.test(apellido)) {
      this.formuRegIng.controls["apellido"].markAsDirty();
      this.error_apellido = `El apellido sólo puede tener entre 1 a 50 letras.`;

      this.intentoIngresar = true;
    }

    if (this.intentoIngresar) {
      return;
    }

    this.registrarIngreso(idVisita, idFamiliar, nombre, apellido, ci, placa,
        observaciones);
  }

  public registrarIngreso(idInvitado, idFamiliar, nombre, apellido, ci, placa,
      observaciones) {
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Registrando ingreso.'
    });

    let celular = 0;
    let cantidad = 24;
    let tiempo = "horas";
    let fecha = this.util.getFechaActual();
    let expedicion = "SC";
    let horaIngreso = this.util.getFechaActual();

    let peticionInvitado = this._mp.insertarInvitacion(
      nombre,
      apellido,
      cantidad,
      tiempo,
      fecha,
      ci,
      expedicion,
      celular,
      placa,
      idFamiliar,
      idInvitado,
      observaciones,
      this._ap.getNombre(),
      this.util.getFechaActual(),
      horaIngreso,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticionInvitado.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.navCtrl.pop();
        this.util.toast("Invitado registrado.", 1500);
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
      }, err => {
        this.cargarPeticion.dismiss();
        this.noHayConexion = true;

        if (!this.platform.is("cordova")) return;

        let obj = {
          id: idInvitado,
          nombre: nombre,
          apellido: apellido,
          ci: ci,
          placa: placa,
          observaciones: observaciones,
          fkfamilia: idFamiliar
        }

        this._ig.insertar(obj);

        this.util.toast("El ingreso se registrará de manera automática cuando " +
          " el dispositivo tenga internet.");
        this.navCtrl.pop();
      }
    );
  }

  private cargarCasasLocal() {
    if (!this.platform.is("cordova")) return;

    this._viviendaDao.getDatabaseState().subscribe( listo => {
      if (listo) {
        this._viviendaDao.seleccionarTodas().then(

          (datos) => {
            this.listaCasas = [];

            for (let i in datos) {
              let casa = datos[i];

              if (casa.familia || casa.codificacion) {
                this.listaCasas.push(casa);
              }
            }
            console.log("viviendas en local " + JSON.stringify(this.listaCasas));
          }
        ); /* fin dao.seleccionarTodos() */
      }
    });
  }

  private cargarFamiliaresLocal(idVivienda) {
    if (!this.platform.is("cordova")) return;

    this._familiaresProvider.getDatabaseState().subscribe( listo => {
      if (listo) {
        this._familiaresProvider.seleccionarTodosDeVivienda(idVivienda).then(

          (datos) => {
            this.listaFamiliares = [];

            for (let i in datos) {
              let familiar = datos[i];
              this.listaFamiliares.push(familiar);
            }
            console.log("familiares en local " + JSON.stringify(this.listaFamiliares));
            this.util.ordenarPorMultiplesCampos(this.listaFamiliares, "nombre",
                "apellido");
          }
        ); /* fin dao.seleccionarTodos() */
      }
    });
  }

  public aMayusculas(evento) {
    if (evento.toUpperCase() == this.placaModificada) {
      return;
    }

    this.placaModificada = evento.toUpperCase();

    this.formuRegIng.get('placa').setValue(evento.toUpperCase());
  }

}
