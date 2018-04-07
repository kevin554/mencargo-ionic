import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-ver-visita',
  templateUrl: 'ver-visita.html',
})
export class VerVisitaPage {

  private objVisita:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    if (navParams.get("visita")) {
      this.objVisita = navParams.get("visita");
    }
  }

  verHistorial() {
    if (!this.objVisita) {
      return;
    }

    let parametros = {
      visita: this.objVisita
    }

    this.navCtrl.push('VerHistoricoVisitaPage', parametros)
  }

}
