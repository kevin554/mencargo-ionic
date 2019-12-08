import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppState } from '../../../app/app.global';

@IonicPage()
@Component({
  selector: 'page-popover-propietario',
  templateUrl: 'popover-propietario.html',
})
export class PopoverPropietarioPage {

  private objFamiliar:any;

  constructor(public app: App, public navParams: NavParams,
      public navCtrl: NavController, public global: AppState,
      public viewCtrl: ViewController) {
    if (this.navParams.get('familiar')) {
      this.objFamiliar = this.navParams.get('familiar');
    }
  }

  public verPerfil() {
    let parametros = {
      familiar: this.objFamiliar
    }

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push('VerPerfilPropietarioPage', parametros);

    this.viewCtrl.dismiss(); // para cerrar el menu
  }

}
