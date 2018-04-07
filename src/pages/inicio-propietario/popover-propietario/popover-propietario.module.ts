import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverPropietarioPage } from './popover-propietario';

import { ComponentsModule } from '../../../components';

@NgModule({
  declarations: [
    PopoverPropietarioPage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverPropietarioPage),
    ComponentsModule
  ],
})
export class PopoverPropietarioPageModule {}
