import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerNotificacionesPage } from './ver-notificaciones';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    VerNotificacionesPage,
  ],
  imports: [
    IonicPageModule.forChild(VerNotificacionesPage),
    ComponentsModule
  ],
})
export class VerNotificacionesPageModule {}
