import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AmigosPage } from './amigos';
import { ComponentsModule } from '../../../components';

@NgModule({
  declarations: [
    AmigosPage,
  ],
  imports: [
    IonicPageModule.forChild(AmigosPage),
    ComponentsModule
  ],
})
export class AmigosPageModule {}
