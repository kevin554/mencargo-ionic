import { Component } from '@angular/core';
import { IonicPage, LoadingController , NavController, NavParams } from 'ionic-angular';

// import { ViviendaProvider, UtilServiceProvider, ViviendaDao } from '../../providers/index.services';
import { ViviendaProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-viviendas',
  templateUrl: 'viviendas.html',
})
export class ViviendasPage {

  private objCondominio:ModeloCondominio;
  private viviendas:any[]; // la lista de viviendas
  private noHayConexion:boolean;

  constructor(public navCtrl: NavController, private _vp: ViviendaProvider,
      public navParams: NavParams, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider) {
      // private util: UtilServiceProvider, private viviendaDao: ViviendaDao) {
    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }
   }

  ionViewDidLoad() {
   if (this.objCondominio) {
     this.cargarTodas();
   }
  }

  public gestoActualizar(refresher) {
    this.cargarTodas();
    refresher.complete();
  }

 public verVivienda(vivienda) {
   let parametros = {
     vivienda: vivienda,
   }

   this.navCtrl.push('VerPerfilViviendaPage', parametros);

 }

  private cargarTodas() {
    // primero local
    // this.viviendaDao.getDatabaseState().subscribe( rdy => {
    //   if (rdy) {
    //     this.viviendaDao.seleccionarTodas().then( (data) => {
    //       if (data.length === 0) {
    //         console.log('la lista no titenen elementos')
            this.cargarOnline();
    //       } else {
    //         console.log('en local ' + JSON.stringify(data))
    //       }
    //     });
    //   }
    // })


  }

  cargarOnline() {
    // online
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando viviendas',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();

      if (!this.viviendas) {
        this.noHayConexion = true;
      }

      return;
    });

    let peticion = this._vp.seleccionarTodasPorIdCondominio(this.objCondominio.fkcondominio);

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.viviendas = [];

        for (let indice in datos) {
          let vivienda = datos[indice];
          this.viviendas.push(vivienda);

          // agregar a local
          // this.viviendaDao.insertar(vivienda, this.objCondominio.fkcondominio);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.noHayConexion = false;
      },
      err => {
        this.noHayConexion = true;
        this.util.toast('hubo un error al conectarse con el servidor');
        cargarPeticion.dismiss();
      }
    );
  }

}

interface ModeloCondominio {

  fkcondominio:any;
  nombre_condominio:any;

}
