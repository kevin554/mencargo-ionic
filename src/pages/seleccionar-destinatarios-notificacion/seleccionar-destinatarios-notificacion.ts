import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-seleccionar-destinatarios-notificacion',
  templateUrl: 'seleccionar-destinatarios-notificacion.html',
})
export class SeleccionarDestinatariosNotificacionPage {

  private objCondominio:any;
  private objUsuario:any;
  private casas:any[];
  private usuarios:any[];
  private familiares:any[];
  private casasSeleccionadas:string[];
  private usuariosSeleccionados:string[];
  private familiaresSeleccionados:string[];
  private todasLasCasasSeleccionadas:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }

    if (navParams.get("usuario")) {
      this.objUsuario = navParams.get("usuario");
    }

    this.cargarCasas();
    this.cargarUsuarios();
    this.cargarFamiliares();
  }

  private cargarCasas() {
    this.casas = [];
    this.casas.push({familia:'Duran'});
    this.casas.push({familia:'Mendez'});
    this.casas.push({familia:'Ribera'});
  }

  private cargarUsuarios() {

  }

  private cargarFamiliares() {

  }

  allClickedCategories() {
    if (!this.casasSeleccionadas) {
      this.casasSeleccionadas = [];
    }
    // let casas:string[] = [];
    //
    // casas.push("Duran");
    // casas.push("Mendez");
    // casas.push("Ribera");
    // for (let casa of this.casas) {
    //   this.casasSeleccionadas.push(casa.familia);
    // }
    this.todasLasCasasSeleccionadas = true;
  }

  public siguiente() {
    let parametros = {
      condominio: this.objCondominio,
      usuario: this.objUsuario,
      casas: this.casasSeleccionadas,
      usuarios: this.usuariosSeleccionados,
      familiares: this.familiaresSeleccionados
    };

    this.navCtrl.push("EnviarNotificacionPage", parametros);
  }

}
