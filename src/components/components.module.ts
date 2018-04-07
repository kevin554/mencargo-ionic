import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

// los componentes
import { EmptyStateComponent } from './empty-state/empty-state';
import { CambiarTemaComponent } from './cambiar-tema/cambiar-tema';
import { CabeceraAmpliableComponent } from './cabecera-ampliable/cabecera-ampliable';
import { CentrarComponenteComponent } from './centrar-componente/centrar-componente';

@NgModule({
	declarations: [
		EmptyStateComponent,
    CambiarTemaComponent,
    CabeceraAmpliableComponent,
    CentrarComponenteComponent
	],
	imports: [
    IonicModule
	],
	exports: [
		EmptyStateComponent,
    CambiarTemaComponent,
    CabeceraAmpliableComponent,
    CentrarComponenteComponent
	]
})
export class ComponentsModule {}
