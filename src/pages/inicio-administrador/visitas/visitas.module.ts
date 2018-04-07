import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisitasPage } from './visitas';
import { ComponentsModule } from '../../../components/components.module';
@NgModule({
  declarations: [
    VisitasPage,
  ],
  imports: [
    IonicPageModule.forChild(VisitasPage),
    ComponentsModule
  ],
})
export class VisitasPageModule {}
