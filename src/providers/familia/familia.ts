import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { URL } from '../../config/url.servicios';

@Injectable()
export class FamiliaProvider {

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
  * selecciona un familiar (mediante su id)
  *
  * (returns) un familiar con el sgte formato: id, nombre, celular, correo,
  * genero, expedicion, telefono, ci, token, fkvivienda, codigo, condominio
  */
  public seleccionar(id) {
    let link = URL + "/api/v1/get_familiar";
    let objStr = `{
      "idfamiliar": ${id}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * selecciona a todos los familiares de una vivienda (en base a su id)
  *
  * (returns) una lista con los familiares de una vivienda, con el sgte formato:
  * id, nombre, telefono, celular, correo, ci, genero, expedicion, token,
  * fkvivienda
  */
  public seleccionarPorIdVivienda(idVivienda, idUsuario, codigo) {
    let link = URL + "/api/v1/get_familiares_vivienda";

    let objStr = `{
      "idvivienda": ${idVivienda},
      "codigo": "${codigo}",
      "idusuario": ${idUsuario}
    }`;

    return this.http.post(link, objStr);
  }


  public loginPropietario(username, password) {
    let link = URL + "/api/v1/login_familiar";
    let objStr = `{
      "username": "${username}",
      "password": "${password}"
    }`;

    return this.http.post(link, objStr);
  }
  /**
  * inserta un familiar
  * el formato de 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS

  * (returns) el id del familiar (idfamiliar)
  */
  public insertar(nombre, apellido, telefono, celular, ci, correo, genero, idVivienda,
      expedicion, adicionadoPor, fechaAdicion, usuario, adicional) {
    let link = URL + "/api/v1/insert_familiar";

    let objStr = `{
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "telefono": ${telefono},
      "celular": ${celular},
      "ci": ${ci},
      "correo": "${correo}",
      "genero": "${genero}",
      "fkvivienda": ${idVivienda},
      "expedicion": "${expedicion}",
      "adicionadopor": "${adicionadoPor}",
      "fechaadicion": "${fechaAdicion}",
      "usuario": "${usuario}",
      "adicional": ${adicional}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza un familiar
  * el formato de 'fechamodificacion' debe ser DD/MM/YYYY HH:mm:ss
  */
  public actualizar(id, nombre, apellido, telefono, celular, ci, correo, genero, idVivienda,
      expedicion, modificadoPor, fechaModificacion) {
    let link = URL + "/api/v1/update_familiar";

    let objStr = `{
      "id": ${id},
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "telefono": ${telefono},
      "celular": ${celular},
      "ci": ${ci},
      "correo": "${correo}",
      "genero": "${genero}",
      "fkvivienda": ${idVivienda},
      "expedicion": "${expedicion}",
      "modificadopor": "${modificadoPor}",
      "fechamodificacion": "${fechaModificacion}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza el token de un familiar
  */
  public actualizarToken(id, codigo, token) {
    let link = URL + "/api/v1/update_token_familiar";

    let objStr = `{
      "idfamiliar": ${id},
      "codigo": "${codigo}",
      "token": "${token}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * elimina (de manera logica) un familiar
  */
  public eliminar(id) {
    let link = URL + "/api/v1/delete_familiar";

    let objStr = `{
      "idfamiliar": ${id},
      "enabled": false
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * id, titulo, mensaje, fkfamilia, familia_nombre, familia_ci,
  * fecha_notificacion, fecha_lectura, condominio
  */
  public obtenerNotificaciones(idFamiliar, codigo) {
    let link = URL + "/api/v1/notificaciones_familiar";

    let objStr = `{
      "codigo": "${codigo}",
      "idfamiliar": ${idFamiliar}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  *
  */
  public leerNotificacion(idNotificacion, idFamiliar, codigo) {
    let link = URL + "/api/v1/lectura_notificacion_familiar";

    let objStr = `{
      "id": ${idNotificacion},
      "codigo": "${codigo}",
      "idfamiliar": ${idFamiliar}
    }`;

    return this.http.post(link, objStr);
  }

  public eliminarNotificacion(idNotificacion, idFamiliar, codigo) {
    let link = URL + "/api/v1/delete_notificacion_familiar";

    let objStr = `{
      "id": ${idNotificacion},
      "codigo": "${codigo}",
      "idfamiliar": ${idFamiliar}
    }`;

    return this.http.post(link, objStr);
  }

  notificarVisitaSinLlegada(idFamliar, codigo, idMovimiento, idCondominio) {
    let link = URL + "/api/v1/enviar_notificacion_guardias";

    let objStr = `{
      "idfamiliar": ${idFamliar},
      "codigo": "${codigo}",
      "idmovimiento": ${idMovimiento},
      "idcondominio": ${idCondominio}
    }`;

    return this.http.post(link, objStr);
  }

  obtenerParametrosCondominio(idFamliar, codigo, idCondominio) {
    let link = URL + "/api/v1/obtener_parametros_condominio_familiar";

    let objStr = `{
      "idfamiliar": ${idFamliar},
      "codigo": "${codigo}",
      "idcondominio": ${idCondominio}
    }`;

    return this.http.post(link, objStr);
  }

}
