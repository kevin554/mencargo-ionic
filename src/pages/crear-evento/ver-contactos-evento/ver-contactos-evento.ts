import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams, Toast, ToastController, ToastOptions } from 'ionic-angular';
import { EventoProvider, GrupoProvider, InvitadoProvider, UsuarioProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-contactos-evento',
  templateUrl: 'ver-contactos-evento.html',
})
export class VerContactosEventoPage {

  private contactos:any[];
  invitados:any[];
  private objFamiliar:any;
  private objEvento:any;
  public noHayConexion:boolean;
  viendoListaInvitados:boolean;
  hayQueAgregarNuevosInvitados:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _ip: InvitadoProvider, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider, private _ep: EventoProvider,
      private _up: UsuarioProvider, public toastCtrl: ToastController,
      public alertCtrl: AlertController, private _gp: GrupoProvider) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    if (navParams.get("evento")) {
      this.objEvento = navParams.get("evento");
    }

    if (navParams.get("viendoListaInvitados")) {
      this.viendoListaInvitados = navParams.get("viendoListaInvitados");
      this.cargarDatosEvento();
    }

    if (navParams.get("invitados")) {
      this.invitados = navParams.get("invitados");
    }

    if (navParams.get("hayQueAgregarNuevosInvitados")) {
      this.hayQueAgregarNuevosInvitados = navParams.get("hayQueAgregarNuevosInvitados")
    }
  }

  ionViewDidLoad() {
    if (!this.viendoListaInvitados) {
      this.cargarContactos();
    }
  }

  cargarDatosEvento() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando lista de invitados.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ep.obtenerEvento(
      this._up.idEvento,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.objEvento = datos.response;
        let listaInvitados = this.objEvento.invitados;

        this.invitados = [];

        for (let i in listaInvitados) {
          let invitado = listaInvitados[i];
          this.invitados.push(invitado);
        }
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

  configurarEvento() {
    if (!this.objEvento) {
      this.cargarDatosEvento();
      return;
    }

    let parametros = {
      familiar: this.objFamiliar,
      evento: this.objEvento
    }

    this.navCtrl.push("CrearEventoPage", parametros);
  }

  private cargarContactos() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando lista de amigos.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ip.seleccionarAmigos(
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

        this.contactos = [];

        for (let indice in datos) {
          let contacto = datos[indice];

          /* ver si tengo una lista de invitado y marcar como ya invitado si
          el contacto existe en la lista */
          let contactoYaInvitado:boolean;

          if (this.invitados) {
            for (let invitado of this.invitados) {
              if (invitado.id_invitado == contacto.id) {
                contactoYaInvitado = true;
                break;
              }

            }
          }

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
            seleccionado: contactoYaInvitado
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

  public agregarNuevoInvitado() {
    if (this.viendoListaInvitados) {
      let parametros = {
        familiar: this.objFamiliar,
        evento: this.objEvento,
        invitados: this.invitados,
        hayQueAgregarNuevosInvitados: true
      }

      this.navCtrl.push('VerContactosEventoPage', parametros);
    } else {
      let parametros = {
        familiar: this.objFamiliar,
        amigos: this.contactos,
        soloRegistrarAmigo: true
      }

      this.navCtrl.push('RegistrarInvitacionPage', parametros);
    }
  }

  agregarNuevosInvitados() {
    let contactos = this.obtenerContactosSeleccionados();

    let idsNuevosInvitadosParaAgregar:any[] = [];
    let nuevosInvitados:any[] = [];

    outerFor:
    for (let contacto of contactos) {

      // evito crear duplicados
      for (let invitado of this.invitados) {
        if (invitado.id_invitado == contacto.id) {
          continue outerFor;
        }
      }

      idsNuevosInvitadosParaAgregar.push(contacto.id);
      nuevosInvitados.push(contacto);
    }

    let cargarPeticion = this.loadingCtrl.create({
      content: 'Agregando más invitados a la lista.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ep.insertInvitadosEvento(
      this.objEvento.id,
      "", // observacion
      this.util.getFechaActual(),
      this.objFamiliar.id,
      this.objFamiliar.codigo,
      idsNuevosInvitadosParaAgregar
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        // no tengo como saber los ids generados, por eso debo redirigo al inicio
        this.navCtrl.pop();
        this.navCtrl.pop();

        this.toast("Tus invitados fueron añadidos", 2000);
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

  /**
  * marca como seleccionado un contacto de la lista de contactos
  */
  public seleccionarContacto(contacto) {
    contacto.seleccionado = !contacto.seleccionado;
  }

  public revisarListaInvitados() {
    let idsInvitados:any[] = [];
    for (let invitado of this.obtenerContactosSeleccionados()) {
      idsInvitados.push(invitado.id);
    }

    let parametros = {
      evento: this.objEvento,
      invitados: this.obtenerContactosSeleccionados(),
      familiar: this.objFamiliar,
      idsInvitados: idsInvitados
    }

    this.navCtrl.push('RevisarListaInvitadosPage', parametros);
  }

  private obtenerContactosSeleccionados():any[] {
    let listaInvitados:any[] = [];

    if (!this.contactos) {
      return listaInvitados;
    }

    for (let contacto of this.contactos) {
      if (contacto.seleccionado) {
        listaInvitados.push(contacto)
      }

    }

    return listaInvitados;
  }

  private grupos:any[];

  public verGrupos() {
    let peticion = this._gp.listarGrupoFamiliar(
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        this.grupos = [];

        for (let i in datos) {
          let grupo = datos[i];
          this.grupos.push(grupo);
        }

        let alert = this.alertCtrl.create();
        alert.setTitle('Grupos');

        for (let indice in this.grupos) {
          let grupo = this.grupos[indice];

          alert.addInput({
            type: 'radio',
            label: grupo.nombre,
            value: indice
          });
        }

        alert.addButton('Cancelar');
        alert.addButton({
          text: 'Ok',
          handler: data => {
            if (!data) {
              return;
            }

            this.confirmarAgregarGrupo(data);
          }
        });

        alert.present();
      } else {

      }

    }).subscribe( success => {

    }, err => {

    });
  }

  private confirmarAgregarGrupo(indice) {
    let grupo = this.grupos[indice];

    let alert = this.alertCtrl.create({
      // title: '¿Agregar a los integrantes de ' + grupo.nombre + '?',
      message: '¿Agregar a los integrantes de ' + grupo.nombre + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Si',
          handler: () => {
            this.agregarIntegrantesDeGrupo(grupo);
          }
        }
      ]
    });

    alert.present();
  }

  private agregarIntegrantesDeGrupo(grupo) {
    let integrantes = [];
    let idsIntegrantes = [];

    for (let indice in grupo.detallegrupo) {
      let integrante = grupo.detallegrupo[indice];

      integrantes.push(integrante);
      idsIntegrantes.push(integrante.fkinvitado);
    }

    console.log(JSON.stringify(integrantes));

    for (let contacto of this.contactos) {
      for (let idIntegrante of idsIntegrantes) {
        if (contacto.id == idIntegrante) {
          contacto.seleccionado = true;
          continue;
        }

      }
    }

  }

}
