import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverGestionarPage } from './popover-gestionar';

import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  declarations: [
    PopoverGestionarPage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverGestionarPage),
    ComponentsModule
  ],
})
export class PopoverGestionarPageModule {}
