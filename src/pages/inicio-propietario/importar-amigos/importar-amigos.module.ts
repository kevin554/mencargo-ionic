import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportarAmigosPage } from './importar-amigos';

@NgModule({
  declarations: [
    ImportarAmigosPage,
  ],
  imports: [
    IonicPageModule.forChild(ImportarAmigosPage),
  ],
})
export class ImportarAmigosPageModule {}
