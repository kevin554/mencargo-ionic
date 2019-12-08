import { Component, ViewChild } from '@angular/core';
import { IonicPage, LoadingController, NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdministradorProvider, UtilServiceProvider, FamiliaProvider, UsuarioProvider } from '../../providers/index.services';
import { SwalComponent } from '@toverux/ngx-sweetalert2';


@IonicPage()
@Component({
  selector: 'page-login-propietario',
  templateUrl: 'login-propietario.html',
})
export class LoginPropietarioPage {

  @ViewChild('alertaErrorInicioSesion') private alertaEstadoIngreso: SwalComponent;

  //Objetos necesesarios para el formulario
  private formLoginAdmin: FormGroup;
  private intentoIngresar: boolean;
  public error_username: string;
  public error_password: string;

  constructor(public navCtrl: NavController, public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController, private _ap: AdministradorProvider,
    private util: UtilServiceProvider, private _fp: FamiliaProvider,
    private _up:UsuarioProvider) {
    this.formLoginAdmin = formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPropietarioPage');
  }

  private mostrarEstadoIngreso(mensaje, estado: boolean) {
    this.alertaEstadoIngreso.title = mensaje;
    this.alertaEstadoIngreso.type = estado ? "success" : "error";

    this.alertaEstadoIngreso.show();
  }

  public validarFormulario() {
    this.error_username = "";
    this.error_password = "";
    this.intentoIngresar = false;

    let user = this.formLoginAdmin.value.username;
    let pass = this.formLoginAdmin.value.password;

    if (!this.formLoginAdmin.valid) {
      this.intentoIngresar = true;
    }

    if (!user) {
      this.formLoginAdmin.controls["username"].markAsDirty();
      this.error_password = 'El nombre de usuario no puede estar vacio';

      this.intentoIngresar = true;
    }

    if (!pass) {
      this.formLoginAdmin.controls["password"].markAsDirty();
      this.error_password = 'La contraseña no puede estar vacia';

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

    let peticion = this._fp.loginPropietario(user, password);

    /* si se cancela la espera antes de que finalice la petición */
    cargarPeticion.onDidDismiss(() => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response[0];
        this._up.ingresar(datos);

        // this._ap.cargarStorage().then(() => {
        //   this.navCtrl.setRoot("EditarFamiliarPage");
        // });

        this.navCtrl.setRoot("EditarFamiliarPage");
      } else {
        if(datos.message.trim() == 'Código ya utilizado el familiar ya inicio sesión.'){
          this.mostrarEstadoIngreso('Ya iniciaste sesión en otro dispositivo',
            false);
        } else {
          this.mostrarEstadoIngreso('Credencial incorrecto', false)
        }
        // this.mostrarError(`Datos incorrectos`);
        //this.navCtrl.setRoot("EditarFamiliarPage");
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
