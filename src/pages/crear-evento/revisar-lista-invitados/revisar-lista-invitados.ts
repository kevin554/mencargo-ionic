import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { UsuarioProvider } from '../../../providers/index.services';
import { EventoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-revisar-lista-invitados',
  templateUrl: 'revisar-lista-invitados.html',
})
export class RevisarListaInvitadosPage {

  private objEvento:any;
  public invitados:any[];
  private objFamiliar:any;
  private idsInvitados:any[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private alertCtrl: AlertController, private _up: UsuarioProvider,
      public loadingCtrl: LoadingController, private _ep: EventoProvider,
      private util: UtilServiceProvider) {
    if (navParams.get("invitados")) {
      this.invitados = navParams.get("invitados");
    }

    if (navParams.get("idsInvitados")) {
      this.idsInvitados = navParams.get("idsInvitados");
    }

    if (navParams.get("evento")) {
      this.objEvento = navParams.get("evento");
    }

    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }
  }

  public confirmarEvento() {
    let advertencia:string = "Los contactos seleccionados recibirán el mismo " +
        "código QR. Su ingreso será controlado en portería mediante una copia " +
        "de esta lista de invitados, enviada directamente al guardia";

    let alert = this.alertCtrl.create({
      message: advertencia,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.crearEvento();
          }
        }
      ]
    });

    alert.present();
  }

  private crearEvento() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Creando evento.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let fechaEvento = this.util.getFechaFormateada(this.objEvento.fecha);

    let peticion = this._ep.insertar(
      this.objEvento.nombre,
      this.objEvento.descripcion,
      fechaEvento,
      this.objFamiliar.condominio,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    })

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let idEvento = datos.idevento;

        this.registrarInvitados(idEvento);

        // la fecha está en yyyy-MM-dd
        let day = this.objEvento.fecha.substr(8, 2);
        let month = this.objEvento.fecha.substr(5, 2);;
        let year = this.objEvento.fecha.substr(0, 4);;

          // guardar la fecha y hora del evento SUMADAS LAS 48 HORAS
          // let hoy = new Date(fechaEvento);
          // cuando se crea una fecha, se debe restar 1 al mes
          let hoy = new Date(year, month - 1, day);

          let pasadoManiana = new Date();
          pasadoManiana.setDate(hoy.getDate() + 2);

          // console.log(`la fecha de hoy (${hoy}) y la de pasado mañana es (${pasadoManiana})`);

          this._up.establecerFechaEvento(pasadoManiana);
          this._up.setIdEvento(idEvento);

          let parametros = {
            idEvento: idEvento + "e",
            nombreEvento: this.objEvento.nombre
          }

          this.navCtrl.setRoot("InicioPropietarioPage");
          this.navCtrl.push("CodigoInvitacionPage", parametros);

      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      err => {
        cargarPeticion.dismiss();
      }
    );
  }

  seMostroElQr:boolean;

  registrarInvitados(idEvento) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Agregando a tus invitados.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ep.insertInvitadosEvento(
      idEvento,
      "", // observacion
      this.util.getFechaActual(),
      this.objFamiliar.id,
      this.objFamiliar.codigo,
      this.idsInvitados
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;
      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        cargarPeticion.dismiss();
      },
      err => {
        cargarPeticion.dismiss();
      }
    );
  }

  irAlInicio() {
    this.navCtrl.setRoot("InicioPropietarioPage");
  }

}
