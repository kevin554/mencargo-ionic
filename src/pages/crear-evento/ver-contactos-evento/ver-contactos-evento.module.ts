import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerContactosEventoPage } from './ver-contactos-evento';
import { DirectivesModule } from '../../../directives/index';

@NgModule({
  declarations: [
    VerContactosEventoPage,
  ],
  imports: [
    IonicPageModule.forChild(VerContactosEventoPage),
    DirectivesModule
  ],
})
export class VerContactosEventoPageModule {}
