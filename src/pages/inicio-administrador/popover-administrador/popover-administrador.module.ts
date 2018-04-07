import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverAdministradorPage } from './popover-administrador';

import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  declarations: [
    PopoverAdministradorPage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverAdministradorPage),
    ComponentsModule
  ],
})
export class PopoverAdministradorPageModule {}
