import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-crear-evento',
  templateUrl: 'crear-evento.html',
})
export class CrearEventoPage {

  private objFamiliar:any;

  private formuRegEv:FormGroup;
  private error_nombre:string;;
  private error_inicio:any;
  private intentoIngresar:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider) {
    this.formuRegEv = this.formBuilder.group({
      nombre: ['', Validators.required],
      inicio: ['', Validators.required]
    });

    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    this.formuRegEv.get("inicio").setValue(this.util.getFechaNormal());
  }

  public validarFormulario() {
    this.error_nombre = "";
    this.error_inicio = "";

    if (!this.formuRegEv.valid) {
      this.intentoIngresar = true;
    } else {
      let nombre = this.formuRegEv.value.nombre.trim();
      let inicio = this.formuRegEv.value.inicio;

      this.intentoIngresar = false;

      if (!nombre) {
        this.formuRegEv.controls['nombre'].markAsDirty();
        this.error_nombre = 'el nombre no puede estar vacio';

        this.intentoIngresar = true;
      }

      let expNombre = new RegExp("^[a-zA-Z ñÑáéíóúÁÉÍÓÚ]{1,50}$");
      if (!expNombre.test(nombre)) {
        this.formuRegEv.controls['nombre'].markAsDirty();
        this.error_nombre = `el nombre solo puede tener entre 1 a 50 letras`;

        this.intentoIngresar = true;
      }

      if (this.intentoIngresar) {
        return;
      }

      // fecha = this.util.getFechaFormateada(fecha);

      let evento = {
        nombre: nombre,
        inicio: inicio
      }

      this.siguiente(evento);
    } /* formulario validado */
  }

  private siguiente(evento) {
    let parametros = {
      familiar: this.objFamiliar,
      evento: evento
    }

    this.navCtrl.push('VerContactosEventoPage', parametros);
  }

}
