export class Utiles {

  /**
  * La fecha actual en formato YYYY-MM-DD
  */
  static getFechaNormal() {
    let fecha = new Date();

    let fechaFormateada = fecha.getFullYear() + '-' +
      this.twoDigits(fecha.getMonth() + 1) + '-' +
      this.twoDigits(fecha.getDate());

    return fechaFormateada;
  }

  /**
  * Devuelve la fecha en formato YYYY-MM--DD
  */
  static getFechaFormateada(fechaStr) {
    let fecha = new Date(fechaStr);

    // al convertir fechaStr a fecha, se le disminuye 1 dia

    let fechaFormateada = this.twoDigits(fecha.getDate() + 1) + '/' +
      this.twoDigits(fecha.getMonth() + 1) + '/' +
      fecha.getFullYear() + ' 00:00:00';

    return fechaFormateada;
  }

  static getFechaActual():string {
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

  static twoDigits(d):string {
    if (0 <= d && d < 10)
        return "0" + d.toString();

    return d.toString();
  }

}
