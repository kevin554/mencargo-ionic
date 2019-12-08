import { Component } from '@angular/core';
import { App, AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UsuarioProvider, UtilServiceProvider } from '../../providers/index.services';
import { AppState } from '../../app/app.global';
// import { AndroidFingerprintAuth, AFAAuthOptions } from '@ionic-native/android-fingerprint-auth';
import { Firebase } from '@ionic-native/firebase';

@IonicPage()
@Component({
  selector: 'page-ver-perfil-propietario',
  templateUrl: 'ver-perfil-propietario.html',
})
export class VerPerfilPropietarioPage {

  /* { id, nombre, apellido, celular, telefono, correo } */
  private objFamiliar:any;
  private modoSeguro:boolean;
  /* para evitar que el toggle del modo seguro se active 2 veces*/
  private huboCambios:boolean;

  constructor(public app: App, public navParams: NavParams,
      public navCtrl: NavController, public global: AppState,
      public viewCtrl: ViewController, private _up: UsuarioProvider,
      // private androidFingerprintAuth: AndroidFingerprintAuth,
      public alertCtrl: AlertController, private util: UtilServiceProvider,
      private firebase: Firebase) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    /* para saber si el interruptor debería estar habilitado */
    this.modoSeguro = this.modoSeguroHabilitado();
  }

  public cerrarSesion() {
    this.firebase.unregister().then(
      success => {
        console.log(`success ${JSON.stringify(success)}`)
      }
    ).catch( error => {
      console.log(`error ${JSON.stringify(error)}`)
    });

    this._up.cerrarSesion();

    this.navCtrl.setRoot("InicioPage");
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
  //   this.androidFingerprintAuth.isAvailable().then(
  //     result => {
  //       console.log('is available: ' + JSON.stringify(result));
  //
  //       if(result.isAvailable) {
  //         /* esta disponible */
  //         let data:AFAAuthOptions = {
  //           clientId: 'myAppName',
  //           locale: 'es' /* en español */
  //         }
  //
  //         this.androidFingerprintAuth.encrypt(data).then(
  //           result => {
  //             console.log('encrypt: ' + result);
  //
  //
  //              if (result.withFingerprint) {
  //                console.log('ingreso exitoso')
  //              } else if (result.withBackup) {
  //                console.log('ingreso exitoso')
  //              }
  //           }, arr => {
  //             console.log('arr')
  //             // cuando se cancela
  //           })
  //       }
  //   }
  // )
    if (this.modoSeguroHabilitado()) {
      this.confirmarDeshabilitarmodoSeguro(switchModoSeguro);
    } else {
      this.confirmarHabilitarmodoSeguro(switchModoSeguro);
    }
  }

  private confirmarDeshabilitarmodoSeguro(switchModoSeguro) {
    let alert = this.alertCtrl.create({
      title: '¿Desea desactivar el modo seguro?',
      message: `<p>Ingrese su contraseña</p>
      <p text-center>Si olvidó su contraseña ingrese su ci</p>`,
      inputs: [
        {
          name: 'contra',
          placeholder: 'Contraseña',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        // {
        //   text: 'Olvidé mi contraseña',
        // },
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
      this.util.toast('Debe ingresar su contraseña', 2000)
      this.confirmarDeshabilitarmodoSeguro(switchModoSeguro);

      return;
    }

    /* se introdujo el ci */
    if (password == this.objFamiliar.ci) {
      this.huboCambios = true;
      switchModoSeguro.checked = false;

      this.modoSeguro = false;

      this._up.cambiarModoSeguro(false);
      this.global.set("modo-seguro", "inhabilitado");

      return;
    }

    if (this._up.getPasswordModoSeguro() !== password) {
      this.util.toast('Contraseña incorrecta', 2000);
      this.confirmarDeshabilitarmodoSeguro(switchModoSeguro);

      return;
    }

    /* la contraseña es correcta */
    if (this._up.getPasswordModoSeguro() == password) {
      this.huboCambios = true;
      switchModoSeguro.checked = false;

      this.modoSeguro = false;

      this._up.cambiarModoSeguro(false);
      this.global.set("modo-seguro", "inhabilitado");
    }
  }

  /**
  * ofrece utilizar una contraseña personalizada cuando no se dispone
  * fisicamente de un lector de huellas en el dispositivo
  */
  public confirmarHabilitarmodoSeguro(switchModoSeguro) {
    let alert = this.alertCtrl.create({
      title: '¿Desea activar el modo seguro?',
      message: 'Deberá autenticarse cada vez que utilice la aplicacion',
      inputs: [
        {
          name: 'contra',
          placeholder: 'Contraseña',
          type: 'password'
        },
        {
          name: 'contraConfirmada',
          placeholder: 'Confime su contraseña',
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
      this.util.toast('Debe ingresar los 2 campos', 2000);
      this.confirmarHabilitarmodoSeguro(switchModoSeguro);
      return;
    }

    if (password !== confirmPassword) {
      this.util.toast('Las contraseñas no coinciden', 2000);
      this.confirmarHabilitarmodoSeguro(switchModoSeguro);
      return;
    }

    this.huboCambios = true;
    switchModoSeguro.checked = true;

    this.modoSeguro = true;

    this._up.cambiarModoSeguro(true, password);
    this.global.set("modo-seguro", "habilitado");
  }

  private modoSeguroHabilitado():boolean {
    return this._up.getModoSeguro();
  }

}
