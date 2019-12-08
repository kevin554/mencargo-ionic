import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-inicio-propietario',
  templateUrl: 'inicio-propietario.html',
})
export class InicioPropietarioPage {

  private objPropietario:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public firebase) {
    /* para estar al tanto de las notificaciones que llegarán */
    this.recibirNotificaciones();
  }

  private recibirNotificaciones() {
    /* para tomar acciones cuando el usuario toque la notificacion */
    if (this.objPropietario.token != "Sin Token") { // sólo voy a estar atento, si el usuario tiene token

      this.firebase.onNotificationOpen().subscribe( // estoy atento de las notificaciones entrantes

        success => { // cada vez que llegue una notificación SE VA A EJECUTAR TODO ESTO
          if (success.message_body) {
            let mensaje:string = success.message_body;

            if (success.tap) {
              // VA A ENTRAR ACÁ SI ES QUE LA APP NO ESTABA ABIERTA

              // this.navCtrl.setRoot('VerNotificacionPage', parametros);
            } else {
              // SI LA APP ESTABA ABIERTA, VIENE DIRECTO AL ELSE

              // this.navCtrl.push('VerNotificacionPage', parametros);
            }
          }

        }, err => {
          // algún error ocurrió
        }
      ) // fin de onNotificationOpen().subscribe()

    }
  }

}
