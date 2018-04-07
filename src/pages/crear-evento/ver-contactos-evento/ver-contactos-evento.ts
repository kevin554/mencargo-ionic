import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { InvitadoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-contactos-evento',
  templateUrl: 'ver-contactos-evento.html',
})
export class VerContactosEventoPage {

  private contactos:any[];
  private letraVisualizada:string;
  private objFamiliar:any;
  private objEvento:any;
  private noHayConexion:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _ip: InvitadoProvider, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("evento")) {
      this.objEvento = navParams.get("evento");
    }
  }

  ionViewDidLoad() {
    this.cargarContactos();
  }

  private cargarContactos() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'cargando lista de amigos',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ip.seleccionarAmigos(
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      if (!this.contactos) {
        this.noHayConexion = true;
      }

      peticionEnCurso.unsubscribe();
    })

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.contactos = [];

        for (let indice in datos) {
          let contacto = datos[indice];

          /* */
          let obj = {
            id: contacto.id,
            nombre: contacto.nombre,
            apellido: contacto.apellido,
            ci: contacto.ci,
            expedicion: contacto.expedicion,
            celular: contacto.celular,
            fkfamilia: contacto.fkfamilia,
            nombre_familia: contacto.nombre_familia,
            fkcondominio: contacto.fkcondominio,
            seleccionado: false
          }

          this.contactos.push(obj);
        }

        this.contactos = this.util.ordenar(this.contactos, "nombre");
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
        this.noHayConexion = false;
      },
      err => {
        cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    );
  }

  /**
  * marca como seleccionado un contacto de la lista de contactos
  */
  public seleccionarContacto(contacto) {
    contacto.seleccionado = !contacto.seleccionado;
  }

  revisarListaInvitados() {
    let parametros = {
      evento: this.objEvento,
      invitados: this.obtenerContactosSeleccionados()
    }

    this.navCtrl.push('RevisarListaInvitadosPage', parametros);
  }

  private obtenerContactosSeleccionados():any[] {
    let listaInvitados:any[] = [];

    for (let contacto of this.contactos) {
      if (contacto.seleccionado) {
        listaInvitados.push(contacto)
      }

    }

    return listaInvitados;
  }

}
