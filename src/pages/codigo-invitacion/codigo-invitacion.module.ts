import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CodigoInvitacionPage } from './codigo-invitacion';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    CodigoInvitacionPage,
  ],
  imports: [
    IonicPageModule.forChild(CodigoInvitacionPage),
    ComponentsModule
  ],
})
export class CodigoInvitacionPageModule {}
