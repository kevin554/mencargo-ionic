import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Contacts } from '@ionic-native/contacts';
import { InvitadoProvider, UtilServiceProvider } from '../../../providers/index.services';

@IonicPage()
@Component({
  selector: 'page-importar-amigos',
  templateUrl: 'importar-amigos.html',
})
export class ImportarAmigosPage {

  private contactos:ModeloContacto[];
  private letraVisualizada:string;
  private objFamiliar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
      private contacts: Contacts, private util: UtilServiceProvider,
      private _ip: InvitadoProvider, public loadingCtrl: LoadingController) {
    if (navParams.get("familiar")) {
      this.objFamiliar = navParams.get("familiar");
    }

    // this.contactos = [
      // {nombre: 'nico', apellido: 'duran', telefonos: [76656576, 3221537], seleccionado: true},
      // {nombre: 'ricky', apellido: 'paz', telefonos: [70030441], seleccionado: true},
      // {nombre: 'gaby', apellido: 'telefono', telefonos: [77390930], seleccionado: false}
    // ]
  }

  ionViewDidLoad() {
    this.cargarContactos();
  }

  /**
  * devuelve la primera letra del nombre de un contacto
  */
  public primeraLetra(contacto:ModeloContacto) {
    return contacto.nombre.charAt(0).toUpperCase();
  }

  /**
  * devuelve true si es la primera vez que la letra aparece en la etiqueta
  * ion-item-divider
  */
  public letraNoSeVisualizo(contacto:ModeloContacto):boolean {
    if (this.primeraLetra(contacto) != this.letraVisualizada) {
      this.letraVisualizada = this.primeraLetra(contacto);

      return true;
    }

    return false;
  }

  private cargarContactos() {
    /* informo al usuario que se están cargando sus contactos */
    let cargandoAmigos = this.loadingCtrl.create({
      content: 'por favor espere, estamos cargando sus contactos',
      enableBackdropDismiss: true
    });

    cargandoAmigos.present();

    this.contacts.find(["displayName"]).then(
      data => {
        this.contactos = [];
        let objContacto:ModeloContacto;

        for (let i in data) {
          let contacto = data[i];

          /*
          si el contacto no tiene un nombre, lo omito para no tener problemas a
          la horade comporar contactos por nombre
          */
          if (!contacto.displayName) {
            continue;
          }

          let listaTelefonos:any[] = [];
          for (let j in contacto.phoneNumbers) {
            let telefono = contacto.phoneNumbers[j];
            listaTelefonos.push( this.getTelefonoSinPrefijo(telefono.value) );
          }

          objContacto = {
            nombre: contacto.name.givenName,
            apellido: contacto.name.familyName ? contacto.name.familyName : "",
            telefonos: listaTelefonos,
            seleccionado: false
          }

          this.contactos.push(objContacto);
        }

        this.util.ordenarPorMultiplesCampos(this.contactos, "nombre", "apellido");

        cargandoAmigos.dismiss();
      }, err => {
        // console.log(`Hubo un error al cargar los contactos (${JSON.stringify(err)})`);
        this.util.toast(`Hubo un error al cargar los contactos`);
        cargandoAmigos.dismiss();
      });
  }

  getTelefonoSinPrefijo(telefono:string):number {
    if (!telefono.includes(" ")) {
      return parseInt(telefono);
    }

    let posEspacio = telefono.indexOf(" ");

    telefono = telefono.substr(posEspacio).trim();

    return parseInt(telefono);
  }

  /**
  * marca como seleccionado un contacto de la lista de contactos
  */
  public seleccionarContacto(contacto) {
    contacto.seleccionado = !contacto.seleccionado;
  }

  /**
  * Importa los contactos seleccionados (del telefono) a la aplicacion
  */
  public importarContactos() {
    let contactosSeleccionados:any[] = [];

    // solo quiero hacer la operacion una vez
    let hayContactosSeleccionados = this.hayContactosSeleccionados();

    if (!this.hayContactosSeleccionados()) {
      this.util.toast("Seleccione al menos un contacto.");
      return;
    }

    for (let contacto of this.contactos) {
      // creo el objeto de la manera requerida por el servicio
      let obj = {
        id: 0,
        nombre: contacto.nombre,
        apellido: contacto.apellido,
        ci: 0,
        expedicion: "",
        celular: contacto.telefonos[0] ? contacto.telefonos[0] : 0,
        fkfamilia: this.objFamiliar.id
      }

      /* si nay ningun contacto seleccionado específicamente, agrego a todos */
      // if (!hayContactosSeleccionados) {
      //   contactosSeleccionados.push(obj);
      // } else if (hayContactosSeleccionados && contacto.seleccionado) {
        if (hayContactosSeleccionados && contacto.seleccionado) {
        contactosSeleccionados.push(obj);
      }
    }

    // this.util.toast(`agregar a ${JSON.stringify(contactosSeleccionados)}`);
    let cargarPeticion = this.loadingCtrl.create({
      content: 'Agregando contactos a la aplicación.',
      enableBackdropDismiss: true
    });

    cargarPeticion.present();

    let peticion = this._ip.insertarAmigos(
      this.objFamiliar.id,
      this.objFamiliar.codigo,
      contactosSeleccionados
    );

    /* si se cancela antes de que se complete la peticion */
    cargarPeticion.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticionEnCurso = peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        this.navCtrl.popToRoot();
      }
    }).subscribe(
      success => {
        cargarPeticion.dismiss()
      }, err => {
        cargarPeticion.dismiss()
      }
    );
  }

  /**
  * devueve verdadero si hay algun contacto seleccionado de la lista de contactos
  */
  private hayContactosSeleccionados():boolean {
    if (!this.contactos) {
      return false;
    }

    for (let contacto of this.contactos) {
      if (contacto.seleccionado) return true;
    }

    return false;
  }

}

/** EL OBJETO JSON QUE DEVUELVE EL PLUGIN DE LOS CONTACTOS
[
  {
    "_objectInstance":
      {
        "id":"15",
        "rawId":null,
        "displayName":"Alejandro Cabrera",
        "name":
          {
            "familyName":"Cabrera",
            "givenName":"Alejandro",
            "formatted":"Alejandro Cabrera"
          },
        "nickname":null,
        "phoneNumbers":
          [
            {
              "id":"28",
              "pref":false,
              "value":"73496410",
              "type":"mobile"
            },
            {
              "id":"35",
              "pref":false,
              "value":"73496410",
              "type":"mobile"
            }
          ],
        "emails":null,
        "addresses":null,
        "ims":null,
        "organizations":null,
        "birthday":null,
        "note":null,
        "photos":null,
        "categories":null,
        "urls":null
      },
    "rawId":"14"
  }, ... { }
]
*/
interface ModeloContacto {

  nombre:string;
  apellido:string;
  telefonos:any[];
  seleccionado:boolean;

}
