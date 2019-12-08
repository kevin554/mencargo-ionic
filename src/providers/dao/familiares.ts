import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';

// PARA TENER OFFLINE LOS FAMILIARES
@Injectable()
export class FamiliaresProvider {

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
          create table if not exists familiaresoffline(
            id integer primary key,
            nombre text,
            apellido text,
            genero text,
            ci integer,
            celular integer,
            telefono integer,
            correo text,
            fkvivienda integer
          )`;
        this.database.executeSql(sentencia, {})
            .then( () => {
              this.databaseReady.next(true)
            }).catch();

      });
    });
  }

  public insertar(familiar) {
    let sentencia = `
      insert or replace into familiaresoffline (
          id,
          nombre,
          apellido,
          genero,
          ci,
          celular,
          telefono,
          correo,
          fkvivienda
        ) values (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )`;
    let parametros = [
      familiar.id,
      familiar.nombre,
      familiar.apellido,
      familiar.genero,
      familiar.ci,
      familiar.celular,
      familiar.telefono,
      familiar.correo,
      familiar.fkvivienda
    ];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      return err;
    });
  }

  public seleccionarTodos() {
    return this.database.executeSql(`select * from familiaresoffline`, []).then( (datos) => {
      let familiares = [];

      if (datos.rows.length > 0) {
        for (var i = 0; i < datos.rows.length; i++) {
          let familiar = datos.rows.item(i);

          familiares.push({
            id: familiar.id,
            nombre: familiar.nombre,
            apellido: familiar.apellido,
            genero: familiar.genero,
            ci: familiar.ci,
            celular: familiar.celular,
            telefono: familiar.telefono,
            correo: familiar.correo,
            fkvivienda: familiar.fkvivienda
          });
        }

      }

      return familiares;
    }, err => {
      return [];
    });
  }

  public seleccionarTodosDeVivienda(fkvivienda) {
    let consulta = "select * from familiaresoffline where fkvivienda = ?";
    let parametros = [fkvivienda];

    return this.database.executeSql(consulta, parametros).then( (datos) => {
      let familiares = [];

      if (datos.rows.length > 0) {
        for (var i = 0; i < datos.rows.length; i++) {
          let familiar = datos.rows.item(i);

          familiares.push({
            id: familiar.id,
            nombre: familiar.nombre,
            apellido: familiar.apellido,
            genero: familiar.genero,
            ci: familiar.ci,
            celular: familiar.celular,
            telefono: familiar.telefono,
            correo: familiar.correo,
            fkvivienda: familiar.fkvivienda
          });
        }

      }

      return familiares;
    }, err => {
      return [];
    });
  }

  public eliminar(id) {
    let sentencia = `
      delete
      from familiaresoffline
      where id = ?`;
    let parametros = [id];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      console.log("datos: " + JSON.stringify(datos));
      return datos;
    }, err => {
      console.log("err: " + JSON.stringify(err));
      return err;
    });
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

}
