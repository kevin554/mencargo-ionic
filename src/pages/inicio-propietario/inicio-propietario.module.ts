import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InicioPropietarioPage } from './inicio-propietario';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    InicioPropietarioPage,
  ],
  imports: [
    IonicPageModule.forChild(InicioPropietarioPage),
    ComponentsModule
  ],
})
export class InicioPropietarioPageModule {}
