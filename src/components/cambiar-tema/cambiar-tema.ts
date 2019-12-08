import { Component, ChangeDetectorRef } from '@angular/core';
import { AppState } from '../../app/app.global';
import { UsuarioProvider } from '../../providers/index.services';
import { StatusBar } from '@ionic-native/status-bar';

@Component({
  selector: 'cambiar-tema',
  templateUrl: 'cambiar-tema.html'
})
export class CambiarTemaComponent {

  private tema:boolean;

  constructor(public global: AppState, private _up: UsuarioProvider,
      public detectorRef: ChangeDetectorRef, private statusBar: StatusBar) {
    // para saber si el interruptor deberia estar habilitado
    this.tema = (global.get('theme') === 'tema-oscuro');
  }

  public cambiarTema() {
    // si se habilitó el modo nocturno
    if (this.tema) {
      // this._up.cambiarModoNocturno(true);
      this._up.setModoNocturno(true);
      this.global.set('theme', 'tema-oscuro');

      // la barra de navegacion a color oscura
      this.statusBar.backgroundColorByHexString("#000000");
    } else {
      // this._up.cambiarModoNocturno(false);
      this._up.setModoNocturno(false);
      this.global.set('theme', '');

      // la barra de navegacion a color normal
      this.statusBar.backgroundColorByHexString("#002e77");
      // headerColor.tint("#30507f");
    }
  }

}
