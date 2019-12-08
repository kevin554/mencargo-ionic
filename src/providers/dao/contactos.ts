import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';

// PARA TENER OFFLINE LOS CONTACTOS
@Injectable()
export class ContactosProvider {

  public database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;

  constructor(private platform: Platform, private sqlite: SQLite) {
    if (!platform.is("cordova")) return;

    this.databaseReady = new BehaviorSubject(false);

    this.platform.ready().then( () => {
      this.sqlite.create({
        name: 'qsm.db',
        location: 'default'
      }).then( (db: SQLiteObject) => {
        this.database = db;

        let sentencia = `
          create table if not exists ingresos(
            id integer primary key,
            nombre text,
            apellido text,
            ci integer,
            placa text,
            observaciones text,
            fkfamilia integer
          )`;
        this.database.executeSql(sentencia, {})
            .then( () => {
              this.databaseReady.next(true)
            }).catch();

      });
    });
  }

  insertar(invitado) {
    let sentencia = `
      insert or replace into ingresos (id, nombre, apellido, ci, placa,
          observaciones, fkfamilia)
        values (?, ?, ?, ?, ?, ?, ?)`;
    let parametros = [invitado.id, invitado.nombre, invitado.apellido,
      invitado.ci, invitado.placa, invitado.observaciones, invitado.fkfamilia];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      return err;
    });
  }

  seleccionarTodas() {
    return this.database.executeSql(`select * from ingresos`, []).then( (datos) => {
      let invitados = [];

      if (datos.rows.length > 0) {
        for (var i = 0; i < datos.rows.length; i++) {
          let invitado = datos.rows.item(i);

          invitados.push({
            id: invitado.id,
            nombre: invitado.nombre,
            apellido: invitado.apellido,
            ci: invitado.ci,
            placa: invitado.placa,
            observaciones: invitado.observaciones,
            fkfamilia: invitado.fkfamilia
          });
        }

      }

      return invitados;
    }, err => {
      return [];
    })
  }

  eliminar(id) {
    let sentencia = `
      delete
      from ingresos
      where id in (
        select id
        from ingresos
        where id = ?
        limit 1
      )`;
    let parametros = [id];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      console.log("datos: " + JSON.stringify(datos));
      return datos;
    }, err => {
      console.log("err: " + JSON.stringify(err));
      return err;
    })
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

}
