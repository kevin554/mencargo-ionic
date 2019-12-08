import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { IonicPage, LoadingController, NavController, NavParams, Toast, ToastController, ToastOptions } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AdministradorProvider, InvitadoProvider, MovimientoProvider, UtilServiceProvider } from '../../../providers/index.services';
import { StatusBar } from '@ionic-native/status-bar';

@IonicPage()
@Component({
  selector: 'page-estado-ingreso',
  templateUrl: 'estado-ingreso.html',
})
export class EstadoIngresoPage {

  public ingresoExitoso:boolean;
  /* {id, fkinvitado, invitado_nombre, invitado_ci, expedicion, placa}*/
  private objInvitado:any;
  private mensaje:any;
  private objUsuario:any;
  private objConfiguracionCondominio:any;
  private formuRegIng:FormGroup;
  private sePuedeOmitir:boolean;
  /* cuando se introduce la placa, ngModelChange se ejecuta demasiadas veces
  provocando stackoverflow, la idea con la sgte variable es hacer que
  ngModelChange se ejecute una sóla vez cada vez que cambie la placa */
  private placaModificada:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public events: Events, public formBuilder: FormBuilder,
      private _ap: AdministradorProvider, private _mp: MovimientoProvider,
      private util: UtilServiceProvider, private _ip: InvitadoProvider,
      public loadingCtrl: LoadingController, public toastCtrl: ToastController,
      private statusBar: StatusBar) {
    this.formuRegIng = this.formBuilder.group({
      ci: [''],
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

      this.formatearMensaje(this.mensaje);
    }

    this.statusBar.backgroundColorByHexString("#DC3636");
  }

  ionViewWillLeave() {
    this.statusBar.backgroundColorByHexString("#002e77");
  }

  /* la idea es cambiar la respuesta del servidor a algo más presentable */
  private formatearMensaje(mensaje:string) {
    if (mensaje.startsWith("La invitación es para otra fecha")) {
      let posFecha = 52;
      let fecha = mensaje.substr(posFecha, mensaje.length);
      let dia = parseInt(fecha.substr(0, 2));

      this.mensaje = `La invitación es para el ${this.obtenerDia(fecha)}
          ${dia} de ${this.obtenerMes(fecha)}`;
    }
  }

  obtenerDia(fecha:string) {
    /* la fecha está en formato DD/MM/YYYY */
    let dia = parseInt(fecha.substr(0, 2));
    let mes = parseInt(fecha.substr(3, 2));
    let anio = parseInt(fecha.substr(6, 4));

    let fechaFormateada = new Date(anio, mes - 1, dia)

    switch (fechaFormateada.getDay()) {
      case 0:
        return "domingo";

      case 1:
        return "lunes";

      case 2:
        return "martes";

      case 3:
        return "miercoles";

      case 4:
        return "jueves";

      case 5:
        return "viernes";

      case 6:
        return "sábado";
    }
  }

  obtenerMes(fecha:string) {
    /* la fecha está en formato DD/MM/YYYY */
    let dia = parseInt(fecha.substr(0, 2));
    let mes = parseInt(fecha.substr(3, 2));
    let anio = parseInt(fecha.substr(6, 4));

    let fechaFormateada = new Date(anio, mes, dia)

    switch (fechaFormateada.getMonth()) {
      case 1:
        return "enero";

      case 2:
        return "febrero";

      case 3:
        return "marzo";

      case 4:
        return "abril";

      case 5:
        return "mayo";

      case 6:
        return "junio";

      case 7:
        return "julio";

      case 8:
        return "agosto";

      case 9:
        return "septiembre";

      case 10:
        return "octubre";

      case 11:
        return "noviembre";

      case 12:
        return "diciembre";
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
        content: 'Actualizando los datos de la placa',
        enableBackdropDismiss: true
      });

      /* lo que necesito para actualizar la placa */
      /* id, fkfamilia, fkinvitado, marca, color, fecha, cantidad, tiempo, placa,
        observacion, adicionadopor, fechamodificacion */
      let peticion =  this._mp.actualizar(
          this.objInvitado.id,
          this.objInvitado.fkfamilia, this.objInvitado.fkinvitado, marca, color,
          placa, this.objInvitado.cantidad,
          this.objInvitado.tiempo, this.util.getFechaActual(),
          this.objInvitado.observacion, this._ap.getNombre(),
          this.util.getFechaActual(),
          this.objUsuario.id,
          this.objUsuario.codigo
        );

      cargarPeticion.onDidDismiss( () => {
        peticionEnCurso.unsubscribe();
      });

      let peticionEnCurso = peticion.map(resp => {
        let datos = resp.json();

        if (datos.success) {
          this.toast('Placa actualizada', 1500);
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
        content: 'Actualizando los datos de la placa',
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
          this.toast('Se actualizó el ci correctamente', 1500)
        }

      }).subscribe(
        success => {
          cargarPeticionCi.dismiss();
        }, err => {
          cargarPeticionCi.dismiss();
        }
      )
    } else {
      if (this.objConfiguracionCondominio &&
          this.objConfiguracionCondominio.ci == "SI") {
        this.toast("Debe ingresar el ci");
      }

    }

    if (!this.objConfiguracionCondominio) {
      this.navCtrl.pop();
      return;
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
    let ci = this.formuRegIng.value.ci;
    let placa = this.formuRegIng.value.placa.trim();

    if (this.sePuedeOmitirRegistro()) {
      this.navCtrl.pop();
    } else {
      if (this.objConfiguracionCondominio.ci == "SI" && !ci) {
        this.toast("Debe ingresar el ci");
      } else if (this.objConfiguracionCondominio.placa == "SI" && !placa) {
        this.toast("Debe ingresar la placa")
      }
    }
  }

  private sePuedeOmitirRegistro():boolean {
    if (!this.objConfiguracionCondominio) {
      return true;
    }

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

  mToast:Toast;

  toast(mensaje, duracion?) {
    if (this.mToast) {
      this.mToast.dismiss();
    }

    let parametros:ToastOptions = { };

    parametros.message = mensaje;
    parametros.showCloseButton = true;
    parametros.closeButtonText = "Cerrar";
    parametros.position = "bottom";
    if (duracion) parametros.duration = duracion;

    this.mToast = this.toastCtrl.create(parametros);

    this.mToast.present();
  }

  public aMayusculas(evento) {
    if (evento.toUpperCase() == this.placaModificada) {
      return;
    }

    this.placaModificada = evento.toUpperCase();

    this.formuRegIng.get('placa').setValue(evento.toUpperCase());
  }

}
