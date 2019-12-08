import { Component, ViewChild } from '@angular/core';
import { IonicPage, LoadingController, NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdministradorProvider, UtilServiceProvider } from '../../providers/index.services';
import { SwalComponent } from '@toverux/ngx-sweetalert2';

@IonicPage()
@Component({
  selector: 'page-login-administrador',
  templateUrl: 'login-administrador.html',
})
export class LoginAdministradorPage {

  @ViewChild('alertaErrorInicioSesion') private alertaErrorInicioSesion: SwalComponent;

  /* objetos necesarios para el formulario */
  private formLoginAdmin:FormGroup;
  private intentoIngresar:boolean;
  public error_username:string;
  public error_password:string;

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder,
      public loadingCtrl: LoadingController, private _ap: AdministradorProvider,
      private util: UtilServiceProvider) {
    this.formLoginAdmin = formBuilder.group({
       username: ['', Validators.compose([Validators.required]) ],
       password: ['', Validators.compose([Validators.required]) ]
    });
  }

  private mostrarError(mensaje) {
    this.alertaErrorInicioSesion.text = mensaje;
    this.alertaErrorInicioSesion.title="Error al iniciar";
    this.alertaErrorInicioSesion.type = "error";

    this.alertaErrorInicioSesion.show();
  }

  public validarFormulario() {
    this.error_username = "";
    this.error_password = "";
    this.intentoIngresar = false;

    let user = this.formLoginAdmin.value.username.trim();
    let pass = this.formLoginAdmin.value.password.trim();

    if (!this.formLoginAdmin.valid) {
      this.intentoIngresar = true;
    }

    if (!user) {
      this.formLoginAdmin.controls["username"].markAsDirty();
      this.error_username = 'El nombre de usuario no puede estar vacío.';

      this.intentoIngresar = true;
    }

    if (!pass) {
      this.formLoginAdmin.controls["password"].markAsDirty();
      this.error_password = 'La contraseña no puede estar vacía.';

      this.intentoIngresar = true;
    }

    if (this.intentoIngresar) {
      return;
    }

    this.ingresar(user.toLowerCase(), pass.toLowerCase());
  }

  private ingresar(user, password) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Ingresando',
      dismissOnPageChange: true
    });

    cargarPeticion.present();

    let peticion = this._ap.login(user, password);

    /* si se cancela la espera antes de que finalice la petición */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();
      if (datos.success) {
        datos = datos.response[0];

        this._ap.setUsuario(datos);

        this._ap.cargarStorage().then( () => {
          this.navCtrl.setRoot("InicioAdministradorPage");
        });
      } else {
        this.mostrarError(`Datos incorrectos`);
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

}
