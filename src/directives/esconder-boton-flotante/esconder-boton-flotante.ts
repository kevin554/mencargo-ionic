import { Directive, ElementRef, Renderer } from '@angular/core';
import { Content } from "ionic-angular";

@Directive({
  selector: '[esconder-boton-flotante]',
  host: {
    '(ionScroll)': 'handleScroll($event)'
  }
})
export class EsconderBotonFlotanteDirective {

  private fabRef;
  private storedScroll: number = 0;
  private threshold: number = 2;

  constructor(public element:ElementRef,public renderer:Renderer) { }

  ngAfterViewInit() {
    this.fabRef = this.element.nativeElement.getElementsByClassName("fab")[0];
    if (this.fabRef) {
      this.renderer.setElementStyle(this.fabRef, 'webkitTransition',
        'transform 500ms,top 500ms');
    }

  }

  handleScroll(event: Content) {
    if (!this.fabRef) {
      return;
    }
    
    if (event.scrollTop - this.storedScroll > this.threshold) {
      /* scroll hacia abajo */
        this.renderer.setElementStyle(this.fabRef, 'top', '60px');
        this.renderer.setElementStyle(this.fabRef, 'webkitTransform',
          'scale3d(.1,.1,.1)');
    } else if (event.scrollTop - this.storedScroll < 0) {
      /* scroll hacia arriba */
        this.renderer.setElementStyle(this.fabRef, 'top', '0');
        this.renderer.setElementStyle(this.fabRef, 'webkitTransform',
          'scale3d(1,1,1)');
    }

    this.storedScroll = event.scrollTop;
  }

}
