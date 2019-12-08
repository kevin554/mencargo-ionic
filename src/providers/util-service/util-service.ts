import { Injectable } from '@angular/core';
import { AlertController, Toast, ToastController, ToastOptions } from 'ionic-angular';

@Injectable()
export class UtilServiceProvider {

  private mToast:Toast;

  constructor(public alertCtrl: AlertController, public toastCtrl: ToastController) { }

  public soloPrimeraMayuscula(texto:string) {
    texto = texto.toLowerCase(); /* todo a minusculas */
    /* concateno la primera en mayusculas y el resto del texto*/
    texto = texto.charAt(0).toUpperCase() + texto.substring(1, texto.length);

    return texto;
  }

  /**
  *
  */
  public ordenar(lista:any[], columna, tipoOrdenamiento?):any[] {
    return lista.sort(this.comparadorDinamico(columna, tipoOrdenamiento));
  }

  public ordenarPorId(lista:any[], columna, tipoOrdenamiento?):any[] {
    return lista.sort(this.comparadorDinamicoIds(columna, tipoOrdenamiento));
  }

  private comparadorDinamico(nombreColumna, tipoOrdenamiento) {
    /* 1 ascendente, -1 descendente */
    if (!tipoOrdenamiento) {
      tipoOrdenamiento = 1;
    }

    return function(a, b) {
      if (a[nombreColumna].toLowerCase() < b[nombreColumna].toLowerCase())
        return -1 * tipoOrdenamiento;

      if (a[nombreColumna].toLowerCase() > b[nombreColumna].toLowerCase())
        return 1 * tipoOrdenamiento;

      return 0;
    }
  }

  private comparadorDinamicoIds(nombreColumna, tipoOrdenamiento) {
    /* 1 ascendente, -1 descendente */
    if (!tipoOrdenamiento) {
      tipoOrdenamiento = 1;
    }

    return function(a, b) {
      if (a[nombreColumna] < b[nombreColumna])
        return -1 * tipoOrdenamiento;

      if (a[nombreColumna] > b[nombreColumna])
        return 1 * tipoOrdenamiento;

      return 0;
    }
  }

  public ordenarPorMultiplesCampos(lista:any[], primerAtrubuto,
      segundoAtributo) {
    lista.sort(this.comparadorCamposMultiples(primerAtrubuto,
      segundoAtributo));
  }

  comparadorCamposMultiples(primerAtrubuto, segundoAtributo) {
    return function (a, b) {
      if (a[primerAtrubuto].toLowerCase() < b[primerAtrubuto].toLowerCase())
        return -1;

      if (a[primerAtrubuto].toLowerCase() > b[primerAtrubuto].toLowerCase())
        return 1;

      if (a[segundoAtributo].toLowerCase() < b[segundoAtributo].toLowerCase())
        return -1;

      if (a[segundoAtributo].toLowerCase() > b[segundoAtributo].toLowerCase())
        return 1;

      return 0;
    }
  }

  public toast(mensaje: string, duracion?: number) {
    /* si habia un toast (sin duración definida) mostrandose, lo cierro */
    if (this.mToast && !this.mToast.data.duration) {
      this.mToast.dismiss();
    }

    let opciones:ToastOptions = { };

    opciones.message = mensaje;
    opciones.showCloseButton = true;
    opciones.closeButtonText = "cerrar";
    if (duracion) opciones.duration = duracion;

    this.mToast = this.toastCtrl.create(opciones);

    this.mToast.present();
  }

  public toastSuperior(mensaje: string, duracion?: number) {
    /* si habia un toast (sin duración definida) mostrandose, lo cierro */
    if (this.mToast && !this.mToast.data.duration) {
      this.mToast.dismiss();
    }

    let opciones:ToastOptions = { };

    opciones.message = mensaje;
    opciones.showCloseButton = true;
    opciones.closeButtonText = "cerrar";
    opciones.position = "top";
    if (duracion) opciones.duration = duracion;

    this.mToast = this.toastCtrl.create(opciones);

    this.mToast.present();
  }

  /**
  * devuelve la fecha en el sgte formato: DD/MM/YYYY HH:MM:SS
  */
  public getFechaActual():string {
    let fecha = new Date();

    // 19/01/2017 14:03:57
    let fechaFormateada = this.twoDigits(fecha.getDate()).toString() + '/' +
        this.twoDigits((fecha.getMonth() + 1).toString()) + '/' +
        fecha.getFullYear().toString() + ' ' +
        this.twoDigits(fecha.getHours()) + ':' +
        this.twoDigits(fecha.getMinutes()) + ':' +
        this.twoDigits(fecha.getSeconds());

    return fechaFormateada;
  }

  /**
  * La fecha actual en formato YYYY-MM-DD
  */
  public getFechaNormal() {
    let fecha = new Date();

    let fechaFormateada = fecha.getFullYear() + '-' +
      this.twoDigits(fecha.getMonth() + 1) + '-' +
      this.twoDigits(fecha.getDate());

    return fechaFormateada;
  }

  /**
  * La fecha actual en formato YYYY-MM-DD HH:MM:SS
  */
  public getFechaHoraNormal() {
    let fecha = new Date();

    let fechaFormateada = fecha.getFullYear() + '-' +
      this.twoDigits(fecha.getMonth() + 1) + '-' +
      this.twoDigits(fecha.getDate()) + ' ' +
      this.twoDigits(fecha.getHours()) + ':' +
      this.twoDigits(fecha.getMinutes()) + ':' +
      this.twoDigits(fecha.getSeconds());

    return fechaFormateada;
  }

  /**
  * Devuelve la fecha en formato DD/MM/YYYY HH:MM:SS
  */
  getFechaFormateada(fechaStr) {
    let fecha = new Date(fechaStr);

    // al convertir fechaStr a fecha, se le disminuye 1 dia

    let fechaFormateada = this.twoDigits(fecha.getDate() + 1) + '/' +
      this.twoDigits(fecha.getMonth() + 1) + '/' +
      fecha.getFullYear() + ' 00:00:00';

    return fechaFormateada;
  }

  twoDigits(d):string {
    if (0 <= d && d < 10)
        return "0" + d.toString();

    return d.toString();
  }

  public alert(titulo: string, mensaje: string) {
    let alert = this.alertCtrl.create({
      title: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'ok'
        }
      ]
    });

    alert.present();
  }

  public obtenerDia(dia) {
    switch (dia) {
      case 0:
        return "domingo";

      case 1:
        return "lunes";

      case 2:
        return "martes";

      case 3:
        return "miercoles";

      case 4:
        return "jueves";

      case 5:
        return "viernes";

      case 6:
        return "sábado";
    }
  }

  public obtenerMes(numeroMes) {
    switch (numeroMes) {
      case 1:
        return "enero";

      case 2:
        return "febrero";

      case 3:
        return "marzo";

      case 4:
        return "abril";

      case 5:
        return "mayo";

      case 6:
        return "junio";

      case 7:
        return "julio";

      case 8:
        return "agosto";

      case 9:
        return "septiembre";

      case 10:
        return "octubre";

      case 11:
        return "noviembre";

      case 12:
        return "diciembre";
    }
  }

}
