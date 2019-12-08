import { Component } from '@angular/core';
import { AlertController, Loading, IonicPage, LoadingController, NavController, NavParams, Platform, PopoverController } from 'ionic-angular';
import { FamiliaProvider, FamiliaresProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-familiares',
  templateUrl: 'ver-familiares.html',
})
export class VerFamiliaresPage {

  public noHayConexion:boolean;
  private objVivienda:any;
  private objUsuario:any;
  private familiares:any[]; /* la lista de familiares */
  private cantidadQrDisponibles:any;
  private cargarPeticion:Loading;
  private peticionEnCurso:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _fp: FamiliaProvider, private alertCtrl: AlertController,
      public popoverCtrl: PopoverController, public util: UtilServiceProvider,
      public loadingCtrl: LoadingController, public platform: Platform,
      public _familiaresProvider: FamiliaresProvider) {
    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

    if (navParams.get("vivienda")) {
      this.objVivienda = navParams.get("vivienda");
    }

    this.cantidadQrDisponibles = Array(3).fill(0);
  }

  ionViewDidLoad() {
    if (this.objVivienda) {
      this.cargarFamiliares();
    }
  }

  public gestoActualizar(refresher) {
    this.cargarFamiliares();
    refresher.complete();
  }

  public irAlInicio() {
    this.navCtrl.setRoot('InicioAdministradorPage');
  }

  public registrarFamiliar() {
    let cuentaDePago = this.familiares.length >= 3;

    let parametros = {
      vivienda: this.objVivienda, /* para obtener la codificacion */
      familiares: this.familiares, /* para agregar el nuevo a la lista */
      dePago: cuentaDePago,
      /* para disminuir en 1 al agregar un familiar*/
      qrDisponibles: this.cantidadQrDisponibles,
      soloLectura: false
    };

    this.navCtrl.push("RegistrarFamiliarPage", parametros);
  }

  public hayQrDisponibles():boolean {
    return this.cantidadQrDisponibles.length > 0;
  }

  public desplegarMenu(evento, familiar) {
    let parametros = {
      familiar: familiar,
      familiares: this.familiares,
      vivienda: this.objVivienda,
      dePago: false, //cuentaDePago,
      soloLectura: false
    };

    let popover = this.popoverCtrl.create("PopoverPage", parametros);
    popover.present({
      ev: evento
    });
  }

  private cargarFamiliares() {
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando lista de familiares.'
    });

    this.cargarPeticion.present();

    let peticion = this._fp.seleccionarPorIdVivienda(
      this.objVivienda.id,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp =>  {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.familiares = [];
        this.cantidadQrDisponibles = Array(3).fill(0);

        for (let indice in datos) {
          let familiar = datos[indice];

          this.agregarEnLocal(familiar);
          this.familiares.push(familiar);
          this.cantidadQrDisponibles.pop();
        }
      }

    }).subscribe(
      success => {
        this.noHayConexion = false;
        this.cargarPeticion.dismiss();
      },
      err => {
        this.noHayConexion = true;
        this.cargarPeticion.dismiss();
      }
    );
  }

  private agregarEnLocal(familiar) {
    if (!this.platform.is("cordova")) return;

    /* el objeto listo para insertar en local */
    let obj = {
      id: familiar.id,
      nombre: familiar.nombre,
      apellido: familiar.apellido,
      genero: familiar.genero,
      ci: familiar.ci,
      celular: familiar.celular,
      telefono: familiar.telefono,
      correo: familiar.correo,
      fkvivienda: familiar.fkvivienda,
    }

    this._familiaresProvider.insertar(obj);
  }

  public confimarEliminar(indice) {
    let alert = this.alertCtrl.create({
      title: '¿Eliminar?',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Si',
          handler: () => { this.eliminar(indice) }
        }
      ]
    });

    alert.present();
  }

  private eliminar(indice) {
    let familiar = this.familiares[indice];

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Eliminando'
    });

    this.cargarPeticion.present();

    let peticion = this._fp.eliminar(familiar.id);

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.familiares.splice(indice, 1);

        if (this.familiares.length < 3) {
          this.cantidadQrDisponibles.push(0);
        }

        if (this.platform.is("cordova")) {
          this._familiaresProvider.eliminar(familiar.id);
        }
      } else {
        this.util.alert("Hubo un error al eliminar el familiar.", "");
      }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss()
      },
      err => {
        this.cargarPeticion.dismiss();
        this.util.toast('Hubo un error al conectarse con el servidor.');
      }
    );
  }

}
