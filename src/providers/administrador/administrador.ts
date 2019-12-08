import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Platform } from "ionic-angular";
import { URL } from '../../config/url.servicios';

@Injectable()
export class AdministradorProvider {

  // username:string;
  /**
  sgte formato: id, codigo, nombre, correo, fkrol, nombre_rol,
  fkcondominio, nombre_condominio, privilegios
  */
  // datos:string;
  // configuracionCondominio:string;
  // sesionAnulada:any;

  /*
  {
    "usuario": {
      "id":
      "codigo":
      "nombre":
      "correo":
      "token":
      "fkrol":
      "nombre_rol":
      "fkcondominio":
      "nombre_condominio":
      "privilegios": {
        "0":{
          "id":
          "boton":
          "estado":
          "fkuser":
        },
        ...
      }
    },
    "parametrosCondominio": {
      "celular": "0",
      "ci": "NO",
      "correo": "...",
      "fkcondominio": 0,
      "permanencia": "0",
      "placa": "NO",
      "telefono": "0"
    },
    "configuracion": {
      "modoNocturno": false,
      "viviendasComoLista": false,
      "sesionAnulada": false
    }
  }
  */
  public preferencias:any;

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
  * (returns) el usuario con el sgte formato:
  "0": {
    "codigo": "...",
    "correo": "...",
    "fkcondominio": 0,
    "fkrol": 0,
    "id": 0,
    "nombre": "...",
    "nombre_condominio": "...",
    "nombre_rol": "...",
    "privilegios": {
      "0": {
        "boton": "...",
        "estado": false,
        "fkuser": 0,
        "id": 0
      },
      ...
    },
    "token": "..."
  }
  */
  public login(username, password) {
    let link = URL + "/api/v1/login_usuario_mobile";
    let objStr = `{
      "username": "${username}",
      "password": "${password}"
    }`;

    return this.http.post(link, objStr);
  }


  // public iniciarSesion(datos) {
  //   /* los privilegios están en este formato [0: {}, 1: {}... n:{}]
  //      y los necesito así [{}, {}, {}]*/
  //   let privilegios = [];
  //
  //   for (let i in datos.privilegios) {
  //     let privilegio = datos.privilegios[i];
  //     privilegios.push(privilegio);
  //   }
  //
  //   datos.privilegios = privilegios;
  //
  //   this.datos = JSON.stringify(datos);
  //   this.guardarStorage();
  // }

  // public setConfiguracionCondominio(configuracion) {
  //   this.configuracionCondominio = JSON.stringify(configuracion);
  //   this.guardarStorage();
  // }

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

  /**
  * Actualiza el token del usuario
  */
  public actualizarToken(id, codigo, token){
    let link = URL + "/api/v1/update_token_usuario";

    let objStr = `{
      "idusuario": ${id},
      "codigo": "${codigo}",
      "token": "${token}"
    }`;

    return this.http.post(link, objStr);
  }

  /**
  *
  * (returns) los parametros del condominio con el sgte formato:
  "0": {
    "celular": "0",
    "ci": "NO",
    "correo": "...",
    "fkcondominio": 0,
    "permanencia": "0",
    "placa": "NO",
    "telefono": "0"
  }
  */
  public obtenerParametrosCondominio(idCondominio, idUsuario, codigo) {
    let link = URL + "/api/v1/obtener_parametros_condominio";

    let objStr = `{
      "idcondominio": ${idCondominio},
      "codigo": "${codigo}",
      "idusuario": ${idUsuario}
    }`;

    // console.log(JSON.stringify(objStr));

    return this.http.post(link, objStr);
  }

  public cargarStorage() {
    let promesa = new Promise( (resolve, reject) => {

      if (this.platform.is("cordova")) { // dispositivo

        this.storage.ready().then( () => {
          // this.storage.get("username").then( username => {
          //   if (username) {
          //     this.username = username;
          //   }
          //
          // }) // end of the storage.get username

          // this.storage.get("configuracionCondominio").then( config => {
          //   if (config) {
          //     this.configuracionCondominio = config;
          //   }
          //
          // }) /* fin del storage.get configuracionCondominio*/

          // this.storage.get("sesionAnulada").then( sesionAnulada => {
          //   if (sesionAnulada) {
          //     this.sesionAnulada = sesionAnulada;
          //   }
          //
          // }) /* fin del storage.get configuracionCondominio*/

          this.storage.get("preferencias").then(
            preferencias => {
              if (preferencias) {
                this.preferencias = preferencias;
              }

              resolve();
            }
          )

          // this.storage.get("datos").then( datos => {
          //   if (datos) {
          //     this.datos = datos;
          //   }
          //
          //
          // }) // end of the storage.get user

        }) // end of the storage.ready

      } else { // computadora
        // if (localStorage.getItem("username")) {
        //   this.username = localStorage.getItem("username");
        // }

        // if (localStorage.getItem("configuracionCondominio")) {
        //   this.configuracionCondominio = localStorage.getItem("configuracionCondominio");
        // }

        // if (localStorage.getItem("sesionAnulada")) {
        //   this.sesionAnulada = localStorage.getItem("sesionAnulada");
        // }

        // if (localStorage.getItem("datos")) {
        //   this.datos = localStorage.getItem("datos");
        // }

        if (localStorage.getItem("preferencias")) {
          this.preferencias = localStorage.getItem("preferencias");
        }

        resolve();
      }

    }); // end of the promise

    return promesa;
  }

