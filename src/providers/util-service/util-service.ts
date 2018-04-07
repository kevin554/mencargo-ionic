import { Injectable } from '@angular/core';
import { AlertController, ToastController, ToastOptions } from 'ionic-angular';

@Injectable()
export class UtilServiceProvider {

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


  // private comparadorGenerico(a, b) {
  //   return a > b ? 1 : a < b ? -1 : 0;
  // }

  // public ordenarPorMultiplesCampos(lista:any[], primeraColumna, segundaColumna) {
  //   /*
  //   basicamente hago esto:
  //     comp(a, b) {
  //       return a > b ? 1 : b > a ? -1 : 0;
  //     }
  //
  //     sort( (a, b) => {
  //       return comp([comp(a.X, b.X), comp(a.Y, b.Y)], [comp(b.X, a.X), comp(b.Y, a.Y)]);
  //     })
  //   */
  //   lista.sort( (a, b) => {
  //     return this.comparadorGenerico(
  //       [this.comparadorGenerico(a[primeraColumna].toLowerCase(), b[primeraColumna].toLowerCase()),
  //         this.comparadorGenerico(a[segundaColumna].toLowerCase(), b[segundaColumna].toLowerCase())],
  //       [this.comparadorGenerico(b[primeraColumna].toLowerCase(), a[primeraColumna].toLowerCase()),
  //         this.comparadorGenerico(b[segundaColumna].toLowerCase(), a[segundaColumna].toLowerCase())]
  //     );
  //   });
  // }

  public toast(mensaje: string, duracion?: number) {
    let opciones:ToastOptions = { };

    opciones.message = mensaje;
    opciones.showCloseButton = true;
    opciones.closeButtonText = "cerrar";
    opciones.dismissOnPageChange = true;
    if (duracion) opciones.duration = duracion;

    let toast = this.toastCtrl.create(opciones);

    toast.present();
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
  *
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

  public presentAlertWithCallback(title: string, message: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const confirm = this.alertCtrl.create({
        title,
        message,
        buttons: [{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            confirm.dismiss().then(() => resolve(false));
            return false;
          }
        }, {
          text: 'Yes',
          handler: () => {
            confirm.dismiss().then(() => resolve(true));
            return false;
          }
        }]
      });

      return confirm.present();
    });
  }

}
