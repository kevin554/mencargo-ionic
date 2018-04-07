import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppState } from '../../../app/app.global';

@IonicPage()
@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html',
})
export class PopoverPage {

  private objVivienda:any;
  private objFamiliar:any;
  private familiares:any[];
  private cuentaDePago:boolean;
  private soloLectura:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController, public app: App,
      public global: AppState) {
    if (navParams.get('familiar')) {
      this.objFamiliar = navParams.get('familiar')
    }

    if (navParams.get('vivienda')) {
      this.objVivienda = navParams.get('vivienda');
    }

    if (navParams.get('familiares')) {
      this.familiares = navParams.get('familiares');
    }

    if (navParams.get('dePago')) {
      this.cuentaDePago = navParams.get('dePago');
    }

    if (navParams.get('soloLectura')) {
      this.soloLectura = navParams.get('soloLectura');
    }
  }

  public editarFamiliar() {
    let parametros = {
      vivienda: this.objVivienda, /* para obtener la codificacion */
      familiar: this.objFamiliar,
      familiares: this.familiares, /* para agregar el nuevo a la lista */
      dePago: this.cuentaDePago,
      soloLectura: false
    };

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push('RegistrarFamiliarPage', parametros)

    this.viewCtrl.dismiss();
  }

  public generarQR() {
    let parametros = {
      idFamiliar: this.objFamiliar.id
    };

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push('CodigoInvitacionPage', parametros);

    this.viewCtrl.dismiss();
  }

}
