import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-enviar-notificacion',
  templateUrl: 'enviar-notificacion.html',
})
export class EnviarNotificacionPage {

  private objCondominio:any;
  private objUsuario:any;
  private destinatarios:any[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

    if (navParams.get("casas")) {
      this.destinatarios = navParams.get("destinatarios");
    }

    if (navParams.get("usuarios")) {
      this.destinatarios = navParams.get("destinatarios");
    }

    if (navParams.get("familiares")) {
      this.destinatarios = navParams.get("destinatarios");
    }
  }

  public verDestinatarios() {

  }

  public enviarNotificacion() {

  }

}
