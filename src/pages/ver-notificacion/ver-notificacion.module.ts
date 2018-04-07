import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerNotificacionPage } from './ver-notificacion';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    VerNotificacionPage,
  ],
  imports: [
    IonicPageModule.forChild(VerNotificacionPage),
    ComponentsModule
  ],
})
export class VerNotificacionPageModule {}
