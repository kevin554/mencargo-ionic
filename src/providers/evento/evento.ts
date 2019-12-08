import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { URL } from '../../config/url.servicios';

@Injectable()
export class EventoProvider {

  constructor(public http: Http) { }

  // PARA OBTENER UNO EN ESPECIFICO, SIN INVITADOS
  /**
  * selecciona una invitacion (en base a su id)
  *
  * (returns) la invitacion con el sgte formato: id, vivienda, familia,
  * invitado_nombre, invitado_ci, invitado_celular,marca, fecha_invitacion,
  * color, placa, hora_ingreso, hora_salida, observacion
  */
  public obtenerEvento(idEvento, idFamiliar, codigo) {
    let link = URL + "/api/v1/obtener_evento";

    let objStr = `{
      "idevento": ${idEvento},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  // LO USO PARA REGISTRAR INGRESO
  /**
  * id, vivienda, familia, invitado_id, invitado_nombre, invitado_ci, invitado_celular,
  * fecha_invitacion, cantidad, tiempo, placa, hora_ingreso, hora_salida,
  * observacion
  */
  public obtenerEventoUsuario(idEvento, idFamiliar, codigo) {
    let link = URL + "/api/v1/obtener_evento_usuario";

    let objStr = `{
      "idevento": ${idEvento},
      "idusuario": ${idFamiliar},
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
    let link = URL + "/api/v1/insert_evento";

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
  public actualizar(idEvento, nombre, descripcion, fecha, idFamiliar, codigo) {
    let link = URL + "/api/v1/update_evento";

    let objStr = `{
      "idevento": ${idEvento},
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
  public eliminar(idEvento, idFamiliar, codigo) {
    let link = URL + "/api/v1/delete_evento";

    let objStr = `{
      "idevento": ${idEvento},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}",
      "enabled": false
    }`

    return this.http.post(link, objStr);
  }

  /**
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id del invitado (idvisita)
  */
  public listaEventoFamiliar(idFamiliar, codigo) {
    let link = URL + "/api/v1/listar_evento_familiar";

    let objStr = `{
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id del invitado (idvisita)
  */
  public getEventoFamiliarUsuario(idFamiliar, idUsuario, codigo) {
    let link = URL + "/api/v1/listar_evento_familiar_usuario";

    let objStr = `{
      "idfamiliar": ${idFamiliar},
      "idusuario": ${idUsuario},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }


  public listarEventoViviendaUsuario(idVivienda, idUsuario, codigo) {
    let link = URL + "/api/v1/listar_evento_vivienda_usuario";

    let objStr = `{
      "idvivienda": ${idVivienda},
      "idusuario": ${idUsuario},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * registra la fecha y hora de salida al condominio (de una invitacion)
  */
  public listarEventoCondominioUsuario(idCondominio, idUsuario, codigo) {
    let link = URL + "/api/v1/listar_evento_condominio_usuario";

    let objStr = `{
      "idcondominio": ${idCondominio},
      "idusuario": ${idUsuario},
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
  public insertInvitadoEvento(idInvitado, idEvento, observacion, fecha, idFamiliar, codigo) {
    let link = URL + "/api/v1/insert_invitado_evento";

    let objStr = `{
      "fkinvitado": "${idInvitado}",
      "fkevento": "${idEvento}",
      "observacion": "${observacion}",
      "fecha": "${fecha}",
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
  public insertInvitadosEvento(idEvento, observacion, fecha, idFamiliar,
      codigo, ...idsInvitados) {
    idsInvitados = idsInvitados[0];

    let link = URL + "/api/v1/insert_invitados_evento";

    let objStr = `{
      "fkevento": "${idEvento}",
      "observacion": "${observacion}",
      "fecha": "${fecha}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}",
      "adicionadopor": "Familiar",
      "fechaadicion": "${fecha}",
    `;

    let primerInvitado = true;

    objStr += `"invitados": [`;

    for (let indice in idsInvitados) {
      let id = idsInvitados[indice];

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

  /**
  * inserta una invitacion
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id de la invitacion (idevento)
  */
  public deleteInvitadoEvento(idInvitadoEvento, idFamiliar, codigo) {
    let link = URL + "/api/v1/delete_invitado_evento";

    let objStr = `{
      "id": ${idInvitadoEvento},
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
  public registrarSalidaInvitadoEvento(idMovimientoEvento, idUsuario, codigo) {
    let link = URL + "/api/v1/registrar_salida_invitado_evento";

    let objStr = `{
      "id": ${idMovimientoEvento},
      "idusuario": ${idUsuario},
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
  public registrarIngresoInvitadoEvento(idMovimientoEvento, idUsuario, codigo) {
    let link = URL + "/api/v1/registrar_ingreso_invitado_evento";

    let objStr = `{
      "id": ${idMovimientoEvento},
      "idusuario": ${idUsuario},
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
  public validarIngresoInvitadoEvento(idEventoMovimiento, idUsuario, codigo) {
    let link = URL + "/api/v1/validar_ingreso_invitado_evento";

    let objStr = `{
      "id": ${idEventoMovimiento},
      "idusuario": ${idUsuario},
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
  public actualizarPlacaMovimientoEvento(idEventoMovimiento, placa, idUsuario,
      codigo) {
    let link = URL + "/api/v1/actualizar_placa_movimiento_evento";

    let objStr = `{
      "id": ${idEventoMovimiento},
      "placa": "${placa}",
      "idusuario": ${idUsuario},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * finaliza un evento
  */
  public finalizarEvento(idEvento, idFamiliar, codigo) {
    let link = URL + "/api/v1/finalizar_evento";

    let objStr = `{
      "idevento": ${idEvento},
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`

    return this.http.post(link, objStr);
  }

}
