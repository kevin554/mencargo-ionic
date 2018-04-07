import { NgModule } from '@angular/core';
import { TextoMinusculaPipe } from './texto-minuscula/texto-minuscula';
@NgModule({
	declarations: [TextoMinusculaPipe],
	imports: [],
	exports: [TextoMinusculaPipe]
})
export class PipesModule {}
