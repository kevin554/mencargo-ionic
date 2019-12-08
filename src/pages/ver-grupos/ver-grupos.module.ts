import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerGruposPage } from './ver-grupos';
import { ComponentsModule } from '../../components';
import { DirectivesModule } from '../../directives';

@NgModule({
  declarations: [
    VerGruposPage,
  ],
  imports: [
    IonicPageModule.forChild(VerGruposPage),
    ComponentsModule,
    DirectivesModule
  ],
})
export class VerGruposPageModule {}
