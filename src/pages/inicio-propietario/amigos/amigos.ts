import { Component } from '@angular/core';
import { AlertController, IonicPage, Loading, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { InvitadoProvider, MovimientoProvider, UtilServiceProvider, InvitadoDao } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-amigos',
  templateUrl: 'amigos.html',
})
export class AmigosPage {

  private objFamiliar:any;
  private amigos:any[];
  private cargarPeticion:Loading;
  private peticionEnCurso:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public alertCtrl: AlertController, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider, private _ip: InvitadoProvider,
      private _mp: MovimientoProvider, private invitadoDao: InvitadoDao,
      private platform: Platform) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
      this.cargarAmigos();
    }
  }

  /* cuando se presione la tecla atrás, es necesario finalizar con cualquier
    peticion que se esté ejecutando */
  ionViewWillLeave() {
    if (this.cargarPeticion) {
      this.cargarPeticion.dismiss();
    }
  }

  /**
  * carga los datos del contacto/amigo al formulario
  */
  public cargarDatos(amigo) {
    let parametros = {
      familiar: this.objFamiliar,
      amigo: amigo,
      amigos: this.amigos,
      soloRegistrarAmigo: true
    }

    this.navCtrl.push('RegistrarInvitacionPage', parametros);
  }

  public enviarInvitacion(amigo) {
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Generando invitación',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._mp.insertarInvitacionDesdeFamiliar(amigo.nombre,
      amigo.apellido,
      "24",
      "horas",
      this.util.getFechaActual().substring(0, 10) + " 00:00:00",
      amigo.ci,
      amigo.expedicion,
      amigo.celular,
      "" /* placa */,
      this.objFamiliar.id,
      amigo.id,
      "",
      "Familiar",
      this.util.getFechaActual(),
      this.objFamiliar.codigo);

    /* si se cancela antes de que se complete la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response; /* {idvisita, idmovimiento} */

        this.navCtrl.pop();

        let parametros = {
          idInvitado: datos.idmovimiento,
          nombreInvitado: (amigo.nombre + ' ' + amigo.apellido)
        }

        this.navCtrl.push('CodigoInvitacionPage', parametros);

        if (this.platform.is("cordova")) {
          let obj = {
            id: datos.idvisita,
            nombre: amigo.nombre,
            apellido: amigo.apellido,
            ci: amigo.ci,
            expedicion: amigo.expedicion,
            celular: amigo.celular,
            fkfamilia: this.objFamiliar.id,
            fkcondominio: this.objFamiliar.condominio
          }

          this.agregarInvitacionLocal(obj);
        }
      }

    }).subscribe(
      sucess => {
        cargarPeticion.dismiss()
      },
      errr => {
        cargarPeticion.dismiss()
      }
    );
  }

  public importarAmigos() {
    let parametros = {
      familiar: this.objFamiliar
    }

    this.navCtrl.push('ImportarAmigosPage', parametros);
  }

  public gestoActualizar(refresher) {
    this.cargarAmigos();
    refresher.complete();
  }

  public agregarAmigo() {
    let parametros = {
      amigos: this.amigos,
      soloRegistrarAmigo: true,
      familiar: this.objFamiliar
    }

    this.navCtrl.push('RegistrarInvitacionPage', parametros);
  }

  public verGrupos() {
    let parametros = {
      familiar: this.objFamiliar
    }

    this.navCtrl.push('VerGruposPage', parametros);
  }

  private cargarAmigos() {
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Cargando lista de amigos',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._ip.seleccionarAmigos(
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;
        this.amigos = [];

        for (let indice in datos) {
          let amigo = datos[indice];
          this.amigos.push(amigo);

          if (this.platform.is("cordova")) {
            this.agregarInvitacionLocal(amigo);
          }
        }

        this.util.ordenarPorMultiplesCampos(this.amigos, "nombre", "apellido");

      } else {
        let mensaje:string = datos.message;

        /* Se anulo la sesión de este dispositivo contacte con gerencia por favor. */
        if (mensaje.toLowerCase().startsWith("se anulo la sesión ")) {
          this.util.toast(mensaje);
        }
      }

    }).subscribe(
      success => {
        this.cargarPeticion.dismiss();
      },
      err => {
        this.cargarPeticion.dismiss();
        this.cargarAmigosLocal();
      }
    );
  }

  public confirmarEliminarAmigo(indice, slidingItem) {
    let alert = this.alertCtrl.create({
      title: '¿Eliminar amigo?',
      buttons: [
        {
          text: 'No',
          handler: () => { slidingItem.close() }
        },
        {
          text: 'Si',
          handler: () => { this.eliminarAmigo(indice) }
        }
      ]
    });

    alert.present();
  }

  private eliminarAmigo(indice) {
    let amigo = this.amigos[indice];

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Eliminando amigo',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._ip.eliminar(
      amigo.id,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    /* si cancela antes de que se complete la peticion */
    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.amigos.splice(indice, 1);

        if (this.platform.is("cordova")) {
          this.invitadoDao.eliminar(amigo.id);
        }
      } else {
        let alert = this.alertCtrl.create({
          title: 'Hubo un error al eliminar tu amigo',
          buttons: [ {text: 'ok'} ]
        });

        alert.present();
      }
    }).subscribe(
      success => {
        this.cargarPeticion.dismiss()
      },
      err => {
        this.cargarPeticion.dismiss();
        this.util.toast('Hubo un error al conectarse con el servidor.');
      }
    );
  }

  private agregarInvitacionLocal(invitacion) {
    /* el objeto listo para insertar en local */
    let obj = {
      id: invitacion.id,
      nombre: invitacion.nombre,
      apellido: invitacion.apellido,
      ci: invitacion.ci,
      expedicion: invitacion.expedicion,
      celular: invitacion.celular,
      fkfamilia: invitacion.fkfamilia,
      fkcondominio: invitacion.fkcondominio
    }

    this.invitadoDao.insertar(obj);
  }

  private cargarAmigosLocal() {
    if (this.platform.is("cordova")) {
      this.invitadoDao.getDatabaseState().subscribe( listo => {
        if (listo) {
          this.invitadoDao.seleccionarTodas().then( (datos)  => {
            this.amigos = [];

            for (let i in datos) {
              let amigo = datos[i];
              this.amigos.push(amigo);
            }

            /* voy a ordenar los amigos */
            this.util.ordenarPorMultiplesCampos(this.amigos, "nombre", "apellido");
          }); /* fin de familiarDao.seleccionarTodas() */
        }

      }); /* fin del getDatabaseState */
    }
  }

}
