import { Component, ViewChild } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdministradorProvider, UtilServiceProvider } from '../../providers/index.services';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
/**
 * Generated class for the RegistrarUsuarioPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-registrar-usuario-password',
  templateUrl: 'registrar-usuario-password.html',
})
export class RegistrarUsuarioPasswordPage {
  @ViewChild('alertaErrorInicioSesion') private alertaErrorInicioSesion: SwalComponent;
  private formuEditFam: FormGroup;
  private intentoregistrarUsuario: boolean;
  public error_username: string;
  public error_password: string;
  public error_verificarPassword: string;

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController, private _ap: AdministradorProvider,
    private util: UtilServiceProvider) {
    this.formuEditFam = formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      verificarPassword: ['', Validators.compose([Validators.required])],

    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrarUsuarioPasswordPage');
  }

  private registrarUsuario(user, password) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Ingresando',
      dismissOnPageChange: true
    });

    cargarPeticion.present();

    let peticion = this._ap.login(user, password);

    /* si se cancela la espera antes de que finalice la petición */
    cargarPeticion.onDidDismiss(() => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();
      if (datos.success) {
        datos = datos.response[0];

        this._ap.setUsuario(datos);

        this._ap.cargarStorage().then(() => {
          this.navCtrl.setRoot("InicioAdministradorPage");
        });
      } else {
        // this.mostrarError(`Datos incorrectos`);
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

  public validarFormulario() {
    this.error_username = "";
    this.error_password = "";
    this.error_verificarPassword = "";
    this.intentoregistrarUsuario = false;

    let user = this.formuEditFam.value.username.trim();
    let pass = this.formuEditFam.value.password.trim();
    let verificarPass = this.formuEditFam.value.verificarPassword.trim();

    if (!this.formuEditFam.valid) {
      this.intentoregistrarUsuario = true;
    }

    if (!user) {
      this.formuEditFam.controls["username"].markAsDirty();
      this.error_username = 'El nombre de usuario no puede estar vacío.';

      this.intentoregistrarUsuario = true;
    }

    if (!pass) {
      this.formuEditFam.controls["password"].markAsDirty();
      this.error_password = 'La contraseña no puede estar vacía.';

      this.intentoregistrarUsuario = true;
    }

    if (!verificarPass && !user) {

      
      this.formuEditFam.controls["verificarPassword"].markAsDirty();
      this.error_password = 'La contraseña no puede estar vacía.';

      this.intentoregistrarUsuario = true;
    }

    if (this.intentoregistrarUsuario) {
      return;
    }

    this.registrarUsuario(user.toLowerCase(), pass.toLowerCase());
  }

  public mostrarRegistro() {
    this.alertaErrorInicioSesion.text = "Registro correcto";
    this.alertaErrorInicioSesion.title = "Registro";
    this.alertaErrorInicioSesion.type = "error";
    
    this.alertaErrorInicioSesion.show();
  }

}
