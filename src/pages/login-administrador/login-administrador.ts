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
  private formLoginAdmin:FormGroup;
  private intentoIngresar:boolean;
  private error_username:string;
  private error_password:string;

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

    if (!this.formLoginAdmin.valid) {
      this.intentoIngresar = true;
    } else {
      let user = this.formLoginAdmin.value.username.trim();
      let pass = this.formLoginAdmin.value.password.trim();

      if (!user) {
        this.formLoginAdmin.controls['username'].markAsDirty();
        this.error_username = 'el nombre de usuario no puede estar vacio';

        this.intentoIngresar = true;
      }

      if (!pass) {
        this.formLoginAdmin.controls['password'].markAsDirty();
        this.error_password = 'la constraseña no puede estar vacia';

        this.intentoIngresar = true;
      }

      // let expUserName = new RegExp("^[a-zA-Z0-9_]{1,50}$");
      // if (!expUserName.test(user)) {
      //   this.formLoginAdmin.controls['username'].markAsDirty();
      //   this.error_username = `el nombre de usuario no puede tener espacios ni
      //       más de 50 letras`;
      //
      //   this.intentoIngresar = true;
      // }

      // let expPass = new RegExp("^.{8,25}$");
      // if (!expPass.test(pass)) {
      //   this.formLoginAdmin.controls['password'].markAsDirty();
      //   this.error_password = 'la contraseña debe tener entre 1 a 8 letras';
      //
      //   this.intentoIngresar = true;
      // }

      if (this.intentoIngresar) {
        return;
      }

      this.ingresar(user.toLowerCase(), pass.toLowerCase());
    } // formulario validado
  }

  private ingresar(user, password) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'ingresando',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ap.login(user, password);

    /* si se cancela la espera antes de que finalice la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response[0];

        this._ap.iniciarSesion(datos);
        this.navCtrl.setRoot('InicioAdministradorPage');
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
