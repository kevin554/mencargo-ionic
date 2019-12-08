import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegistrarUsuarioPasswordPage } from './registrar-usuario-password';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

@NgModule({
  declarations: [
    RegistrarUsuarioPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(RegistrarUsuarioPasswordPage),
    SweetAlert2Module
  ],
})
export class RegistrarUsuarioPasswordPageModule {}
