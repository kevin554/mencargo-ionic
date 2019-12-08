import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { GrupoProvider, InvitadoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-registrar-invitado-grupo',
  templateUrl: 'registrar-invitado-grupo.html',
})
export class RegistrarInvitadoGrupoPage {

  private contactos:any[];
  private objFamiliar:any;
  private nombreGrupo:string;
  private objGrupo:any;
  private integrantes:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private _ip: InvitadoProvider, private util: UtilServiceProvider,
      public loadingCtrl: LoadingController, private _gp: GrupoProvider) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    // if (navParams.get("grupo")) {
    //   this.objGrupo = navParams.get("grupo");
    // }
    //
    // if (navParams.get("integrantes")) {
    //   this.integrantes = navParams.get("integrantes");
    // }
  }

  ionViewDidLoad() {
    this.cargarContactos();
  }

  cargarContactos() {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando lista de amigos',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ip.seleccionarAmigos(
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

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
      },
      err => {
        cargarPeticion.dismiss();
      }
    );
  }

  /**
  * marca como seleccionado un contacto de la lista de contactos
  */
  public seleccionarContacto(contacto) {
    contacto.seleccionado = !contacto.seleccionado;
  }

  public crearGrupo() {
    if (!this.nombreGrupo) {
      this.util.toastSuperior("Debe colocar un nombre al grupo", 2000 );
      return;
    }

    this.insertarGrupo(this.nombreGrupo);
  }

  public agregarContacto() {
    let parametros = {
      amigos: this.contactos,
      soloRegistrarAmigo: true,
      familiar: this.objFamiliar
    }

    this.navCtrl.push("RegistrarInvitacionPage", parametros);
  }

  private insertarGrupo(nombreGrupo:string) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Creando grupo',
      // enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._gp.insertar(
      nombreGrupo,
      "",
      this.util.getFechaActual(),
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

        let idGrupo = datos.idgrupo;

        let objGrupo = {
          id: idGrupo,
          nombre: nombreGrupo
        }

        this.insertarIntegrantes(objGrupo);
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

  private insertarIntegrantes(grupo) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Creando grupo',
      // enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let idsIntegrantes = [];
    let integrantes = this.obtenerContactosSeleccionados();

    for (let integrante of integrantes) {
      idsIntegrantes.push(integrante.id);
    }

    let peticion = this._gp.insertInvitadosGrupo(
      grupo.id,
      "",
      this.util.getFechaActual(),
      this.objFamiliar.id,
      this.objFamiliar.codigo,
      idsIntegrantes
    );

    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.navCtrl.pop();
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

  private obtenerContactosSeleccionados():any[] {
    let listaIntegrantes:any[] = [];

    if (!this.contactos) {
      return listaIntegrantes;
    }

    for (let contacto of this.contactos) {
      if (contacto.seleccionado) {
        listaIntegrantes.push(contacto)
      }

    }

    return listaIntegrantes;
  }

  // agregarIntegrantes() {
    // let cargarPeticion = this.loadingCtrl.create({
    //   content: 'agregando integrantes al grupo',
    //   enableBackdropDismiss: true
    // });

    // cargarPeticion.present();

  //   let contactos = this.obtenerContactosSeleccionados();
  //
  //   outerloop:
  //   for (let contacto of contactos) {
  //     for (let integrante of this.integrantes) {
  //       if (integrante.fkinvitado == contacto.id) {
  //         // si ya hay un integrante con el id del contacto seleccionado,
  //         // omito registrar el contacto actual
  //         continue outerloop;
  //       }
  //
  //     }
  //
  //     let peticion = this._gp.insertInvitadoGrupo(
  //       this.objGrupo.id,
  //       contacto.id,
  //       "", // observacion
  //       this.util.getFechaActual(),
  //       this.objFamiliar.id,
  //       this.objFamiliar.codigo
  //     );
  //
  //     // cargarPeticion.onDidDismiss( () => {
  //     //   peticionEnCurso.unsubscribe();
  //     // })
  //
  //     peticion.map( resp => {
  //       let datos = resp.json();
  //
  //       if (datos.success) {
  //         datos = datos.response;
  //
  //         let idDetalleGrupo = datos.idDetalleGrupo;
  //
  //         /* el integrante con el formato adecuado para agregarlo directo a la
  //           lista*/
  //         let obj = {
  //           id: idDetalleGrupo,
  //           fkinvitado: contacto.id,
  //           nombre_invitado: contacto.nombre + " " + contacto.apellido,
  //           fkgrupo: this.objGrupo.id,
  //           nombre_grupo: this.objGrupo.nombre,
  //           observacion: "",
  //           fecha: this.util.getFechaHoraNormal()
  //         }
  //
  //         this.integrantes.push(obj)
  //       } else {
  //         let mensaje:string = datos.message;
  //
  //         /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
  //         if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
  //           this.util.toast(mensaje);
  //         }
  //       }
  //
  //     }).subscribe(
  //       success => {
  //         // cargarPeticion.dismiss();
  //       },
  //       err => {
  //         // cargarPeticion.dismiss();
  //       }
  //     );
  //   }
  //
  //   this.navCtrl.pop();
  // }

}
