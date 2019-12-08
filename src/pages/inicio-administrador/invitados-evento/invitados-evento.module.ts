import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitadosEventoPage } from './invitados-evento';
import { ComponentsModule } from '../../../components';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

@NgModule({
  declarations: [
    InvitadosEventoPage,
  ],
  imports: [
    IonicPageModule.forChild(InvitadosEventoPage),
    ComponentsModule,
    SweetAlert2Module
  ],
})
export class InvitadosEventoPageModule {}
