import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class InvitadoDao {

  public database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;

  constructor(private platform: Platform, private sqlite: SQLite) {
    if (platform.is("cordova")) {
      this.databaseReady = new BehaviorSubject(false);

      this.platform.ready().then( () => {
        this.sqlite.create({
          name: 'qsm.db',
          location: 'default'
        }).then( (db: SQLiteObject) => {
          this.database = db;

          let sentencia = `
            create table if not exists invitados(
              id integer primary key,
              nombre text,
              apellido text,
              ci integer,
              expedicion text,
              celular integer,
              fkfamilia integer,
              fkcondominio integer
            )`;
          this.database.executeSql(sentencia, {})
              .then( () => {
                this.databaseReady.next(true)
              }).catch();

        });
      });
    }// fin if cordova
  }

  insertar(invitado) {
    let sentencia = `
      insert or replace into invitados (id, nombre, apellido, ci, expedicion, celular,
          fkfamilia, fkcondominio)
          values (?, ?, ?, ?, ?, ?, ?, ?)`;
    let parametros = [invitado.id, invitado.nombre, invitado.apellido, invitado.ci,
      invitado.expedicion, invitado.celular, invitado.fkfamilia, invitado.fkcondominio];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      return err;
    })
  }

  seleccionarTodas() {
    return this.database.executeSql(`select * from invitados`, []).then( (datos) => {
      let invitados = [];

      if (datos.rows.length > 0) {
        for (var i = 0; i < datos.rows.length; i++) {
          let invitado = datos.rows.item(i);

          invitados.push({
            id: invitado.id,
            nombre: invitado.nombre,
            apellido: invitado.apellido,
            ci: invitado.ci,
            expedicion: invitado.expedicion,
            celular: invitado.celular,
            fkfamilia: invitado.fkfamilia,
            fkcondominio: invitado.fkcondominio
          })
        }

      }

      return invitados;
    }, err => {
      return [];
    })
  }

  eliminar(id) {
    let sentencia = `
      delete from invitados where id = ?`;
    let parametros = [id];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      return err;
    })
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

}
