import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InicioPropietarioPage } from './inicio-propietario';
import { ComponentsModule } from '../../components/components.module';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

@NgModule({
  declarations: [
    InicioPropietarioPage,
  ],
  imports: [
    IonicPageModule.forChild(InicioPropietarioPage),
    ComponentsModule,
    SweetAlert2Module
  ],
})
export class InicioPropietarioPageModule {}
