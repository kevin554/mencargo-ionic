import { Component, Input } from '@angular/core';

@Component({
  selector: 'empty-state',
  templateUrl: 'empty-state.html'
})
export class EmptyStateComponent {

  @Input()error: string;
  @Input()posibleSolucion: string;
  @Input()img: string;
  constructor() { }

}
