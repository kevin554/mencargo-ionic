import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})
export class TutorialPage {

  public tutorial:string;

  @ViewChild(Slides) slides: Slides;

  // LOS TUTORIALES QUE SE ESTAN MOSTRANDO
  public TUTORIAL_ENVIAR_INVITACION:number = 0;
  public TUTORIAL_LISTA_CONTACTOS:number = 1;

  // LOS TUTORIALES QUE SE MUESTRAN
  public PRIMERA_VEZ_USANDO_LA_APP:string = "inicio";
  public PRIMERA_VEZ_ENVIANDO_INVITACION:string = "enviar invitacion";
  public PRIMERA_VEZ_CREANDO_EVENTO:string = "crear evento";

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public viewCtrl: ViewController) {
    if (navParams.get("tutorial")) {
      this.tutorial = navParams.get("tutorial");
    }
  }

  siguiente(pantallaOrigen) {
    switch (pantallaOrigen) {
      case this.TUTORIAL_ENVIAR_INVITACION:
        this.slides.slideTo(this.TUTORIAL_LISTA_CONTACTOS, 500);
        break;

      case this.TUTORIAL_LISTA_CONTACTOS:
        break;
    }

  }

  cerrar() {
    this.viewCtrl.dismiss();
  }

}
