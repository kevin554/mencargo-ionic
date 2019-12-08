import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerGrupoPage } from './ver-grupo';
import { ComponentsModule } from '../../../components';

@NgModule({
  declarations: [
    VerGrupoPage,
  ],
  imports: [
    IonicPageModule.forChild(VerGrupoPage),
    ComponentsModule
  ],
})
export class VerGrupoPageModule {}
