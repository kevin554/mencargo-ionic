import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegistrarIngresoManualPage } from './registrar-ingreso-manual';

@NgModule({
  declarations: [
    RegistrarIngresoManualPage,
  ],
  imports: [
    IonicPageModule.forChild(RegistrarIngresoManualPage),
  ],
})
export class RegistrarIngresoManualPageModule {}
