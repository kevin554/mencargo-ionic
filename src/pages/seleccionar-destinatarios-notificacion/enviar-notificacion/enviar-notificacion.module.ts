import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnviarNotificacionPage } from './enviar-notificacion';

@NgModule({
  declarations: [
    EnviarNotificacionPage,
  ],
  imports: [
    IonicPageModule.forChild(EnviarNotificacionPage),
  ],
})
export class EnviarNotificacionPageModule {}
