import { Component } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppState } from './app.global';
import { AdministradorProvider, MovimientoProvider, IngresosProvider, UsuarioProvider, UtilServiceProvider } from '../providers/index.services';
import { HeaderColor } from '@ionic-native/header-color';
import { Network } from '@ionic-native/network';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage:any;
  intentosRestantesIngreso:number;

  constructor(platform: Platform, statusBar: StatusBar,
      splashScreen: SplashScreen, private _ap: AdministradorProvider,
      private _up: UsuarioProvider, public global: AppState,
      public alertCtrl: AlertController, private _ig: IngresosProvider,
      headerColor: HeaderColor, private network: Network,
      private util: UtilServiceProvider, private _mp: MovimientoProvider) {
    platform.ready().then(() => {

      // veo si se inició como propietario
      // halsdfklasdf
      _up.cargarStorage().then( ()=> {

        this.rootPage = 'InicioPage';

        if (_up.activo()) {
          // si el modo seguro está habilitado
          if (_up.getModoSeguro()) {
            this.verificarLectorHuellas(_up.getUsuario());
          } else {
            this.rootPage = "InicioPropietarioPage";
          }
        } else {

          // o se inició como administrador
          _ap.cargarStorage().then( () => {

            if (_ap.activo()) {
              this.rootPage = 'InicioAdministradorPage';
            }

          });
        }
        // else if (!this.rootPage) {
        //   this.rootPage = 'InicioPage';
        // }

      });

      this.network.onConnect().subscribe(() => {
        // console.log("hay que insertar: ");

        if (!platform.is("cordova")) return;

        _ig.getDatabaseState().subscribe( listo => {
          if (listo) {
            _ig.seleccionarTodas().then( (datos) => {
              for (let i in datos) {
                let ingreso = datos[i];
                // console.log(JSON.stringify(ingreso));

                this.insertarIngresoPendiente(ingreso);
              }
            });
          }
        });
        // console.log('network connected!');
        // // We just got a connection but we need to wait briefly
        //  // before we determine the connection type. Might need to wait.
        // // prior to doing any api requests as well.
        // setTimeout(() => {
        //   if (this.network.type === 'wifi') {
        //     console.log('we got a wifi connection, woohoo!');
        //   } else {
        //     console.log(this.network.type);
        //   }
        // }, 3000);
      });

      // // o se inició como administrador
      // _ap.cargarStorage().then( () => {
      //   // if (this.rootPage) return;
      //
      //   if (_ap.activo() && !this.rootPage) {
      //     this.rootPage = 'InicioAdministradorPage';
      //   } else if (!this.rootPage) {
      //     this.rootPage = 'InicioPage';
      //   }
      // });

      if (_up.getModoNocturno2()) {
        this.global.set('theme', 'tema-oscuro');
      } else {
        global.set('theme', '');
      }


      global.set('modo-seguro', 'inhabilitado');

      statusBar.backgroundColorByHexString("#002e77");
      headerColor.tint("#002e77");
      splashScreen.hide();
    });
  }

  private insertarIngresoPendiente(ingreso) {
    let celular = 0;
    let cantidad = 24;
    let tiempo = "horas";
    let fecha = this.util.getFechaActual();
    let expedicion = "SC";
    let horaIngreso = this.util.getFechaActual();

    let peticion = this._mp.insertarInvitacion(
      ingreso.nombre,
      ingreso.apellido,
      cantidad,
      tiempo,
      fecha,
      ingreso.ci,
      expedicion,
      celular,
      ingreso.placa,
      ingreso.fkfamilia,
      ingreso.id,
      ingreso.observaciones,
      this._ap.getNombre(),
      this.util.getFechaActual(),
      horaIngreso,
      this._ap.getId(),
      this._ap.getCodigo()
    );

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this._ig.eliminar(ingreso.id);
      } else {
        // console.log("!datos.success: " + datos.message);
      }

    }).subscribe(
      success => {
        // console.log("success: " + JSON.stringify(success));
      }, err => {
        // console.log("err: " + JSON.stringify(err));
      }
    );
  }

  private verificarLectorHuellas(usuario, switchModoSeguro?) {
    this.mostrarPantallaDesbloqueo(usuario)
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
