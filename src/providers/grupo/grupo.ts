import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { URL } from '../../config/url.servicios';

@Injectable()
export class GrupoProvider {

  constructor(public http: Http) { }

  // PARA OBTENER UNO EN ESPECIFICO
  /**
  * selecciona una invitacion (en base a su id)
  *
  * (returns) la invitacion con el sgte formato: id, vivienda, familia,
  * invitado_nombre, invitado_ci, invitado_celular,marca, fecha_invitacion,
  * color, placa, hora_ingreso, hora_salida, observacion
  */
  public obtenerGrupo(idGrupo, idFamiliar, codigo) {
    let link = URL + "/api/v1/obtener_grupo";

    let objStr = `{
      "idgrupo": ${idGrupo},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * inserta una invitacion
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id de la invitacion (idevento)
  */
  public insertar(nombre, descripcion, fecha, idCondominio, idFamiliar, codigo) {
    let link = URL + "/api/v1/insert_grupo";

    let objStr = `{
      "nombre": "${nombre}",
      "descripcion": "${descripcion}",
      "fecha": "${fecha}",
      "fkcondoominio": ${idCondominio},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza una invitacion
  * el formato de 'fecha' y 'fechamodificacion' debe ser DD/MM/YYYY HH:MM:SS
  */
  public actualizar(idGrupo, nombre, descripcion, fecha, idFamiliar, codigo) {
    let link = URL + "/api/v1/update_grupo";

    let objStr = `{
      "idgrupo": ${idGrupo},
      "nombre": "${nombre}",
      "descripcion": "${descripcion}",
      "fecha": "${fecha}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}",
      "correo": ""
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * elimina (de manera logica) una invitacion
  */
  public eliminar(idGrupo, idFamiliar, codigo) {
    let link = URL + "/api/v1/delete_grupo";

    let objStr = `{
      "idgrupo": ${idGrupo},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`

    return this.http.post(link, objStr);
  }

  /**
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id del invitado (idvisita)
  */
  public listarGrupoFamiliar(idFamiliar, codigo) {
    let link = URL + "/api/v1/listar_grupo_familiar";

    let objStr = `{
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  public insertInvitadoGrupo(idGrupo, idInvitado, observacion, fecha,
      idFamiliar, codigo) {
    let link = URL + "/api/v1/insert_invitado_grupo";

    let objStr = `{
      "fkgrupo": ${idGrupo},
      "fkinvitado": ${idInvitado},
      "observacion": "${observacion}",
      "fecha": "${fecha}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  public insertInvitadosGrupo(idGrupo, observacion, fecha, idFamiliar,
                              codigo, ...idsIntegrantes) {
    idsIntegrantes = idsIntegrantes[0];

    let link = URL + "/api/v1/insert_invitados_grupo";

    let objStr = `{
      "observacion": "${observacion}",
      "fecha": "${fecha}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}",
      "fkgrupo": ${idGrupo},
    `;

    let primerInvitado = true;

    objStr += `"integrantes": [`;

    for (let indice in idsIntegrantes) {
      let id = idsIntegrantes[indice];

      if (!primerInvitado) {
        objStr += ", "
      }

      objStr += `{
        "fkinvitado": ${id}
      }`;

      primerInvitado = false;
    }

    objStr += "]"; /* fin de los invitados */

    objStr += "}"; /* fin de todo */

    return this.http.post(link, objStr);
  }

  public deleteInvitadoGrupo(idGrupo, idFamiliar, codigo) {
    let link = URL + "/api/v1/delete_invitado_grupo";

    let objStr = `{
      "id": ${idGrupo},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

}
