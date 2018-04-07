import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { URL } from '../../config/url.servicios';

/*
ESTADOS PARA LAS INVITACIONES

0 --> Anulado
1 --> Habilitado
2 --> Ingreso
3 --> Salida
*/

@Injectable()
export class MovimientoProvider {

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
  * selecciona una invitacion (en base a su id)
  *
  * (returns) la invitacion con el sgte formato: id, vivienda, familia,
  * invitado_nombre, invitado_ci, invitado_celular,marca, fecha_invitacion,
  * color, placa, hora_ingreso, hora_salida, observacion
  */
  public seleccionar(id) {
    let link = URL + "/api/v1/get_invitacion";

    let objStr = `{
      "idinvitacion": ${id}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * id, vivienda, familia, invitado_id, invitado_nombre, invitado_ci, invitado_celular,
  * fecha_invitacion, cantidad, tiempo, placa, hora_ingreso, hora_salida,
  * observacion
  */
  public seleccionarHistorialInvitado(idInvitado) {
    let link = URL + "/api/v1/get_historial_invitado";

    let objStr = `{
      "idinvitado": ${idInvitado}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * inserta una invitacion
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id de la invitacion (idmovimiento)
  */
  public insertar(idFamiliar, idInvitado, marca, color, placa, cantidad, tiempo,
      fecha, observacion, adicionadoPor, fechaAdicion) {
    let link = URL + "/api/v1/insert_invitacion";

    let objStr = `{
      "fkfamilia": ${idFamiliar},
      "fkinvitado": ${idInvitado},
      "marca": "${marca}",
      "color": "${color}",
      "placa": "${placa}",
      "cantidad": ${cantidad},
      "tiempo": "${tiempo}",
      "fecha": "${fecha}",
      "observacion": "${observacion}",
      "adicionadopor": "${adicionadoPor}",
      "fechaadicion": "${fechaAdicion}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * actualiza una invitacion
  * el formato de 'fecha' y 'fechamodificacion' debe ser DD/MM/YYYY HH:MM:SS
  */
  public actualizar(id, idFamiliar, idInvitado, marca, color, placa, cantidad,
      tiempo, fecha, observacion, adicionadoPor, fechaModificacion) {
    let link = URL + "/api/v1/update_invitacion";

    let objStr = `{
      "id": ${id},
      "fkfamilia": ${idFamiliar},
      "fkinvitado": ${idInvitado},
      "marca": "${marca}",
      "color": "${color}",
      "placa": "${placa}",
      "cantidad": ${cantidad},
      "tiempo": "${tiempo}",
      "fecha": "${fecha}",
      "observacion": "${observacion}",
      "adicionadopor": "${adicionadoPor}",
      "fechamodificacion": "${fechaModificacion}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * elimina (de manera logica) una invitacion
  */
  public eliminar(id) {
    let link = URL + "/api/v1/delete_invitacion";

    let objStr = `{
      "id": ${id},
      "enabled": false
    }`

    return this.http.post(link, objStr);
  }

  /**
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id del invitado (idvisita)
  */
  public insertarInvitacion(nombre:string, apellido, cantidad, tiempo, fecha, ci,
      expedicion, celular, placa, idFamiliar, idInvitado, observacion:string,
      adicionadoPor, fechaAdicion, horaIngreso) {
    let link = URL + "/api/v1/insert_invitado_invitacion";

    let objStr = `{
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "cantidad": ${cantidad},
      "tiempo": "${tiempo}",
      "fecha": "${fecha}",
      "ci": ${ci},
      "expedicion": "${expedicion}",
      "celular": ${celular},
      "placa": "${placa}",
      "fkfamilia": ${idFamiliar},
      "fkinvitado": ${idInvitado},
      "observacion": "${observacion}",
      "adicionadopor": "${adicionadoPor}",
      "fechaadicion": "${fechaAdicion}",
      "ingreso": "${horaIngreso}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * el formato de 'fecha' y 'fechaadicion' debe ser DD/MM/YYYY HH:MM:SS
  *
  * (returns) el id del invitado (idvisita)
  */
  public insertarInvitacionDesdeFamiliar(nombre:string, apellido, cantidad, tiempo, fecha, ci,
      expedicion, celular, placa, idFamiliar, idInvitado, observacion:string,
      adicionadoPor, fechaAdicion, codigo) {
    let link = URL + "/api/v1/insert_invitado_invitacion_familiar";

    let objStr = `{
      "nombre": "${nombre}",
      "apellido": "${apellido}",
      "cantidad": ${cantidad},
      "tiempo": "${tiempo}",
      "fecha": "${fecha}",
      "ci": ${ci},
      "expedicion": "${expedicion}",
      "celular": ${celular},
      "placa": "${placa}",
      "fkfamilia": ${idFamiliar},
      "fkinvitado": ${idInvitado},
      "observacion": "${observacion}",
      "adicionadopor": "${adicionadoPor}",
      "fechaadicion": "${fechaAdicion}",
      "idfamiliar": ${idFamiliar},
      "codigo": "${codigo}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * registra la fecha y hora de ingreso al condominio (de una invitacion)
  * si la invitacion es valida, devuelve un objeto con el sgte formato:
  invitacion: {
    id: 0, [de la invitacion/movimiento]
    vivienda: '', [la codificacion]
    familia: '', [el nombre del familiar]
    invitado_nombre: '',
    fkinvitado: 0,
    fkfamilia: 0,
    invitado_ci: 0,
    invitado_celular: 0,
    marca: '', [ya no existe este campo en la bd, por lo tanto estará vacío]
    fecha_invitacion: '', [en formato ]
    color: '', [ya no existe este campo en la bd, por lo tanto estará vacío]
    placa: '',
    hora_ingreso: '',
    hora_salida: '',
    observacion: ''
  }

  * las posibles respuestas en caso de fallo son:
    - La Invitacion No es Valida o Ya fue utilizada
    - La Invitacion ya Caduco era para la fecha [d-m-Y]
    - La Invitacion es para Otra Fecha Adelante es para [d-m-Y]
    - La Invitacion ya fue Utilizada por [nombre invitado]
  */
  public registrarIngreso(idInvitacion) {
    let link = URL + "/api/v1/insert_ingreso_invitado";

    let objStr = `{
      "id": ${idInvitacion}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * registra la fecha y hora de salida al condominio (de una invitacion)
  */
  public registrarSalida(idInvitacion) {
    let link = URL + "/api/v1/insert_salida_invitado";

    let objStr = `{
      "id": ${idInvitacion}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * selecciona todas las invitaciones/visitas que tiene un condominio (en base
  * a su id) (se puede filtrar en una determinada fecha, o en un intervalo de
  * fechas)
  * el formato de 'fechaInicio' y 'fechaFin' debe ser YYYY-MM-DD
  *
  * (returns) una lista con todas las invitaciones/visitas con el sgte formato:
  * id, vivienda, familia, invitado_nombre, invitado_ci, invitado_celular, marca,
  * fecha_invitacion, color, placa, hora_ingreso, hora_salida, observacion
  */
  public getInvitadosDeCondominio(id, fechaInicio?, fechaFin?) {
    if (!fechaInicio && !fechaFin) {
      return this.getInvitadosDeCondominioPorId(id);
    } else if (fechaInicio && !fechaFin) {
      return this.getInvitadosDeCondominoPorFecha(id, fechaInicio);
    } else if (fechaInicio && fechaFin) {
      return this.getInvitadosDeCondominioPorIntervalo(id, fechaInicio, fechaFin);
    }
  }

  private getInvitadosDeCondominioPorId(id) {
    let link = URL + "/api/v1/listar_invitaciones";

    let objStr = `{
      "idcondominio": ${id}
    }`;

    return this.http.post(link, objStr);
  }

  private getInvitadosDeCondominoPorFecha(id, fecha) {
    let link = URL + "/api/v1/listar_invitaciones_fecha";

    let objStr = `{
      "idcondominio": ${id},
      "fecha": "${fecha}"
    }`;

    return this.http.post(link, objStr);
  }

  private getInvitadosDeCondominioPorIntervalo(id, fechaInicio, fechaFin) {
    let link = URL + "/api/v1/listar_invitaciones_intervalo";

    let objStr = `{
      "idcondominio": ${id},
      "fecha_inicial": "${fechaInicio}",
      "fecha_final": "${fechaFin}"
    }`;

    return this.http.post(link, objStr);
  }

  /*
  listar_invitaciones_fecha
  id=v.id, vivienda=v.familia.vivienda.codificacion, familia=v.familia.nombre,
  invitado_nombre=v.invitado.nombre,
  invitado_ci=v.invitado.ci, invitado_celular=v.invitado.celular,
  tiempo=v.tiempo, fecha_invitacion=str(v.fecha),
  cantidad=v.cantidad, placa=v.placa, hora_ingreso=str(v.ingreso),
  hora_salida=str(v.salida), observacion=v.observacion

  el filtro puede ser:
  -vivienda
  -familiar
  -nombre_invitado
  si no fecha_inicial  y fecha_final estan vacias, buscas en todas las fecha
  si solo fecha_inicial contiene una fecha, buscas de esa fecha en particular
  si tanto fecha_inicial como fecha_final contienen una fecha, buscas en ese intervalo de fechas
  */
  buscarVisitas(idCondominio, busqueda) {
    let link = URL + "/api/v1/buscar_visita_invitacion";

    let objStr = `{
      "idcondominio": ${idCondominio},
      "valor": "${busqueda}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * selecciona todos los invitados de un familiar (en base a su id), se puede
  * filtrar de una fecha en concreto
  * el formato de la fecha debe ser: YYYY-MM-DD
  *
  * (returns) una lista con los invitados de un familiar con los sgtes atributos:
  * id, vivienda, familia, invitado_nombre, invitado_ci, invitado_celular,
  * fecha_invitacion, marca, color, placa, hora_ingreso, hora_salida, observacion
  */
  public getInvitadosDeFamiliar(id, fecha?) {
    if (!fecha) {
      return this.getInvitadosDeFamiliarPorId(id);
    } else {
      return this.getInvitadosDeFamiliarPorFecha(id, fecha);
    }
  }

  private getInvitadosDeFamiliarPorId(id) {
    let link = URL + "/api/v1/listar_invitaciones_familiar";

    let objStr = `{
      "idfamilia": ${id}
    }`;

    return this.http.post(link, objStr);
  }

  private getInvitadosDeFamiliarPorFecha(id, fecha) {
    let link = URL + "/api/v1/listar_invitaciones_familiar_fecha";

    let objStr = `{
      "idfamilia": ${id},
      "fecha": "${fecha}"
    }`;

    return this.http.post(link, objStr);
  }

}
