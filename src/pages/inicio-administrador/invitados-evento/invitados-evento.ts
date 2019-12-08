import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams, Toast, ToastController } from 'ionic-angular';
import { AdministradorProvider, EventoProvider, InvitadoProvider, UtilServiceProvider } from '../../../providers/index.services';
import { SwalComponent } from '@toverux/ngx-sweetalert2';

@IonicPage()
@Component({
  selector: 'page-invitados-evento',
  templateUrl: 'invitados-evento.html',
})
export class InvitadosEventoPage {

  invitados:any[];
  objUsuario:any;
  objCondominio:any;
  objEvento:any;
  objConfiguracionCondominio:any;

  @ViewChild('alerta') public alerta: SwalComponent;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public loadingCtrl: LoadingController, private alertCtrl: AlertController,
      private _ep: EventoProvider, public detectorRef: ChangeDetectorRef,
      private _ap: AdministradorProvider, private util: UtilServiceProvider,
      private _ip: InvitadoProvider, public toastCtrl: ToastController) {
    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }

    if (navParams.get("evento")) {
      this.objEvento = navParams.get("evento");
    }

    if (navParams.get("invitados")) {
      this.invitados = navParams.get("invitados");
    }

    if (navParams.get("configuracionCondominio")) {
      this.objConfiguracionCondominio = navParams.get("configuracionCondominio");
    }
  }

  ionViewDidLoad() {
    this.verificarSiFaltanInvitados(this.invitados);
  }

  public gestoActualizar(refresher) {
    this.cargarInvitados();
    refresher.complete();
  }

  cargarInvitados() {
    /* se mostrará un carga */
    let cargando = this.loadingCtrl.create({
      content: `Cargando lista de invitados`,
      enableBackdropDismiss: true
    });

    cargando.present();

    cargando.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticion = this._ep.obtenerEventoUsuario(
      this.objEvento.id,
      this._ap.getId(),
      this._ap.getCodigo()
    );

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let invitados = datos.invitados;
        this.invitados = [];

        for (let i in invitados) {
          let invitado = invitados[i];

          this.invitados.push(invitado);
        }

        this.verificarSiFaltanInvitados(this.invitados);
      }

    }).subscribe(
      success => {
        cargando.dismiss();
      }, err => {
        cargando.dismiss();
      }
    );
  }

  confirmarRegistrarIngreso(invitado, checkboxIngresoInvitado) {
    if (this.mToast) {
      this.mToast.dismiss();
    }

    if (invitado.estado === 2) {
      checkboxIngresoInvitado.checked = true;
      return;
    }

    // revierto el cambio, se debe hacer a posteriori
    checkboxIngresoInvitado.checked = false;

    let alert = this.alertCtrl.create({
      title: `¿Registrar ingreso de ${invitado.nombre_invitado}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Si',
          handler: () => {
            this.solicitarCiYPlaca(invitado, checkboxIngresoInvitado);
          }
        }
      ]
    });

    alert.present();
  }

  solicitarCiYPlaca(invitado, checkboxIngresoInvitado) {
      let alert = this.alertCtrl.create({
        title: 'Debe llenar los campos obligatorios',
        inputs: [
          {
            name: 'ci',
            placeholder: `CI ${ (this.objConfiguracionCondominio.ci == "SI")
                ? "(obligatorio)" : "(opcional)" }`,
            value: invitado.ci_invitado ? invitado.ci_invitado : '',
            disabled: true
          },
          {
            name: 'placa',
            placeholder: `Placa ${ (this.objConfiguracionCondominio.placa == "SI")
                ? "(obligatorio)" : "(opcional) "}`,
            value: invitado.placa ? invitado.placa : ''
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => { }
          },
          {
            text: 'Ok',
            handler: data => {
              invitado.ci_invitado = data.ci;
              invitado.placa = data.placa;

              /* para que el ci no sea undefined */
              if (!data.ci) {
                data.ci = 0;
              }

              if (this.objConfiguracionCondominio) {
                let datosNecesarios:string = "";

                /* voy a ver si faltan tanto el ci y la placa, o sólo el ci,
                  o sólo la placa */
                if (this.objConfiguracionCondominio.ci == "SI" &&
                    this.objConfiguracionCondominio.placa == "SI") {

                  if (!data.ci && !data.placa) {
                    datosNecesarios = "Debe colocar el ci y la placa";
                  } else if (!data.ci) {
                    datosNecesarios = "Falta colocar el ci";
                  } else if (!data.placa) {
                    datosNecesarios = "Falta colocar la placa";
                  }

                } else if (this.objConfiguracionCondominio.ci == "SI") {

                  if (!data.ci) {
                    datosNecesarios = "Debe colocar el ci";
                  }

                } else if (this.objConfiguracionCondominio.placa == "SI") {

                  if (!data.placa) {
                    datosNecesarios = "Debe colocar la placa";
                  }

                }

                if (datosNecesarios) {
                  this.toast(datosNecesarios);
                  return;
                }
              }

              this.actualizarCi(invitado, data.ci);
              this.actualizarPlaca(invitado, data.placa);
              this.registrarIngreso(invitado, checkboxIngresoInvitado);
            }
          }
        ]
      });

      alert.present();
  }

  mToast:Toast;

  toast(mensaje, duracion?) {
    if (this.mToast) {
      this.mToast.dismiss();
    }

    this.mToast = this.toastCtrl.create({
      message: mensaje,
      dismissOnPageChange: true,
      showCloseButton: true,
      closeButtonText: "Cerrar",
      position: "bottom"
    });

    this.mToast.present();
  }

  actualizarCi(invitado, nuevoCi) {
    /* se mostrará un carga */
    let cargando = this.loadingCtrl.create({
      content: `Actualizando el ci`,
      enableBackdropDismiss: true
    });

    cargando.present();

    cargando.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticion = this._ip.actualizarDesdeAdministracion(
      invitado.id_invitado,
      invitado.nombre_invitado,
      invitado.apellido_invitado,
      nuevoCi,
      "SC", // expedicion
      invitado.celular_invitado,
      this.objEvento.fkfamilia,
      this._ap.getNombre(),
      this.util.getFechaActual(),
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {

      }

    }).subscribe(
      success => {
        cargando.dismiss();
      }, err => {
        cargando.dismiss();
      }
    );
  }

  actualizarPlaca(invitado, placa) {
    /* se mostrará un carga */
    let cargando = this.loadingCtrl.create({
      content: `Actualizando la placa`,
      enableBackdropDismiss: true
    });

    cargando.present();

    cargando.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticion = this._ep.actualizarPlacaMovimientoEvento(
      invitado.id_detalle,
      placa,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {

      }

    }).subscribe(
      success => {
        cargando.dismiss();
      }, err => {
        cargando.dismiss();
      }
    );
  }

  public registrarIngreso(invitado, checkboxIngresoInvitado) {
    /* se mostrará un carga */
    let cargando = this.loadingCtrl.create({
      content: `Registrando la hora de ingreso`,
      enableBackdropDismiss: true
    });

    cargando.present();

    cargando.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticion = this._ep.registrarIngresoInvitadoEvento(
      invitado.id_detalle,
      this.objUsuario.id,
      this.objUsuario.codigo
    );

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        invitado.estado = 2;
        checkboxIngresoInvitado.checked = true;
      }

    }).subscribe(
      success => {
        cargando.dismiss();
      }, err => {
        cargando.dismiss();
      }
    );
  }

  private verificarSiFaltanInvitados(invitados) {
    if (!invitados) return;

    let quedanInvitadosPorLlegar:boolean;

    for (let i in invitados) {
      let invitado = invitados[i];

      if (invitado.estado == 1) {
        quedanInvitadosPorLlegar = true;
      }
    }

    if (!quedanInvitadosPorLlegar) {
      this.mostrarMensaje("Todos los invitados a este evento ya llegaron");
    }
  }

  private mostrarMensaje(mensaje) {
    this.alerta.title = mensaje;
    this.alerta.show();
  }

}
