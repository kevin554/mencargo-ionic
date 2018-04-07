import { Component } from '@angular/core';
import { App, AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { UsuarioProvider, UtilServiceProvider } from '../../../providers/index.services';
import { AppState } from '../../../app/app.global';
import { AndroidFingerprintAuth, AFAAuthOptions } from '@ionic-native/android-fingerprint-auth';

@IonicPage()
@Component({
  selector: 'page-popover-propietario',
  templateUrl: 'popover-propietario.html',
})
export class PopoverPropietarioPage {

  private objFamiliar:any;
  private modoSeguro:boolean;
  /* para evitar que el toggle del modo seguro se active 2 veces*/
  private huboCambios:boolean;

  constructor(public app: App, public navParams: NavParams,
      public navCtrl: NavController, public global: AppState,
      public viewCtrl: ViewController, private _up: UsuarioProvider,
      private androidFingerprintAuth: AndroidFingerprintAuth,
      public alertCtrl: AlertController, private util: UtilServiceProvider) {
    if (this.navParams.get('familiar')) {
      this.objFamiliar = this.navParams.get('familiar');
    }

    /* para saber si el interruptor debería estar habilitado */
    this.modoSeguro = this.modoSeguroHabilitado();
  }

  public verPerfil() {
    let parametros = {
      familiar: this.objFamiliar
    }

    let navCtrlPadre = this.app.getActiveNavs()[0];
    navCtrlPadre.push('VerPerfilPropietarioPage', parametros);

    this.viewCtrl.dismiss(); // para cerrar el menu
  }

  public cambiarModoSeguro(switchModoSeguro) {
    if (this.huboCambios) {
      this.huboCambios = false;
      return;
    }

    /* debe permanecer como estaba */
    this.huboCambios = true;
    switchModoSeguro.checked = !this.modoSeguro;

    this.verificarLectorHuellas(switchModoSeguro);
  }

  private verificarLectorHuellas(switchModoSeguro) {
    this.androidFingerprintAuth.isAvailable().then(
      (result) => {
        if(result.isAvailable) {
          // esta disponible
          let data:AFAAuthOptions = {
            clientId: 'myAppName',
            locale: 'es' /* en español */
          }

          this.androidFingerprintAuth.encrypt(data).then(
            result => {
               if (result.withFingerprint) {
                 console.log('ingreso exitoso')
               } else if (result.withBackup) {
                 console.log('ingreso exitoso')
               } else {
                 console.log('else');
               }
            }).catch(
              error => {
                if (error === this.androidFingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
                  console.log('Fingerprint authentication cancelled');
                } else {
                  console.error('in the catch of encrypt ' + error)
                }
              }
            );

        } else {
          console.log('lector no disponible')
        }
    }).catch(
      error => {

        if (this.modoSeguroHabilitado()) {
          this.confirmarDeshabilitarmodoSeguro(switchModoSeguro);
        } else {
          this.confirmarHabilitarmodoSeguro(switchModoSeguro);
        }

      }
    );
  }

  private confirmarDeshabilitarmodoSeguro(switchModoSeguro) {
    let alert = this.alertCtrl.create({
      title: '¿Desea desactivar el modo seguro?',
      message: 'ingrese su contraseña',
      inputs: [
        {
          name: 'contra',
          placeholder: 'contraseña',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Deshabilitar',
          handler: datos => {
            this.deshabilitarmodoSeguro(datos.contra, switchModoSeguro);
          }
        }
      ]
    });

    alert.present();
  }

  private deshabilitarmodoSeguro(password, switchModoSeguro) {
    if (!password) {
      this.util.toast('debe ingresar su contraseña', 2000)
      this.confirmarDeshabilitarmodoSeguro(switchModoSeguro);

      return;
    }

    if (this._up.getPasswordModoSeguro() !== password) {
      this.util.toast('contraseña incorrecta', 2000);
      this.confirmarDeshabilitarmodoSeguro(switchModoSeguro);

      // ofrecer deshabilitar con el ci

      return;
    }

    switchModoSeguro.checked = false;
    this.modoSeguro = false;

    this._up.cambiarModoSeguro(false);
    this.global.set("modo-seguro", "inhabilitado");
  }

  /**
  * ofrece utilizar una contraseña personalizada cuando no se dispone
  * fisicamente de un lector de huellas en el dispositivo
  */
  public confirmarHabilitarmodoSeguro(switchModoSeguro) {
    let alert = this.alertCtrl.create({
      title: '¿Desea activar el modo seguro?',
      message: 'deberá autenticarse cada vez que utilice la aplicacion',
      inputs: [
        {
          name: 'contra',
          placeholder: 'contraseña',
          type: 'password'
        },
        {
          name: 'contraConfirmada',
          placeholder: 'confime su contraseña',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Habilitar',
          handler: datos => {
            this.habilitarmodoSeguro(datos.contra, datos.contraConfirmada,
                switchModoSeguro);
          }
        }
      ]
    });

    alert.present();
  }

  private habilitarmodoSeguro(password, confirmPassword, switchModoSeguro) {
    if (!password || !confirmPassword) {
      this.util.toast('debe ingresar los 2 campos', 2000);
      this.confirmarHabilitarmodoSeguro(switchModoSeguro);
      return;
    }

    if (password !== confirmPassword) {
      this.util.toast('las contraseñas no coinciden', 2000);
      this.confirmarHabilitarmodoSeguro(switchModoSeguro);
      return;
    }

    switchModoSeguro.checked = true;
    this.modoSeguro = true;

    this._up.cambiarModoSeguro(true, password);
    this.global.set("modo-seguro", "habilitado");
    console.log(`la contraseña para el modo seguro es ${password}`)
  }

  private modoSeguroHabilitado():boolean {
    return this._up.getModoSeguro();
  }

}
