import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeleccionarMetodoLoginPage } from './seleccionar-metodo-login';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

@NgModule({
  declarations: [
    SeleccionarMetodoLoginPage,
  ],
  imports: [
    IonicPageModule.forChild(SeleccionarMetodoLoginPage),
    SweetAlert2Module
  ],
})
export class SeleccionarMetodoLoginPageModule {}
