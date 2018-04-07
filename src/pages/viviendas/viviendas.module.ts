import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViviendasPage } from './viviendas';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ViviendasPage,
  ],
  imports: [
    IonicPageModule.forChild(ViviendasPage),
    ComponentsModule
  ],
})
export class ViviendasPageModule {}
