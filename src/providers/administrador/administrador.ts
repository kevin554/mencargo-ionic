import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Platform } from "ionic-angular";

import { URL } from '../../config/url.servicios';

@Injectable()
export class AdministradorProvider {

  username:string;
  /**
  sgte formato: id, codigo, nombre, correo, fkrol, nombre_rol,
  fkcondominio, nombre_condominio, privilegios
  */
  datos:string;
  configuracionCondominio:string;

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
  constructor(private platform: Platform, public http: Http,
      private storage: Storage) { }

  /**
  * Inicia sesion en el sistema
  *
  * (returns) el usuario con el sgte formato: id, codigo, nombre, correo, token, fkrol,
  * nombre_rol, fkcondominio, nombre_condominio, privilegios
  *
  * los privilegios tienen el sgte formato: id, fkuser, boton, estado
  */
  public login(username, password) {
    let link = URL + "/api/v1/login_usuario_mobile";
    let objStr = `{
      "username": "${username}",
      "password": "${password}"
    }`;

    return this.http.post(link, objStr);
  }

  public iniciarSesion(datos) {
    /* los privilegios están en este formato [0: {}, 1: {}... n:{}]
       y los necesito así [{}, {}, {}]*/
    let privilegios = [];

    for (let i in datos.privilegios) {
      let privilegio = datos.privilegios[i];
      privilegios.push(privilegio);
    }

    datos.privilegios = privilegios;

    this.datos = JSON.stringify(datos);
    this.guardarStorage();
  }

  public setConfiguracionCondominio(configuracion) {
    this.configuracionCondominio = JSON.stringify(configuracion);
    this.guardarStorage();
  }

  /**
  * devuelve los usuarios, roles y privilegios
  *
  * (returns) el usuario con el sgte formato: id, codigo, nombre, correo, fkrol,
  * nombre_rol, fkcondominio, nombre_condominio, privilegios
  *
  * los privilegios tienen el sgte formato: id, fkuser, boton, estado
  */
  public cargarUsuariosPrivilegios(idCondominio) {
    let link = URL + "/api/v1/listar_usuarios_privilegios";
    let objStr = `{
      "fkcondominio": ${idCondominio}
    }`;

    return this.http.post(link, objStr);
  }

  /**
  * Actualiza el estado (habilitado/deshabilitado) del privilegio
  */
  public actualizarPrivilegio(idUsuario, codigo, idPrivilegio, estado) {
    let link = URL + "/api/v1/update_movil_privilegio";
    let objStr = `{
      "idusuario": ${idUsuario},
      "codigo": "${codigo}",
      "id": ${idPrivilegio},
      "estado": ${estado}
    }`;

    return this.http.post(link, objStr);
  }

  actualiazarToken(id, codigo, token){
    let link = URL + "/api/v1/update_token_usuario";

    let objStr = `{
      "idusuario": ${id},
      "codigo": "${codigo}",
      "token": "${token}"
    }`;

    return this.http.post(link, objStr);
  }

  obtenerParametrosCondominio(idCondominio) {
    let link = URL + "/api/v1/obtener_parametros_condominio";

    let objStr = `{
      "idcondominio": ${idCondominio}
    }`;

    return this.http.post(link, objStr);
  }

  public cargarStorage() {
    let promesa = new Promise( (resolve, reject) => {

      if (this.platform.is("cordova")) { // dispositivo

        this.storage.ready().then( () => {
          this.storage.get("username").then( username => {
            if (username) {
              this.username = username;
            }

          }) // end of the storage.get username

          this.storage.get("configuracionCondominio").then( config => {
            if (config) {
              this.configuracionCondominio = config;
            }

          }) /* fin del storage.get configuracionCondominio*/

          this.storage.get("datos").then( datos => {
            if (datos) {
              this.datos = datos;
            }

            resolve();
          }) // end of the storage.get user

        }) // end of the storage.ready

      } else { // computadora
        if (localStorage.getItem("username")) {
          this.username = localStorage.getItem("username");
        }

        if (localStorage.getItem("configuracionCondominio")) {
          this.configuracionCondominio = localStorage.getItem("configuracionCondominio");
        }

        if (localStorage.getItem("datos")) {
          this.datos = localStorage.getItem("datos");
        }

        resolve();
      }

    }); // end of the promise

    return promesa;
  }

  private guardarStorage():void {
    // del dispositivo movil
    if (this.platform.is("cordova")) {
      this.storage.set("username", this.username);
      this.storage.set("configuracionCondominio", this.configuracionCondominio);
      this.storage.set("datos", this.datos);
    } else { // computadora
      if (this.username) {
        localStorage.setItem('username', this.datos);
      } else {
        localStorage.removeItem('username');
      }

      if (this.configuracionCondominio) {
        localStorage.setItem("configuracionCondominio", this.configuracionCondominio);
      } else {
        localStorage.removeItem("configuracionCondominio");
      }

      if (this.datos) {
        localStorage.setItem('datos', this.datos);
      } else {
        localStorage.removeItem('datos');
      }
    }
  }

  public cerrarSesion():void {
    this.username = null;
    this.configuracionCondominio = null;
    this.datos = null;

    this.guardarStorage();
  }

  public activo():boolean {
    let sesionActiva = this.datos != null;
    return sesionActiva;
  }

  public getId() {
    return this.getDatosDeJson().id;
  }

  public getCodigo() {
    return this.getDatosDeJson().codigo;
  }

  public getConfiguracionCondominio() {
    return JSON.parse(this.configuracionCondominio);
  }

  public getNombre() {
    let nombre = this.getDatosDeJson().nombre;
    return nombre;
  }

  public getNombreCondominio() {
    let nombre = this.getDatosDeJson().nombre_condominio;
    return nombre;
  }

  public getIdCondominio() {
    return this.getDatosDeJson().fkcondominio;
  }

  private getDatosDeJson() {
    return JSON.parse(this.datos);
  }

  setToken(token) {
    let datos = this.getDatosDeJson();
    datos.token = token;

    this.datos = JSON.stringify(datos);
    this.guardarStorage();
  }

}