  private guardarStorage():void {
    // del dispositivo movil
    if (this.platform.is("cordova")) {
      // this.storage.set("username", this.username);
      // this.storage.set("configuracionCondominio", this.configuracionCondominio);
      // this.storage.set("sesionAnulada", this.sesionAnulada);
      // this.storage.set("datos", this.datos);
      this.storage.set("preferencias", this.preferencias);
    } else { // computadora
      // if (this.username) {
      //   // localStorage.setItem('username', this.datos);
      // } else {
      //   localStorage.removeItem('username');
      // }

      // if (this.configuracionCondominio) {
      //   localStorage.setItem("configuracionCondominio", this.configuracionCondominio);
      // } else {
      //   localStorage.removeItem("configuracionCondominio");
      // }

      // if (this.sesionAnulada) {
      //   localStorage.setItem('sesionAnulada', this.sesionAnulada);
      // } else {
      //   localStorage.removeItem('sesionAnulada');
      // }

      // if (this.datos) {
      //   localStorage.setItem('datos', this.datos);
      // } else {
      //   localStorage.removeItem('datos');
      // }

      if (this.preferencias) {
        localStorage.setItem("preferencias", this.preferencias);
      } else {
        localStorage.removeItem("preferencias");
      }
    }
  }

  public cerrarSesion():void {
    // this.username = null;
    // this.configuracionCondominio = null;
    // this.datos = null;
    // this.sesionAnulada = null;
    this.preferencias = null;

    this.guardarStorage();
  }

  // public activo():boolean {
  //   let sesionActiva = this.datos != null;
  //   return sesionActiva;
  // }

  // public getId() {
  //   return this.getDatosDeJson().id;
  // }
  //
  // public getCodigo() {
  //   return this.getDatosDeJson().codigo;
  // }

  // public getConfiguracionCondominio() {
  //   return JSON.parse(this.configuracionCondominio);
  // }

  // public getNombre() {
  //   let nombre = this.getDatosDeJson().nombre;
  //   return nombre;
  // }
  //
  // public getNombreCondominio() {
  //   let nombre = this.getDatosDeJson().nombre_condominio;
  //   return nombre;
  // }

  // public getSesionAnulada() {
  //   if (!this.sesionAnulada) {
  //     return false;
  //   } else {
  //     return this.sesionAnulada;
  //   }
  // }

  // public setSesionAnulada(sesionAnulada) {
  //   this.sesionAnulada = sesionAnulada;
  //   this.guardarStorage();
  // }

  // private getDatosDeJson() {
  //   // return JSON.parse(this.datos);
  //   return JSON.parse('{"id": 225, "codigo": "6DCCZYF5", "nombre": "Prueba 5", "nombre_condominio": "Prueba 5", "fk_condominio": 85}');
  // }

  // REFACTORIZACION

  public setUsuario(datos) {
    /* los privilegios están en este formato [0: {}, ..., n:{}]
       y los necesito así [{}, {}, {}]*/
    let privilegios = [];

    for (let i in datos.privilegios) {
      let privilegio = datos.privilegios[i];
      privilegios.push(privilegio);
    }

    datos.privilegios = privilegios;

    // this.datos = JSON.stringify(datos);
    // this.guardarStorage();

    this.cargarStorage().then(
      () => {
        if (this.preferencias) {
          let preferencias = JSON.parse(this.preferencias);

          preferencias.usuario = datos;

          this.preferencias = JSON.stringify(preferencias);
        } else {
          let objUsuario = {
            usuario: datos
          }

          this.preferencias = JSON.stringify(objUsuario);
        }

        this.guardarStorage();
      }
    );
  }

  public getUsuario() {
    let preferencias = this.getPreferenciasDeJson();

    if (preferencias && preferencias.usuario) {
      return preferencias.usuario;
    }

    return undefined;
  }

  public getRol() {
    let preferencias = this.getPreferenciasDeJson();

    if (preferencias && preferencias.usuario) {
      let rol = preferencias.usuario;
      return { fkrol: rol.fkrol, nombre_rol: rol.nombre_rol };
    }

    return undefined;
  }

