import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditarFamiliarPage } from './editar-familiar';

@NgModule({
  declarations: [
    EditarFamiliarPage,
  ],
  imports: [
    IonicPageModule.forChild(EditarFamiliarPage),
  ],
})
export class EditarFamiliarPageModule {}
