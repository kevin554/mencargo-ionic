import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { MovimientoProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-historico-visita',
  templateUrl: 'ver-historico-visita.html',
})
export class VerHistoricoVisitaPage {

  private objVisita:any;
  private noHayConexion:boolean;
  private lista:any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _mp: MovimientoProvider, private loadingCtrl: LoadingController) {
    if (navParams.get("visita")) {
      this.objVisita = navParams.get("visita");
      this.cargarHistorial();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VerHistoricoVisitaPage');
  }

  private cargarHistorial() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando el historial de visitas',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._mp.seleccionarHistorialInvitado(this.objVisita.invitado_id);

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.lista = [];

        for (let indice in datos) {
          let visita = datos[indice];
          this.lista.push(visita);
        }

      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
        this.noHayConexion = false;
      }, err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    )
  }

  obtenerHora(fecha:string) {
    if (!fecha || fecha.toLowerCase() === "none") {
      return "";
    }

    /* hay 10 letras que ocupa la fecha  */
    return fecha.substring(10, fecha.length);
  }

  obtenerFecha(fecha:string) {
    if (!fecha || fecha.toLowerCase() === "none") {
      return "";
    }

    /* las primeras 10 letras de la fecha */
    return fecha.substring(0, 10);
  }

}
