import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPropietarioPage } from './login-propietario';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
@NgModule({
  declarations: [
    LoginPropietarioPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPropietarioPage),
    SweetAlert2Module
  ],
})
export class LoginPropietarioPageModule {}
