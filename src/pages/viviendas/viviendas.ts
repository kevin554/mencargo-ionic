import { Component } from '@angular/core';
import { IonicPage, /*Loading,*/ LoadingController , NavController, NavParams, Platform } from 'ionic-angular';
import { AdministradorProvider, ViviendaDao, ViviendaProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-viviendas',
  templateUrl: 'viviendas.html',
})
export class ViviendasPage {

  private objCondominio:ModeloCondominio;
  private objUsuario:any;
  private viviendas:any[]; // la lista de viviendas

  public mostrarBuscador:boolean;
  /* lista auxiliar para restaurar la lista despues de una busqueda */
  private viviendasAux:any;

  /* objetos necesarios para el consumo del servicio */
  // private cargarPeticion:Loading;
  // private peticionEnCurso:any;
  public noHayConexion:boolean;

  constructor(public navCtrl: NavController, private _vp: ViviendaProvider,
      public navParams: NavParams, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider, private _ap: AdministradorProvider,
      private viviendaDao: ViviendaDao, public platform: Platform) {
    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }
   }

  ionViewDidLoad() {
   if (this.objCondominio) {
     this.cargarOnline();
   }
  }

  public alternarVistaViviendas() {
    this._ap.setViviendasComoLista(!this._ap.isViviendasComoLista());
  }

  public gestoActualizar(refresher) {
    this.cargarOnline();
    refresher.complete();
  }

  public buscarViviendas(ev) {
    let busqueda:string = ev.target.value;

    this.viviendas = this.viviendasAux;

    if (!busqueda) {
      return;
    }

    busqueda = busqueda.trim();

    this.viviendas = this.viviendas.filter(
      (vivienda) => {
        let familia = vivienda.familia.toLowerCase();
        busqueda = busqueda.toLowerCase();

        return (familia.indexOf(busqueda) > -1);
      }
    );
  }

  public cancelarBusqueda(ev) {
    this.mostrarBuscador = false;
  }

  public verVivienda(vivienda) {
    let parametros = {
       vivienda: vivienda,
       usuario: this.objUsuario
     }

   this.navCtrl.push("VerPerfilViviendaPage", parametros);
  }

  private cargarOnline() {
    // this.cargarPeticion = this.loadingCtrl.create({
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando vademecum',
      // enableBackdropDismiss: true
    });

    // this.cargarPeticion.present();
    cargarPeticion.present();

    // this.cargarPeticion.onDidDismiss( () => {
    cargarPeticion.onDidDismiss( () => {
      // this.peticionEnCurso.unsubscribe();
      peticionEnCurso.unsubscribe();
    });

    let peticion = this._vp.seleccionarTodasPorIdCondominio(
      this.objCondominio.fkcondominio,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    // this.peticionEnCurso = peticion.map( resp => {
    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();
      // console.log(JSON.stringify(datos));
      if (datos.success) {
        datos = datos.response;

        this.viviendas = [];
        this.viviendasAux = [];

        for (let indice in datos) {
          let vivienda = datos[indice];

          this.agregarEnLocal(vivienda);
          this.viviendas.push(vivienda);
          this.viviendasAux.push(vivienda);
        }
        // console.log("viviendas cargadas exitosamente: " + JSON.stringify(this.viviendas));
      } else {
        let mensaje:string = datos.message;
        // console.log(mensaje);
        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
          this._ap.setSesionAnulada(true);
        }
      }

    }).subscribe(
      success => {
        // console.log("success " + JSON.stringify(success))
        // this.cargarPeticion.dismiss();
        cargarPeticion.dismiss();
        this.noHayConexion = false;
      },
      err => {
        // this.cargarPeticion.dismiss();
        cargarPeticion.dismiss();
        this.noHayConexion = true;
        this.util.toast('Hubo un error al conectarse con el servidor.');
        this.cargarLocal();
      }
    );
  }

  private cargarLocal() {
    if (!this.platform.is("cordova")) return;

    this.viviendaDao.getDatabaseState().subscribe( listo => {
      if (listo) {
        this.viviendaDao.seleccionarTodas().then(
          (datos) => {
            this.viviendas = [];

            for (let i in datos) {
              let vivienda = datos[i];
              this.viviendas.push(vivienda);
            }
          }
        ); /* fin dao.seleccionarTodos() */
      }
    });
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

interface ModeloCondominio {

  fkcondominio:any;
  nombre_condominio:any;

}
