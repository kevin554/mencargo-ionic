import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { AdministradorProvider, InvitadoProvider, MovimientoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-estado-ingreso',
  templateUrl: 'estado-ingreso.html',
})
export class EstadoIngresoPage {

  private ingresoExitoso:boolean;
  /* {id, fkinvitado, invitado_nombre, invitado_ci, expedicion, placa}*/
  private objInvitado:any;
  private mensaje:any;
  objUsuario:any;
  objConfiguracionCondominio:any;
  private formuRegIng:FormGroup;
  sePuedeOmitir:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public events: Events, public formBuilder: FormBuilder,
      private _ap: AdministradorProvider, private _mp: MovimientoProvider,
      private util: UtilServiceProvider, private _ip: InvitadoProvider,
      public loadingCtrl: LoadingController,) {
    this.formuRegIng = this.formBuilder.group({
      ci: [''],
      expedicion: ['SC'],
      placa: ['']
    });

    if (navParams.get("ingresoExitoso")) {
      this.ingresoExitoso = navParams.get("ingresoExitoso")
    }

    if (navParams.get("invitado")) {
      this.objInvitado = navParams.get("invitado");
      this.cargarDatosAlFormulario(this.objInvitado);
    }

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

    if (navParams.get("configuracionCondominio")) {
      this.objConfiguracionCondominio = navParams.get("configuracionCondominio")

      if (this.objConfiguracionCondominio.ci == "NO" &&
          this.objConfiguracionCondominio.placa == "NO") {
        this.sePuedeOmitir = true;
      }
    }

    if (navParams.get("mensaje")) {
      this.mensaje = navParams.get("mensaje");
      this.mensaje = this.util.soloPrimeraMayuscula(this.mensaje);
    }


  }

  private cargarDatosAlFormulario(obj) {
    if (obj.invitado_ci) {
      this.formuRegIng.get('ci').setValue(obj.invitado_ci);
    }

    this.formuRegIng.get('placa').setValue(obj.placa);
  }

  public completarCampos() {
    let ci = this.formuRegIng.value.ci;
    let expedicion = this.formuRegIng.value.expedicion;
    let placa = this.formuRegIng.value.placa.trim();

    if (!ci) ci = 0;

    let marca = "";
    let color = "";

    /* */
    if (placa) {
      /* se va a mostrar una espera mientras se realiza la peticion */
      let cargarPeticion = this.loadingCtrl.create({
        content: 'actualizando los datos de la placa',
        enableBackdropDismiss: true
      });

      /* lo que necesito para actualizar la placa */
      /* id, fkfamilia, fkinvitado, marca, color, fecha, cantidad, tiempo, placa,
        observacion, adicionadopor, fechamodificacion */
      let peticion =  this._mp.actualizar(this.objInvitado.id,
          this.objInvitado.fkfamilia, this.objInvitado.fkinvitado, marca, color,
          placa, this.objInvitado.cantidad,
          this.objInvitado.tiempo, this.util.getFechaActual(),
          this.objInvitado.observacion, this._ap.getNombre(),
          this.util.getFechaActual());

      cargarPeticion.onDidDismiss( () => {
        peticionEnCurso.unsubscribe();
      });

      let peticionEnCurso = peticion.map(resp => {
        let datos = resp.json();

        if (datos.success) {
          this.util.toast('placa actualizada', 1500);
        }

      }).subscribe(
        success => {
          cargarPeticion.dismiss();
        }, err => {
          cargarPeticion.dismiss();
        }
      );
    }

    /* */
    if (ci) {
      /* se va a mostrar una espera mientras se realiza la peticion */
      let cargarPeticionCi = this.loadingCtrl.create({
        content: 'actualizando los datos de la placa',
        enableBackdropDismiss: true
      });

      /* lo que necesito para actualizar el ci */
      /* id, nombre, ci, expedicion, celular, fkfamilia, modificadopor,
        fechamodificacion*/
      let peticionActualizarCi = this._ip.actualizarDesdeAdministracion(
          this.objInvitado.fkinvitado,
          this.objInvitado.invitado_nombre,
          this.objInvitado.invitado_apellido, ci,
          expedicion,
          this.objInvitado.invitado_celular, this.objInvitado.fkfamilia,
          this._ap.getNombre(), this.util.getFechaActual(),
          this.objUsuario.id, this.objUsuario.codigo);

      cargarPeticionCi.onDidDismiss( () => {
        peticionActualizarCiEnCurso.unsubscribe();
      });

      let peticionActualizarCiEnCurso = peticionActualizarCi.map(resp => {
        let datos = resp.json();

        if (datos.success) {
          this.util.toast('se actualizó el ci correctamente', 1500)
        }

      }).subscribe(
        success => {
          cargarPeticionCi.dismiss();
        }, err => {
          cargarPeticionCi.dismiss();
        }
      )
    } else {
      if (this.objConfiguracionCondominio.ci == "SI") {
        this.util.toast("debe ingresar el ci");
      }

    }

    /* si ambos campos son obligatorios y están rellenados */
    if (  (this.objConfiguracionCondominio.ci == "SI" &&
            (ci || this.objInvitado.invitado_ci) ) &&
        (this.objConfiguracionCondominio.placa == "SI" &&
            (placa || this.objInvitado.placa)) ) {
      this.sePuedeOmitir = true;
    }

    /* si sólo el ci es obligatorio */
    if ( (this.objConfiguracionCondominio.ci == "SI" &&
            (ci || this.objInvitado.invitado_ci)) &&
        (this.objConfiguracionCondominio.placa == "NO") ) {
      this.sePuedeOmitir = true;
    }

    /* si sólo la placa es obligatoria */
    if ( (this.objConfiguracionCondominio.ci == "NO") &&
        (this.objConfiguracionCondominio.placa == "SI"
            && (placa || this.objInvitado.placa)) ) {
      this.sePuedeOmitir = true;
    }

    /* si ni la placa ni el ci son obligatorios */
    if (this.objConfiguracionCondominio.ci == "NO" &&
        this.objConfiguracionCondominio.placa == "NO") {
      this.sePuedeOmitir = true;
    }

    if (this.sePuedeOmitir) {
      this.navCtrl.pop();
    }
  }

  public omitir() {
    if (this.sePuedeOmitirRegistro()) {
      this.navCtrl.pop();
    } else {
      if (this.objConfiguracionCondominio.ci == "SI") {
        this.util.toast("debe ingresar el ci");
      }
    }
  }

  private sePuedeOmitirRegistro():boolean {
    let ci = this.formuRegIng.value.ci;
    let placa = this.formuRegIng.value.placa.trim();

    /* si ambos campos son obligatorios y están rellenados */
    if (  (this.objConfiguracionCondominio.ci == "SI" &&
            (ci || this.objInvitado.invitado_ci) ) &&
        (this.objConfiguracionCondominio.placa == "SI" &&
            (placa || this.objInvitado.placa)) ) {
      return true;
    }

    /* si sólo el ci es obligatorio */
    if ( (this.objConfiguracionCondominio.ci == "SI" &&
            (ci || this.objInvitado.invitado_ci)) &&
        (this.objConfiguracionCondominio.placa == "NO") ) {
      return true;
    }

    /* si sólo la placa es obligatoria */
    if ( (this.objConfiguracionCondominio.ci == "NO") &&
        (this.objConfiguracionCondominio.placa == "SI"
            && (placa || this.objInvitado.placa)) ) {
      return true;
    }

    /* si ni la placa ni el ci son obligatorios */
    if (this.objConfiguracionCondominio.ci == "NO" &&
        this.objConfiguracionCondominio.placa == "NO") {
      return true;
    }

    return false;
  }

  public reintentar() {
    this.navCtrl.pop();
    this.events.publish('reintentar');
  }

  public registroManual() {
    this.navCtrl.pop();
    this.events.publish('registroManual');
  }

}
