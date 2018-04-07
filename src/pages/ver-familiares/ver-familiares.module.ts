import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerFamiliaresPage } from './ver-familiares';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    VerFamiliaresPage,
  ],
  imports: [
    IonicPageModule.forChild(VerFamiliaresPage),
    ComponentsModule
  ],
})
export class VerFamiliaresPageModule {}
