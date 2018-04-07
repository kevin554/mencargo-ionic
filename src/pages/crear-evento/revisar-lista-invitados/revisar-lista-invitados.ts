import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-revisar-lista-invitados',
  templateUrl: 'revisar-lista-invitados.html',
})
export class RevisarListaInvitadosPage {

  private objEvento:any;
  private invitados:any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private alertCtrl: AlertController) {
    if (navParams.get("invitados")) {
      this.invitados = navParams.get("invitados");
    }

    if (navParams.get("evento")) {
      this.objEvento = navParams.get("evento");
    }
  }

  public confirmarEvento() {
    let advertencia:string = "Los contactos seleccionados recibirán el mismo " +
        "código QR. Su ingreso será controlado en portería mediante una copia " +
        "de esta lista de invitados, enviada directamente al guardia";

    let alert = this.alertCtrl.create({
      message: advertencia,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.crearEvento();
          }
        }
      ]
    });

    alert.present();
  }

  private crearEvento() {
    let parametros = {
      idEvento: "TEFOR",
      nombreEvento: this.objEvento.nombre
    }

    this.navCtrl.push("CodigoInvitacionPage", parametros);
  }

  irAlInicio() {
    this.navCtrl.setRoot("InicioPropietarioPage");
  }

}
