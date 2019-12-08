import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerPerfilViviendaPage } from './ver-perfil-vivienda';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    VerPerfilViviendaPage,
  ],
  imports: [
    IonicPageModule.forChild(VerPerfilViviendaPage),
    ComponentsModule
  ],
})
export class VerPerfilViviendaPageModule {}
