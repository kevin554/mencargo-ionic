import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerDetalleNotificacionPage } from './ver-detalle-notificacion';

@NgModule({
  declarations: [
    VerDetalleNotificacionPage,
  ],
  imports: [
    IonicPageModule.forChild(VerDetalleNotificacionPage),
  ],
})
export class VerDetalleNotificacionPageModule {}
