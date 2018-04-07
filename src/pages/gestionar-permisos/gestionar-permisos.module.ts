import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionarPermisosPage } from './gestionar-permisos';

@NgModule({
  declarations: [
    GestionarPermisosPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionarPermisosPage),
  ],
})
export class GestionarPermisosPageModule {}
