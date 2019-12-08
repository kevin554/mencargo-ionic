import { Component, ChangeDetectorRef } from '@angular/core';
import { LoadingController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AdministradorProvider } from '../../providers/index.services'

@IonicPage()
@Component({
  selector: 'page-gestionar-permisos',
  templateUrl: 'gestionar-permisos.html',
})
export class GestionarPermisosPage {

  public listaPrivilegios:ModeloPrivilegios[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
      public popoverCtrl: PopoverController, private _ap: AdministradorProvider,
      public loadingCtrl: LoadingController, public detectorRef: ChangeDetectorRef) {
    if (navParams.get("privilegios")) {
      this.listaPrivilegios = navParams.get("privilegios");
    }
  }

  public desplegarMenu(evento) {
    let popover = this.popoverCtrl.create("PopoverGestionarPage");

    popover.present({
      ev: evento
    });
  }

  public actualizarPrivilegio(privilegio) {
    /* visualmente el privilegio no debe cambiar hasta que finalice la peticion */
    privilegio.estado = !privilegio.estado;

    /* se mostrará un carga */
    let cargando = this.loadingCtrl.create({
      content: `${privilegio.estado ? 'concediendo' : 'denegando'} el privilegio`,
      // dismissOnPageChange: true

    });

    cargando.present();

    cargando.onDidDismiss( () => {
      peticionEnCurso.unsubscribe();
    });

    let peticion = this._ap.actualizarPrivilegio(
      this._ap.getId(),
      this._ap.getCodigo(),
      privilegio.id,
      privilegio.estado
    );

    let peticionEnCurso = peticion.map(resp => {
      let datos = resp.json();

      if (datos.success) {
        // privilegio.estado = !privilegio.estado;
      } else {

      }

    }).subscribe(
      success => {
        cargando.dismiss();
      }, err => {
        /* ahora sí, el privilegio cambia visualmente */
        privilegio.estado = !privilegio.estado;
        cargando.dismiss();
      }
    );
  }

}

interface ModeloPrivilegios {

  id:number;
  fkuser:number;
  boton:string;
  estado:boolean;

}
