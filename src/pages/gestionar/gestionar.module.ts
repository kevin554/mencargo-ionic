import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionarPage } from './gestionar';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    GestionarPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionarPage),
    ComponentsModule
  ],
})
export class GestionarPageModule {}
