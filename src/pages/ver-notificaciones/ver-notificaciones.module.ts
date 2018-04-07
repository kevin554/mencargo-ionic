import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerNotificacionesPage } from './ver-notificaciones';

@NgModule({
  declarations: [
    VerNotificacionesPage,
  ],
  imports: [
    IonicPageModule.forChild(VerNotificacionesPage),
  ],
})
export class VerNotificacionesPageModule {}
