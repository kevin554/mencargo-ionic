import { Component } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppState } from './app.global';
import { AdministradorProvider, UsuarioProvider, UtilServiceProvider } from '../providers/index.services';
import { AndroidFingerprintAuth, AFAAuthOptions } from '@ionic-native/android-fingerprint-auth';
import { HeaderColor } from '@ionic-native/header-color';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage:any;
  intentosRestantesIngreso:number;

  constructor(private platform: Platform, statusBar: StatusBar,
      splashScreen: SplashScreen, _ap: AdministradorProvider,
      private _up: UsuarioProvider, public global: AppState,
      private androidFingerprintAuth: AndroidFingerprintAuth,
      public alertCtrl: AlertController, private util: UtilServiceProvider,
      headerColor: HeaderColor) {
    this.intentosRestantesIngreso = 3;

    platform.ready().then(() => {

        // veo si se inició como propietario
        _up.cargarStorage().then( ()=> {
          if (_up.activo()) {
            // si el modo seguro está habilitado
            if (_up.getModoSeguro()) {
              this.verificarLectorHuellas(_up.getUsuario());
              // this.mostrarPantallaDesbloqueo(_up.getUsuario());
            } else {
              this.rootPage = "InicioPropietarioPage"
            }
          } else if (!this.rootPage) {
            this.rootPage = 'InicioPage';
          }
        });

      // o se inició como administrador
      _ap.cargarStorage().then( () => {
        if (_ap.activo()) {
          this.rootPage = 'InicioAdministradorPage';
        } else if (!this.rootPage) {
          this.rootPage = 'InicioPage';
        }
      });

      if (_up.getModoNocturno()) {
        this.global.set('theme', 'tema-oscuro');
      } else {
        global.set('theme', '');
      }


      global.set('modo-seguro', 'inhabilitado');

      statusBar.backgroundColorByHexString("#002e77"); // 00367c
      headerColor.tint("#002e77");
      splashScreen.hide();
    });
  }

  private verificarLectorHuellas(usuario, switchModoSeguro?) {
    // this.androidFingerprintAuth.isAvailable().then(
    //   (result) => {
    //
    //     console.log('result ' + JSON.stringify(result))
    //
    //     if(result.isAvailable) {
    //       /* esta disponible */
    //       let data:AFAAuthOptions = {
    //         clientId: 'myAppName',
    //         locale: 'es' /* en español */
    //       }
    //
    //       this.androidFingerprintAuth.encrypt(data).then(
    //         result => {
    //            if (result.withFingerprint) {
    //              console.log('ingreso exitoso')
    //              this.rootPage = "InicioPropietarioPage";
    //            } else if (result.withBackup) {
    //              console.log('ingreso exitoso')
    //              this.rootPage = "InicioPropietarioPage";
    //            } else {
    //              // nunca entra
    //              console.log('else');
    //            }
    //         }).catch(
    //           error => {
    //             console.log('error ' + console.log(JSON.stringify(error)))
    //
    //             // nunca entra
    //             if (error === this.androidFingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
    //               console.log('Fingerprint authentication cancelled');
    //             } else {
    //               console.error('in the catch of encrypt ' + error)
    //             }
    //           }
    //         );
    //
    //     } else {
    //       // nunca
    //       console.log('lector no disponible')
    //     }
    // }, err => {
    //   console.log('err ' + console.log(JSON.stringify(err)))
    // }).catch(
    //   error => {
        this.mostrarPantallaDesbloqueo(usuario)
    //   }
    // );
  }

  private mostrarPantallaDesbloqueo(usuario?) {
    let alert = this.alertCtrl.create({
      title: 'Ingrese su Contraseña',
      message: `<p>ingrese su contraseña</p>
      <p text-center>si olvidó su contraseña ingrese su ci</p>`,
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'contra',
          placeholder: 'contraseña',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Ingresar',
          handler: datos => {
            this.procesarDesbloqueo(datos.contra, usuario);
          }
        }
      ],
    });

    alert.present();
  }

  private procesarDesbloqueo(password, usuario) {
    if (!password) {
      this.mostrarPantallaDesbloqueo(usuario);

      return;
    }

    /* se introdujo el ci */
    if (password == usuario.ci) {
      this.rootPage = "InicioPropietarioPage";

      return;
    }

    /* si la contraseña es incorrecta */
    if (this._up.getPasswordModoSeguro() !== password) {
      this.mostrarPantallaDesbloqueo(usuario);

      return;
    }


    if (this._up.getPasswordModoSeguro() == password) {
      this.rootPage = "InicioPropietarioPage";

      return;
    }
  }

}
