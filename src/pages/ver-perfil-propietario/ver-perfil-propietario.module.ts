import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerPerfilPropietarioPage } from './ver-perfil-propietario';
import { ComponentsModule } from '../../components';

@NgModule({
  declarations: [
    VerPerfilPropietarioPage,
  ],
  imports: [
    IonicPageModule.forChild(VerPerfilPropietarioPage),
    ComponentsModule
  ],
})
export class VerPerfilPropietarioPageModule {}
