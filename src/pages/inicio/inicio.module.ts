import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InicioPage } from './inicio';

import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

@NgModule({
  declarations: [
    InicioPage,
  ],
  imports: [
    IonicPageModule.forChild(InicioPage),
    SweetAlert2Module
  ],
})
export class InicioPageModule {}
