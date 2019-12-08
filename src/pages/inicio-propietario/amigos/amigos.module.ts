import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AmigosPage } from './amigos';
import { ComponentsModule } from '../../../components';
import { DirectivesModule } from '../../../directives';

@NgModule({
  declarations: [
    AmigosPage,
  ],
  imports: [
    IonicPageModule.forChild(AmigosPage),
    ComponentsModule,
    DirectivesModule
  ],
})
export class AmigosPageModule {}
