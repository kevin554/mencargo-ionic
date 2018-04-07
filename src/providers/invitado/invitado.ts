import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { URL } from '../../config/url.servicios';
import { UtilServiceProvider } from '../util-service/util-service'

@Injectable()
export class InvitadoProvider {

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
  constructor(public http: Http, private util: UtilServiceProvider) { }

  /**
  * selecciona un invitado mediante su id
  *
  * (returns) el invitado con los sgtes atributos: id, nombre, ci, expedicion,
  * celular, fkfamilia, fkcondominio
  */
  public seleccionar(id) {
    let link = URL + "/api/v1/get_invitado";

    let objStr = `{
      "idinvitado": ${id}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * inserta una visita
  * el formato de 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id de la visita (idvisita)
  */
  public insertar(nombre, apellido, ci, expedicion, celular, idFamiliar,
      adicionadoPor, fechaAdicion, codigo) {
    let link = URL + "/api/v1/insert_invitado";

    let objStr = `{
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "ci": ${ci},
      "expedicion": "${expedicion}",
      "celular": ${celular},
      "fkfamilia": ${idFamiliar},
      "adicionadopor": "${adicionadoPor}",
      "fechaadicion": "${fechaAdicion}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza un invitado
  * el formato de 'fechamodificacion' debe ser DD/MM/YYYY HH:MM:SS
  */
  public actualizar(id, nombre, apellido, ci, expedicion, celular, idFamiliar,
      modificadoPor, fechaModificacion, codigo) {
    let link = URL + "/api/v1/update_invitado";

    let objStr = `{
      "id": ${id},
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "ci": ${ci},
      "expedicion": "${expedicion}",
      "celular": ${celular},
      "fkfamilia": ${idFamiliar},
      "modificadopor": "${modificadoPor}",
      "fechamodificacion": "${fechaModificacion}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza un invitado
  * el formato de 'fechamodificacion' debe ser DD/MM/YYYY HH:MM:SS
  */
  public actualizarDesdeAdministracion(id, nombre, apellido, ci, expedicion, celular, idFamiliar,
      modificadoPor, fechaModificacion, idUsuario, codigo) {
    let link = URL + "/api/v1/update_invitado_administracion";

    let objStr = `{
      "id": ${id},
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "ci": ${ci},
      "expedicion": "${expedicion}",
      "celular": ${celular},
      "fkfamilia": ${idFamiliar},
      "modificadopor": "${modificadoPor}",
      "fechamodificacion": "${fechaModificacion}",
      "idusuario": ${idUsuario},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * elimina (de manera logica) una visita
  */
  public eliminar(id, idFamiliar, codigo) {
    let link = URL + "/api/v1/delete_invitado";

    let objStr = `{
      "id": ${id},
      "enabled": false,
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * selecciona los amigos de un familiar
  *
  * (returns) la lista de amigos de un familiar con el sgte formato: id, nombre,
  * ci, expedicion, celular, fkfamilia, nombre_familia, fkcondominio
  */
  public seleccionarAmigos(idFamiliar, codigo) {
    let link = URL + "/api/v1/get_invitados_familiar";

    let objStr = `{
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * selecciona los amigos de un familiar
  *
  * (returns) la lista de amigos de un familiar con el sgte formato: id, nombre,
  * ci, expedicion, celular, fkfamilia, nombre_familia, fkcondominio
  */
  public seleccionarAmigosDesdeAdministracion(idFamiliar, idUsuario, codigo) {
    let link = URL + "/api/v1/get_invitados_familiar_administracion";

    let objStr = `{
      "idfamiliar": ${idFamiliar},
      "idusuario": ${idUsuario},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * Inserta amigos de forma masiva
  * los amigos deben tener el sgte formato: id, nombre, ci, celular, fkfamilia,
  * adicionadopor, fechaadicion
  *
  * el formato de 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  */
  public insertarAmigos(...amigos:any[]) {
    amigos = amigos[0];

    let link = URL + "/api/v1/insert_invitados";
    let fechaAdicion = this.util.getFechaActual();

    let objStr = `[`;

    let primero = true;
    for (let amigo of amigos) {
      if (!primero) {
        objStr += `, `;
      }

      objStr += `{
        "id": ${amigo.id},
        "nombre": "${amigo.nombre}",
        "ci": ${amigo.ci},
        "celular": ${amigo.celular},
        "fkfamilia": ${amigo.fkfamilia},
        "adicionadopor": "",
        "fechaadicion": "${fechaAdicion}"
      }`

      primero = false;
    }

    objStr += `]`;

    return this.http.post(link, objStr);
  }

}
