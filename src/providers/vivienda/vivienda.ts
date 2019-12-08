import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { URL } from '../../config/url.servicios';

@Injectable()
export class ViviendaProvider {

  /**
  las peticiones devuelven una respuesta con el sgte formato:
  {
    success: false,
    response: {},
    message: ''
  }
  en donde success indica si la peticion se realizó con exito
  response contiene el objeto en formato json
  y message un mensaje respecto al estado de la peticion
  */
  constructor(public http: Http) { }

  /**
  * selecciona una vivienda (mediante su id)
  *
  * (returns) la vivienda con el sgte formato: id, codifcacion, familia,
  * direccion, telefono, numero, fkcondominio
  */
  public seleccionar(id) {
    let link = URL + "/api/v1/get_vivienda";

    let objStr = `{
      "idvivienda": ${id}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * selecciona todas las viviendas de un condominio (en base a su id)
  *
  * (returns) una lista con las viviendas de un condominio con el sgte formato:
  * id, codificacion, familia, direccion, telefono, numero
  */
  public seleccionarTodasPorIdCondominio(idCondominio, idUsuario, codigo) {
    let link = URL + "/api/v1/get_viviendas";

    let objStr = `{
      "idcondominio": ${idCondominio},
      "codigo": "${codigo}",
      "idusuario": ${idUsuario}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza una vivienda
  * el formato de 'fechamodificacion' debe ser DD/MM/YYYY HH:mm:ss
  */
  public actualizar(id, familia, direccion, telefono, codificacion, numero,
      idCondominio, fechaModificacion, modificadoPor) {
    let link = URL + "/api/v1/update_vivienda";

    let objStr = `{
      "id": ${id},
      "familia": "${familia}",
      "direccion": "${direccion}",
      "telefono": ${telefono},
      "codificacion": "${codificacion}",
      "numero": ${numero},
      "fechamodificacion": "${fechaModificacion}",
      "fkcondominio": ${idCondominio},
      "modificadopor": "${modificadoPor}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * devuelve los parametros de un condominio
  *
  * (returns) los datos para contactarse con la administracion del condominio
  * con el sgte formato: 0: {correo, telefono, celular, fkcondominio}
  */
  public obtenerParametrosCondominio(idCondominio) {
    let link = URL + "/api/v1/obtener_parametros_codominio";

    let objStr = `{
      "idcondominio": ${idCondominio}
    }`;

    return this.http.post(link, objStr);
  }

}
