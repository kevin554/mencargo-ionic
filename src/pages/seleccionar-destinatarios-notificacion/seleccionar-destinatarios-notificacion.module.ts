import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeleccionarDestinatariosNotificacionPage } from './seleccionar-destinatarios-notificacion';

@NgModule({
  declarations: [
    SeleccionarDestinatariosNotificacionPage,
  ],
  imports: [
    IonicPageModule.forChild(SeleccionarDestinatariosNotificacionPage),
  ],
})
export class SeleccionarDestinatariosNotificacionPageModule {}
