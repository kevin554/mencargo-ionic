import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InicioAdministradorPage } from './inicio-administrador';

import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    InicioAdministradorPage,
  ],
  imports: [
    IonicPageModule.forChild(InicioAdministradorPage),
    SweetAlert2Module,
    ComponentsModule
  ],
})
export class InicioAdministradorPageModule {}
