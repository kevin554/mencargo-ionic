import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textoMinuscula',
})
export class TextoMinusculaPipe implements PipeTransform {

  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    return value.toLowerCase();
  }
}
