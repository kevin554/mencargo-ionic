import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegistrarFamiliarPage } from './registrar-familiar';

import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RegistrarFamiliarPage,
  ],
  imports: [
    IonicPageModule.forChild(RegistrarFamiliarPage),
    PipesModule
  ],
})
export class RegistrarFamiliarPageModule {}
