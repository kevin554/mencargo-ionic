import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { AppState } from '../../../app/app.global';

@IonicPage()
@Component({
  selector: 'page-popover-gestionar',
  templateUrl: 'popover-gestionar.html',
})
export class PopoverGestionarPage {

  constructor(private global: AppState) { }

}
