import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CrearEventoPage } from './crear-evento';

@NgModule({
  declarations: [
    CrearEventoPage,
  ],
  imports: [
    IonicPageModule.forChild(CrearEventoPage),
  ],
})
export class CrearEventoPageModule {}
