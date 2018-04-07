import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstadoIngresoPage } from './estado-ingreso';

@NgModule({
  declarations: [
    EstadoIngresoPage,
  ],
  imports: [
    IonicPageModule.forChild(EstadoIngresoPage)
  ],
})
export class EstadoIngresoPageModule {}
