import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import QRCode from 'qrcode';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-codigo-invitacion',
  templateUrl: 'codigo-invitacion.html',
})
export class CodigoInvitacionPage {

  private codificacion:string;
  private sePuedeCompartir:boolean;
  private codigoGenerado:any;
  private nombreInvitado:string;
  private nombreEvento:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private socialSharing: SocialSharing) {
    if (navParams.get("nombreInvitado")) {
      this.nombreInvitado = navParams.get("nombreInvitado");
    }

    if (navParams.get("idFamiliar")) {
      this.codificacion = navParams.get('idFamiliar').toString();
    }

    if (navParams.get("idInvitado")) {
      this.codificacion = navParams.get("idInvitado").toString();
      this.sePuedeCompartir = true;
    }

    if (navParams.get("idEvento")) {
      this.codificacion = navParams.get("idEvento").toString();
      this.sePuedeCompartir = true;
    }

    if (navParams.get("nombreEvento")) {
      this.nombreEvento = navParams.get("nombreEvento");
    }

    this.procesar();
  }

  /**
  * Ofrece la opcion de compartir el codigo QR por medio de la red social
  * deseada por parte del usuario
  */
  public compartir() {
    if (!this.sePuedeCompartir) {
      return;
    }

    this.socialSharing.share(null, null, this.codigoGenerado, null);
  }

  private procesar() {
    const qrcode = QRCode;
    const self = this;

    qrcode.toDataURL(self.codificacion, { errorCorrectionLevel: 'H' },
      function (err, url) {
        self.codigoGenerado = url;
      });
  }

}
