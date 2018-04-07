import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from "ionic-angular";

// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
// import { BehaviorSubject } from 'rxjs/Rx';

/*
hay que armar el objeto antes de que se vuelva inmantenible
*/
@Injectable()
export class UsuarioProvider {

  /**
  * el obj usuario con el sgte formato: {id, nombre, celular, correo,
  *   expedicion, telefono, ci, token, fkvivienda}
  */
  public usuario:any;
  // por ahora el formato sería {modoseguro, password}
  public configuracion:any;
  public telefonoCondominio:any;
  public modoNocturno:any;
  // database: SQLiteObject;
  // private databaseReady: BehaviorSubject<boolean>;

  constructor(private platform: Platform, private storage: Storage,) {
      //private sqlite: SQLite) {
  }

  public ingresar(usuario) {
    let obj = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      celular: usuario.celular,
      correo: usuario.correo,
      genero: usuario.genero,
      expedicion: usuario.expedicion,
      telefono: usuario.telefono,
      ci: usuario.ci,
      token: usuario.token,
      fkvivienda: usuario.fkvivienda,
      condominio: usuario.condominio,
      codigo: usuario.codigo
    }

    this.usuario = JSON.stringify(obj);

    this.guardarStorage();
  }

  /**
  * Para habilitar/inhabilitar el modo seguro
  */
  public cambiarModoSeguro(estado:boolean, password?:string) {
    let configuracion = {
      modoseguro: estado,
      password: password ? password : ''
    }

    this.configuracion = JSON.stringify(configuracion);

    this.guardarStorage();
  }

  public cambiarModoNocturno(estado:boolean) {
    this.modoNocturno = estado;

    this.guardarStorage();
  }

  public cargarStorage() {
    let promesa = new Promise( (resolve, reject) => {

      if (this.platform.is("cordova")) { // dispositivo

        this.storage.ready().then( () => {
          this.storage.get("usuario").then( usuario => {
            if (usuario) {
              this.usuario = usuario;
            }

          }) // end of the storage.get

          this.storage.get("telefonoCondominio").then( telefono => {
            if (telefono) {
              this.telefonoCondominio = telefono;
            }

          })

          this.storage.get("modoNocturno").then( modoNocturno => {
            if (modoNocturno) {
              this.modoNocturno = modoNocturno;
            }

          })

          this.storage.get("configuracion").then( configuracion => {
            if (configuracion) {
              this.configuracion = configuracion;
            }

            resolve();
          }) // end of the storage.get

        }) // end of the storage.ready

      } else { // computadora
        if (localStorage.getItem("usuario")) {
          this.usuario = localStorage.getItem("usuario");
        }

        if (localStorage.getItem("telefonoCondominio")) {
          this.telefonoCondominio = localStorage.getItem("telefonoCondominio");
        }

        if (localStorage.getItem("modoNocturno")) {
          this.modoNocturno = localStorage.getItem("modoNocturno");
        }

        if (localStorage.getItem("configuracion")) {
          this.configuracion = localStorage.getItem("configuracion");
        }

        resolve();
      }

    }); // end of the promise

    return promesa;
  }

  private guardarStorage():void {
    // del dispositivo movil
    if (this.platform.is("cordova")) {
      this.storage.set('usuario', this.usuario);
      this.storage.set('configuracion', this.configuracion);
      this.storage.set("modoNocturno", this.modoNocturno);
      this.storage.set("telefonoCondominio", this.telefonoCondominio);
    } else { // computadora
      if (this.usuario) {
        localStorage.setItem('usuario', this.usuario);
      } else {
        localStorage.removeItem('usuario');
      }

      if (this.configuracion) {
        localStorage.setItem('configuracion', this.configuracion);
      } else {
        localStorage.removeItem('configuracion');
      }

      if (this.modoNocturno) {
        localStorage.setItem("modoNocturno", this.modoNocturno);
      } else {
        localStorage.removeItem("modoNocturno");
      }

      if (this.telefonoCondominio) {
        localStorage.setItem("telefonoCondominio", this.telefonoCondominio);
      } else {
        localStorage.removeItem("telefonoCondominio");
      }
    } /* fin del else */

  }

  public cerrarSesion():void {
    this.usuario = null;
    this.configuracion = null;
    this.modoNocturno = null;
    this.telefonoCondominio = null;

    this.guardarStorage();
  }

  public activo():boolean {
    var sesionActiva = this.usuario != null;
    return sesionActiva;
  }

  /* GETTERS Y SETTERS */

  public getId() {
    return this.getDatosDeJson().id;
  }

  public getUsuario() {
    return this.getDatosDeJson();
  }

  public getModoSeguro():boolean {
    if (!this.configuracion) {
      return false
    } else {
      return this.getConfiguracionDeJson().modoseguro
    }
  }

  public getModoNocturno():boolean {
    if (!this.modoNocturno) {
      return false;
    } else {
      return this.modoNocturno;
    }
  }

  public getPasswordModoSeguro():string {
    return this.getConfiguracionDeJson().password;
  }

  public setTelefonoCondominio(telefono) {
    this.telefonoCondominio = telefono;

    this.guardarStorage();
  }

  public getTelefonoCondominio() {
    return this.telefonoCondominio;
  }

  private getDatosDeJson() {
    return JSON.parse(this.usuario);
  }

  private getConfiguracionDeJson() {
    return JSON.parse(this.configuracion);
  }

}
