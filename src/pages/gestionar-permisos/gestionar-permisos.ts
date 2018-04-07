import { Component } from '@angular/core';
import { LoadingController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AdministradorProvider } from '../../providers/index.services'

@IonicPage()
@Component({
  selector: 'page-gestionar-permisos',
  templateUrl: 'gestionar-permisos.html',
})
export class GestionarPermisosPage {

  private listaPrivilegios:ModeloPrivilegios[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public popoverCtrl: PopoverController, private _ap: AdministradorProvider,
      public loadingCtrl: LoadingController) {
    if (navParams.get("privilegios")) {
      this.listaPrivilegios = navParams.get("privilegios");
    }
  }
  
  public desplegarMenu(evento) {
    let popover = this.popoverCtrl.create('PopoverGestionarPage');

    popover.present({
      ev: evento
    });
  }

  public actualizarPrivilegio(privilegio) {
    privilegio.estado = !privilegio.estado;

    /* se mostrará un carga */
    let cargando = this.loadingCtrl.create({
      content: `${privilegio.estado ? 'concediendo' : 'denegando'} el privilegio`
    });

    cargando.present();

    cargando.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    })

    let peticion = this._ap.actualizarPrivilegio(this._ap.getId(),
        this._ap.getCodigo(), privilegio.id, privilegio.estado);

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {

      }

    }).subscribe(
      success => {
        cargando.dismiss();
      }, err => {
        privilegio.estado = !privilegio.estado;
        cargando.dismiss();
      }
    )
  }

}

interface ModeloPrivilegios {

  id:number;
  fkuser:number;
  boton:string;
  estado:boolean;

}
