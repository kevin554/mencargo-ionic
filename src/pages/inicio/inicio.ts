import { Component, ViewChild } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { IonicPage, LoadingController, NavController, Platform } from 'ionic-angular';
import { FamiliaProvider, UsuarioProvider, UtilServiceProvider } from '../../providers/index.services';
import { SwalComponent } from '@toverux/ngx-sweetalert2';

@IonicPage()
@Component({
  selector: 'page-inicio',
  templateUrl: 'inicio.html',
})
export class InicioPage {

  @ViewChild('alertaEstadoIngreso') public alertaEstadoIngreso: SwalComponent;

  constructor(public navCtrl: NavController, public platform: Platform,
    public loadingCtrl: LoadingController, public scanner: BarcodeScanner,
    private util: UtilServiceProvider, private _up: UsuarioProvider,
    private _fp: FamiliaProvider) { }

  /**
  * muestra en pantalla completa si el ingreso/salida fue exitoso o no
  */
  private mostrarEstadoIngreso(mensaje, estado: boolean) {
    this.alertaEstadoIngreso.title = mensaje;
    this.alertaEstadoIngreso.type = estado ? "success" : "error";

    this.alertaEstadoIngreso.show();
  }

  public ingresoAdm() {
    this.navCtrl.push("LoginAdministradorPage");
  }

  public ingresoPropietario() {
    /* para ingresar desde el navegador */
    if (!this.platform.is("cordova")) {
      this.verificarCuenta("288");
      return;
    }

    let preferencias: BarcodeScannerOptions = {
      prompt: `Coloque un código QR en el interior del rectángulo del visor para escanear`,
      resultDisplayDuration: 500
    };

    this.scanner.scan(preferencias).then(datos => {
      /* si presionó la tecla atrás */
      if (datos.cancelled) {
        return;
      }

      this.verificarCuenta(datos.text);
    }).catch((err) => {
      console.log('hubo un error al escanear (' + JSON.stringify(err) + ')')

      if (err === "Illegal access") {
        console.log('permiso a la cámara denegado por parte del usuario')
      }
    })
  }

  private verificarCuenta(codigo) {
    /* se va a mostrar una espera mientras se realiza la peticion */
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Ingresando'
    });

    cargarPeticion.present();

    let peticion = this._fp.seleccionar(codigo);

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss(() => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        this._up.ingresar(datos.response);
        this.navCtrl.setRoot("InicioPropietarioPage");
      } else {
        if (datos.message.trim() == 'Código ya utilizado el familiar ya inicio sesión.') {
          this.mostrarEstadoIngreso('Ya iniciaste sesión en otro dispositivo',
            false);
        } else {
          this.mostrarEstadoIngreso('Credencial incorrecto', false);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      }, err => {
        this.util.toast(`Hubo un error al conectarse con el servidor`);
        cargarPeticion.dismiss();
      }
    );
  }

  public irAPropietario(){
    this.navCtrl.push("SeleccionarMetodoLoginPage");
  }

}
