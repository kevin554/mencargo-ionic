import { Component } from '@angular/core';
import { AlertController, IonicPage, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';
import { GrupoProvider, UtilServiceProvider } from '../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-ver-grupos',
  templateUrl: 'ver-grupos.html',
})
export class VerGruposPage {

  private objFamiliar:any;
  private grupos:any[];
  private cargarPeticion:Loading;
  private peticionEnCurso:any;
  public noHayConexion:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public alertCtrl: AlertController, public loadingCtrl: LoadingController,
      private util: UtilServiceProvider, private _gp: GrupoProvider) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
      this.cargarGrupos();
    }
  }

  public gestoActualizar(refresher) {
    this.cargarGrupos();
    refresher.complete();
  }

  /**
  * carga los datos del contacto/amigo al formulario
  */
  public cargarDatos(grupo) {
    let integrantes = [];

    for (let i in grupo.detallegrupo) {
      let integrante = grupo.detallegrupo[i];
      integrantes.push(integrante);
    }

    let parametros = {
      familiar: this.objFamiliar,
      grupo: grupo,
      integrantes: integrantes
    }

    this.navCtrl.push('VerGrupoPage', parametros);
  }

  public agregarGrupo() {
    // let alert = this.alertCtrl.create({
    //   title: 'Nombre del grupo:',
    //   inputs: [
    //     {
    //       name: 'nombre',
    //       placeholder: 'nombre'
    //     }
    //   ],
    //   buttons: [
    //     {
    //       text: 'Cancelar',
    //       role: 'cancel',
    //       handler: data => { }
    //     },
    //     {
    //       text: 'Agregar',
    //       handler: data => {
    //         let nombreGrupo = data.nombre.trim();
    //
    //         if (!nombreGrupo) {
    //           this.util.toast("debe colocar un nombre al grupo");
    //           return;
    //         }
    //
    //         this.registrarGrupo(data.nombre);
    //       }
    //     }
    //   ]
    // });
    //
    // alert.present();
    this.navCtrl.push("RegistrarInvitadoGrupoPage", { familiar: this.objFamiliar })
  }

  registrarGrupo(nombre) {
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'creando grupo',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let descripcion = "";
    let fecha = this.util.getFechaActual();

    let peticion = this._gp.insertar(
      nombre,
      descripcion,
      fecha,
      this.objFamiliar.condominio,
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

        let idGrupo = datos.idgrupo;

        /* con el formato adecuado para agregar a la lista */
        let grupo = {
          id: idGrupo,
          nombre: nombre,
          descripcion: descripcion,
          detallegrupo: [],
          fecha: this.util.getFechaHoraNormal(),
          fkfamilia: this.objFamiliar.id,
          nombre_familiar: this.objFamiliar.nombre + " " + this.objFamiliar.apellido,
          ci_familiar: this.objFamiliar.ci,
          fkcondominio: this.objFamiliar.condominio
        }

        this.grupos.push(grupo);

        this.util.ordenar(this.grupos, "nombre");

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
        this.noHayConexion = false;
      },
      err => {
        this.cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    );
  }

  private cargarGrupos() {
    this.cargarPeticion = this.loadingCtrl.create({
      content: 'cargando grupos',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let peticion = this._gp.listarGrupoFamiliar(
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
        this.grupos = [];

        for (let indice in datos) {
          let grupo = datos[indice];
          this.grupos.push(grupo);
        }

        this.util.ordenar(this.grupos, "nombre");

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
        this.noHayConexion = false;
      },
      err => {
        this.cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    );
  }

  public confirmarEliminarGrupo(indice, slidingItem) {
    let alert = this.alertCtrl.create({
      title: '¿eliminar grupo?',
      buttons: [
        {
          text: 'no',
          handler: () => { slidingItem.close() }
        },
        {
          text: 'si',
          handler: () => { this.eliminarGrupo(indice) }
        }
      ]
    });

    alert.present();
  }

  private eliminarGrupo(indice) {
    let grupo = this.grupos[indice];

    let cargarPeticion = this.loadingCtrl.create({
      content: 'eliminando grupo',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._gp.eliminar(
      grupo.id,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    // si cancela antes de que se complete la peticion
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.grupos.splice(indice, 1);
      } else {
        let alert = this.alertCtrl.create({
          title: 'hubo un error al eliminar tu grupo',
          buttons: [ {text: 'ok'} ]
        });

        alert.present();
      }
    }).subscribe(
      success => {
        cargarPeticion.dismiss()
      },
      err => {
        cargarPeticion.dismiss();
        this.util.toast('hubo un error al conectarse con el servidor');
      }
    );
  }

  public editar(indice, slidingItem) {
    let grupo = this.grupos[indice];

    let alert = this.alertCtrl.create({
      title: 'Nombre del grupo:',
      inputs: [
        {
          name: 'nombre',
          placeholder: 'nombre',
          value: grupo.nombre
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { slidingItem.close() }
        },
        {
          text: 'Guardar',
          handler: data => {
            let nombreGrupo = data.nombre.trim();

            if (!nombreGrupo) {
              this.util.toast("Debe colocar un nombre al grupo.");
              return;
            }

            slidingItem.close();
            this.actualizarGrupo(indice, data.nombre);
          }
        }
      ]
    });

    alert.present();
  }

  actualizarGrupo(indice, nuevoNombre) {
    let grupo = this.grupos[indice];

    this.cargarPeticion = this.loadingCtrl.create({
      content: 'Actualizando el nombre del grupo.',
      enableBackdropDismiss: true
    });

    this.cargarPeticion.present();

    let descripcion = "";
    let fecha = this.util.getFechaActual();

    let peticion = this._gp.actualizar(
      grupo.id,
      nuevoNombre,
      descripcion,
      fecha,
      this.objFamiliar.id,
      this.objFamiliar.codigo
    );

    this.cargarPeticion.onDidDismiss( () => {
      this.peticionEnCurso.unsubscribe();
    });

    this.peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        grupo.nombre = nuevoNombre;

        this.util.ordenar(this.grupos, "nombre");
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
        this.noHayConexion = false;
      },
      err => {
        this.cargarPeticion.dismiss();
        this.noHayConexion = true;
      }
    );
  }

}
