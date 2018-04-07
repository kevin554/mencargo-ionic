/**
CLASES DINAMICAS (EN HTML)
[class.stripedblue]="esImpar" [class.stripedbeige]="esPar"
[ngClass]="{'stripedblue': esImpar, 'stripedbeige': esPar}"

ICONO DINAMICO (EN HTML)
<ion-icon name="add" *ngIf="!isGroupShown('configuracion')"></ion-icon>
<ion-icon name="remove" *ngIf="isGroupShown('configuracion')"></ion-icon>
<ion-icon [name]="isGroupShown('configuracion') ? 'remove' : 'add'">

NAVIGATION CONTROLER (EN HTML)
[navPush]=" "
[navParams]="{ ' ':  }"
navPop

CLASES PREDETERMINADAS (EN HTML)
<ion-grid>
  <ion-row text-center></ion-row>
</ion-grid>
<button icon-left icon-only ion-item></button>
<ion-icon icon-right name=" "></ion-icon>
<p margin-left margin-horizontal></p>

FORMULARIOS (EN HTML)
<form [formGroup]=" ">
  <ion-item>
    <ion-label> </ion-label>
    <ion-input formControlName=" "
      [class.invalid]="! .controls. .valid &&
      ( .controls. .dirty || intentoIngresar)">
    </ion-input>
  </ion-item>
  <ion-item *ngIf="! .controls. .valid &&
      ! .controls. .pending &&
      ( .controls. .dirty || intentoIngresar)">
    <p>Debe ingresar </p>
  </ion-item>
</form>

FORMULARIOS (EN CSS)
para quitar el borde inferior que viene por defecto en un campo de texto
.item-md.item-block .item-inner {
  border-bottom: none;
}
.invalid {
  border: 1px solid #ea6153;
}

FORMULARIOS (EN TS)
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
 :FormGroup;
intentoIngresar:boolean;
public formBuilder: FormBuilder
this.  = formBuilder.group({
   : ['', Validators.compose([Validators.required]) ]
});
if (!this.formularioInicioSesion.valid) {
} else {
}
this. .controls[' '].markAsDirty();
let var = this. .value. .trim();
this.formularioVivienda.get('codificacion').setValue(datos.codificaion);

COMBO (EN HTML)
<ion-item>
  <ion-label> </ion-label>
  <ion-select [(ngModel)]=" ">
    <ion-option *ngFor=" " [value]=" ">{{  }}</ion-option>
  </ion-select>
</ion-item>

MENU ACORDEON (EN HTML)
<ion-list>
  <!-- ITEM  -->
  <ion-item class="elemento" (click)="toogleGroup(' ')">
    <ion-icon name="add" *ngIf="!isGroupShown(' ')"></ion-icon>
    <ion-icon name="remove" *ngIf="isGroupShown(' ')"></ion-icon>
  </ion-item>
  <!-- SUB-ITEMS -->
  <ion-item class="sub-elemento" *ngIf="isGroupShown(' ')">
    <span class="tabulacion"></span>
  </ion-item>
</ion-list>

MENU ACORDEON (EN CSS)
.elemento {
  background-color: #448dfd; // azul claro
  margin: 2px 0;
}
.sub-elemento {
  background-color: #f9c701 // amarillo
}
.tabulacion {
  margin-left: 18px;
}

MENU ACORDEON (EN TS)
shownGroup:any = null;
toogleGroup(group:string) {
  if ( this.isGroupShown(group) )
    this.shownGroup = null;
   else
    this.shownGroup = group;
}
isGroupShown(group):boolean {
  return this.shownGroup === group;
}

FUNCIONES UTILES
private twoDigits(d):string {
  if (0 <= d && d < 10)
      return "0" + d.toString();
  return d.toString();
}
fechaActual():string {
  let fecha = new Date();
  // 19/01/2017 14:03:57
  let fechaFormateada = fecha.getDate().toString() + '/' +
      (fecha.getMonth() + 1).toString() + '/' +
      fecha.getFullYear().toString() + ' ' +
      this.twoDigits(fecha.getHours()) + ':' +
      this.twoDigits(fecha.getMinutes()) + ':' +
      this.twoDigits(fecha.getSeconds());
  return fechaFormateada;
}

HOJAS DE ESTILOS
.stripedblue {
  color: #007FFF;
  background-color: #DBE9F4;
}
.stripedbeige {
  color: #CC0000;
  background-color: #F5F5DC;
}
.centrar {
  display: block;
  margin: 0 auto;
}

PROVIDERS
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
private URL:string = "http://localhost:8080/ / ";
constructor(public http: Http) {
}
get() {
  let data = new URLSearchParams();
  let link = this.URL + "?accion= ";
  return this.http.post(link, data);
}

COLORES
androidPrimary: #3F51B5,
androidPrimaryDark: #303F9F,
androidAccent: #FF4081,
celeste:       #32b5e5,
celesteOscuro: #1e6d89,
verde: #99cc00,
verdeOscuro: #5c7a00,
naranja: #ffbb30,
naranjaOscuro: #996e1c,
rojo: #ff4444,
rojoOscuro: #992929,
violeta: #aa66cc,
violetaOscuro: #653d7a,
rosado: #e91e63,
fondoRegistrarPaciente: #f5f5f5,
fondoConverter: #eeeeee,
barraSeparadora: #C8C9CB

 */
