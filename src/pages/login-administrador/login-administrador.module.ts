import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginAdministradorPage } from './login-administrador';

import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

@NgModule({
  declarations: [
    LoginAdministradorPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginAdministradorPage),
    SweetAlert2Module
  ],
})
export class LoginAdministradorPageModule {}
