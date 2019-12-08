import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from "ionic-angular";
import 'rxjs/add/operator/map';

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
  // public modoNocturno:any;
  public fechaEvento:any;
  public idEvento:any;
  public seEjecutoAntesInicio:any;
  public seEjecutoAntesEnviarInvitacion:any;
  public seEjecutoAntesCrearEvento:any;
  public hayNotificacionSinLeer:any;

  /*
  {
    usuario: {
      ...
    },
    configuracion: {
      modoNocturno: false,
      ...
    }
  }
  */
  public preferencias:any;

  constructor(private platform: Platform, private storage: Storage) { }

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

  // public cambiarModoNocturno(estado:boolean) {
  //   this.modoNocturno = estado;
  //
  //   this.guardarStorage();
  // }

  public establecerFechaEvento(fecha) {
    this.fechaEvento = fecha;

    this.guardarStorage();
  }

  public setIdEvento(idEvento) {
    this.idEvento = idEvento;

    this.guardarStorage();
  }

  public setHayNotificacionSinLeer(hay) {
    this.hayNotificacionSinLeer = hay;

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

          // this.storage.get("modoNocturno").then( modoNocturno => {
          //   if (modoNocturno) {
          //     this.modoNocturno = modoNocturno;
          //   }
          //
          // })

          this.storage.get("fechaEvento").then( fechaEvento => {
            if (fechaEvento) {
              this.fechaEvento = fechaEvento;
            }

          })

          this.storage.get("idEvento").then( idEvento => {
            if (idEvento) {
              this.idEvento = idEvento;
            }

          })

          this.storage.get("seEjecutoAntesInicio").then( seEjecutoAntesInicio => {
            if (seEjecutoAntesInicio) {
              this.seEjecutoAntesInicio = seEjecutoAntesInicio;
            }

          })

          this.storage.get("seEjecutoAntesEnviarInvitacion").then( seEjecutoAntesEnviarInvitacion => {
            if (seEjecutoAntesEnviarInvitacion) {
              this.seEjecutoAntesEnviarInvitacion = seEjecutoAntesEnviarInvitacion;
            }

          })

          this.storage.get("seEjecutoAntesCrearEvento").then( seEjecutoAntesCrearEvento => {
            if (seEjecutoAntesCrearEvento) {
              this.seEjecutoAntesCrearEvento = seEjecutoAntesCrearEvento;
            }

          })

          this.storage.get("hayNotificacionSinLeer").then( hayNotificacionSinLeer => {
            if (hayNotificacionSinLeer) {
              this.hayNotificacionSinLeer = hayNotificacionSinLeer;
            }

          })

          this.storage.get("preferencias").then(
            preferencias => {
              if (preferencias) {
                this.preferencias = preferencias;
              }

            }
          )

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

        // if (localStorage.getItem("modoNocturno")) {
        //   this.modoNocturno = localStorage.getItem("modoNocturno");
        // }

        if (localStorage.getItem("fechaEvento")) {
          this.fechaEvento = localStorage.getItem("fechaEvento");
        }

        if (localStorage.getItem("idEvento")) {
          this.idEvento = localStorage.getItem("idEvento");
        }

        if (localStorage.getItem("seEjecutoAntesInicio")) {
          this.seEjecutoAntesInicio = localStorage.getItem("seEjecutoAntesInicio");
        }

        if (localStorage.getItem("seEjecutoAntesEnviarInvitacion")) {
          this.seEjecutoAntesEnviarInvitacion = localStorage.getItem("seEjecutoAntesEnviarInvitacion");
        }

        if (localStorage.getItem("seEjecutoAntesCrearEvento")) {
          this.seEjecutoAntesCrearEvento = localStorage.getItem("seEjecutoAntesCrearEvento");
        }

        if (localStorage.getItem("hayNotificacionSinLeer")) {
          this.hayNotificacionSinLeer = localStorage.getItem("hayNotificacionSinLeer");
        }

        if (localStorage.getItem("configuracion")) {
          this.configuracion = localStorage.getItem("configuracion");
        }

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
      this.storage.set('usuario', this.usuario);
      this.storage.set('configuracion', this.configuracion);
      // this.storage.set("modoNocturno", this.modoNocturno);
      this.storage.set("fechaEvento", this.fechaEvento);
      this.storage.set("idEvento", this.idEvento);
      this.storage.set("seEjecutoAntesInicio", this.seEjecutoAntesInicio);
      this.storage.set("seEjecutoAntesEnviarInvitacion", this.seEjecutoAntesEnviarInvitacion);
      this.storage.set("seEjecutoAntesCrearEvento", this.seEjecutoAntesCrearEvento);
      this.storage.set("hayNotificacionSinLeer", this.hayNotificacionSinLeer);
      this.storage.set("telefonoCondominio", this.telefonoCondominio);
      this.storage.set("preferencias", this.preferencias);
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

      // if (this.modoNocturno) {
      //   localStorage.setItem("modoNocturno", this.modoNocturno);
      // } else {
      //   localStorage.removeItem("modoNocturno");
      // }

      if (this.fechaEvento) {
        localStorage.setItem("fechaEvento", this.fechaEvento);
      } else {
        localStorage.removeItem("fechaEvento");
      }

      if (this.idEvento) {
        localStorage.setItem("idEvento", this.idEvento);
      } else {
        localStorage.removeItem("idEvento");
      }

      if (this.seEjecutoAntesInicio) {
        localStorage.setItem("seEjecutoAntesInicio", this.seEjecutoAntesInicio);
      } else {
        localStorage.removeItem("seEjecutoAntesInicio");
      }

      if (this.seEjecutoAntesEnviarInvitacion) {
        localStorage.setItem("seEjecutoAntesEnviarInvitacion", this.seEjecutoAntesEnviarInvitacion);
      } else {
        localStorage.removeItem("seEjecutoAntesEnviarInvitacion");
      }

      if (this.seEjecutoAntesCrearEvento) {
        localStorage.setItem("seEjecutoAntesCrearEvento", this.seEjecutoAntesCrearEvento);
      } else {
        localStorage.removeItem("seEjecutoAntesCrearEvento");
      }

      if (this.hayNotificacionSinLeer) {
        localStorage.setItem("hayNotificacionSinLeer", this.hayNotificacionSinLeer);
      } else {
        localStorage.removeItem("hayNotificacionSinLeer");
      }

      if (this.telefonoCondominio) {
        localStorage.setItem("telefonoCondominio", this.telefonoCondominio);
      } else {
        localStorage.removeItem("telefonoCondominio");
      }

      if (this.preferencias) {
        localStorage.setItem("preferencias", this.preferencias);
      } else {
        localStorage.removeItem("preferencias");
      }
    } /* fin del else */

  }

  public cerrarSesion():void {
    this.usuario = null;
    this.configuracion = null;
    // this.modoNocturno = null;
    this.telefonoCondominio = null;
    this.fechaEvento = null;
    this.seEjecutoAntesInicio = null;
    this.seEjecutoAntesEnviarInvitacion = null;
    this.seEjecutoAntesCrearEvento = null;
    this.hayNotificacionSinLeer = null;
    this.idEvento = null;

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

  public getFechaEvento() {
    return this.fechaEvento;
  }

  public getModoSeguro():boolean {
    if (!this.configuracion) {
      return false
    } else {
      return this.getConfiguracionDeJson().modoseguro
    }
  }

  // public getModoNocturno():boolean {
  //   if (!this.modoNocturno) {
  //     return false;
  //   } else {
  //     return this.modoNocturno;
  //   }
  // }

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

  public getseEjecutoAntesInicio() {
    if (!this.seEjecutoAntesInicio) {
      return false;
    } else {
      return this.seEjecutoAntesInicio;
    }
  }

  public setseEjecutoAntesInicio(primeraVez) {
    this.seEjecutoAntesInicio = primeraVez;

    this.guardarStorage();
  }

  public getSeEjecutoAntesEnviarInvitacion() {
    if (!this.seEjecutoAntesEnviarInvitacion) {
      return false;
    } else {
      return this.seEjecutoAntesEnviarInvitacion;
    }
  }

  public setSeEjecutoAntesEnviarInvitacion(primeraVez) {
    this.seEjecutoAntesEnviarInvitacion = primeraVez;

    this.guardarStorage();
  }

  public getSeEjecutoAntesCrearEvento() {
    if (!this.seEjecutoAntesCrearEvento) {
      return false;
    } else {
      return this.seEjecutoAntesCrearEvento;
    }
  }

  public setSeEjecutoAntesCrearEvento(primeraVez) {
    this.seEjecutoAntesCrearEvento = primeraVez;

    this.guardarStorage();
  }

  public getHayNotificacionSinLeer() {
    if (!this.hayNotificacionSinLeer) {
      return false;
    } else {
      return this.hayNotificacionSinLeer;
    }
  }

  private getDatosDeJson() {
    return JSON.parse(this.usuario);
  }

  private getConfiguracionDeJson() {
    return JSON.parse(this.configuracion);
  }

  // REFACTORIZACION

  // public setUsuario(usuario) {
  //   this.cargarStorage().then(
  //     () => {
  //       if (this.preferencias) {
  //         let preferencias = JSON.parse(this.preferencias);
  //
  //         preferencias.usuario = usuario;
  //
  //         this.preferencias = JSON.stringify(preferencias);
  //         this.guardarStorage();
  //       } else {
  //         let objUsuario = {
  //           usuario: usuario
  //         }
  //
  //         this.preferencias = JSON.stringify(objUsuario)
  //         this.guardarStorage()
  //       }
  //     }
  //   );
  // }

  // public getUsuario2() {
  //   let preferencias = this.getPreferenciasDeJson();
  //
  //   if (preferencias && preferencias.usuario) {
  //     return preferencias.usuario;
  //   }
  //
  //   return undefined;
  // }

  public setModoNocturno(valor:boolean) {
    let modoNocturno = {
      "modoNocturno": valor
    }

    this.agregarConfiguracion(modoNocturno);
  }

  public getModoNocturno2():boolean {
    return false;
    // let configuracion = this.getPreferenciasDeJson().configuracion;
    //
    // return configuracion && configuracion.modoNocturno;
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

  /**
  * borra cualquier configuración realizada a nivel de aplicación
  */
  public cerrarSesion2():void {
    this.preferencias = null;
    this.guardarStorage();
  }

  public activo2():boolean {
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

}