  public getCondominio() {
    let preferencias = this.getPreferenciasDeJson();

    if (preferencias && preferencias.usuario) {
      let condominio = preferencias.usuario;
      return { fkcondominio: condominio.fkcondominio, nombre_condominio: condominio.nombre_condominio };
    }

    return undefined;
  }

  public getPrivilegios() {
    let preferencias = this.getPreferenciasDeJson();

    if (preferencias && preferencias.usuario) {
      return preferencias.usuario.privilegios;
    }

    return undefined;
  }

  public setParametrosCondominio(datos) {
    this.cargarStorage().then(
      () => {
        if (this.preferencias) {
          let preferencias = JSON.parse(this.preferencias);

          preferencias.parametrosCondominio = datos;

          this.preferencias = JSON.stringify(preferencias);
        } else {
          let objParametrosCondominio = {
            parametrosCondominio: datos
          }

          this.preferencias = JSON.stringify(objParametrosCondominio);
        }

        this.guardarStorage();
      }
    );
  }

  public getParametrosCondominio() {
    let preferencias = this.getPreferenciasDeJson();

    if (preferencias && preferencias.parametrosCondominio) {
      return preferencias.parametrosCondominio;
    }

    return undefined;
  }

  public setViviendasComoLista(valor:boolean) {
    let configuracion = {
      viviendasComoLista: valor
    }

    this.agregarConfiguracion(configuracion);
  }

  public isViviendasComoLista():boolean {
    let configuracion = this.getPreferenciasDeJson().configuracion;

    return configuracion && configuracion.viviendasComoLista;
  }

  public setModoNocturno(valor:boolean) {
    let configuracion = {
      modoNocturno: valor
    }

    this.agregarConfiguracion(configuracion);
  }

  public isModoNocturno():boolean {
    let configuracion = this.getPreferenciasDeJson().configuracion;

    return configuracion && configuracion.modoNocturno;
  }

  public setSesionAnulada(valor:boolean) {
    let configuracion = {
      sesionAnulada: valor
    }

    this.agregarConfiguracion(configuracion);
  }

  public isSesionAnulada():boolean {
    let configuracion = this.getPreferenciasDeJson().configuracion;

    return configuracion && configuracion.sesionAnulada;
  }

  private agregarConfiguracion(item) {
    this.cargarStorage().then(
      () => {
        if (this.preferencias) {
          let preferencias = JSON.parse(this.preferencias);

          if (preferencias.configuracion) {
            let configuracion = preferencias.configuracion;

            for (let clave in item) {
              configuracion[clave] = item[clave];
              break;
            }
          } else {
            preferencias.configuracion = item;
          }

          this.preferencias = JSON.stringify(preferencias);
          this.guardarStorage()
        } else {
          let objConfiguracion = {
            configuracion: item
          }

          this.preferencias = JSON.stringify(objConfiguracion)
          this.guardarStorage()
        }
      }
    );
  }

  public activo():boolean {
    let preferencias = this.getPreferenciasDeJson();

    if (!preferencias) return false;

    return preferencias.usuario != null;
  }

  private getPreferenciasDeJson() {
    if (!this.preferencias) {
      return undefined;
    }

    return JSON.parse(this.preferencias);
  }

  public getIdCondominio() {
    return this.getCondominio().fkcondominio;
    // return this.getDatosDeJson().fkcondominio;
  }

  setToken(token) {
    this.cargarStorage().then(
      () => {
        let preferencias = JSON.parse(this.preferencias);
        // console.log("antes de almacenar el token");
        // console.log(JSON.stringify(this.preferencias));
        preferencias.usuario.token = token;

        this.preferencias = JSON.stringify(preferencias);
        // console.log("despues de almacenar el token");
        // console.log(JSON.stringify(this.preferencias));

        this.guardarStorage();
      }
    );
    // let datos = this.getDatosDeJson();
    // datos.token = token;
    //
    // this.datos = JSON.stringify(datos);
    // this.guardarStorage();
  }

    public getId() {
      let id = this.getUsuario().id;
      return id;
      // return this.getDatosDeJson().id;
    }

    public getCodigo() {
      let codigo = this.getUsuario().codigo;
      return codigo;
      // return this.getDatosDeJson().codigo;
    }

    // public getConfiguracionCondominio() {
    //   return JSON.parse(this.configuracionCondominio);
    // }

    public getNombre() {
      let nombre = this.getUsuario().nombre;
      return nombre;
      // let nombre = this.getDatosDeJson().nombre;
      // return nombre;
    }

    public getNombreCondominio() {
      let nombre = this.getCondominio().nombre_condominio;
      return nombre;
      // let nombre = this.getDatosDeJson().nombre_condominio;
      // return nombre;
    }

}
