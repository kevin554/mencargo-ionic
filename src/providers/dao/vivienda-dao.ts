import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';

// PARA TENER DE MANERA OFFLINE LAS VIVIENDAS
@Injectable()
export class ViviendaDao {

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
            create table if not exists viviendas(
              id integer primary key,
              familia text,
              direccion text,
              telefono integer,
              codificacion text,
              numero integer
            )`;
          this.database.executeSql(sentencia, {})
              .then( () => {
                this.databaseReady.next(true)
              }).catch();

        });
      });
    }// fin if cordova
  }

  public insertar(vivienda) {
    let sentencia = `
      insert or replace into viviendas (id, familia, direccion, telefono,
          codificacion, numero)
        values (?, ?, ?, ?, ?, ?)`;
    let parametros = [vivienda.id, vivienda.familia, vivienda.direccion,
      vivienda.telefono, vivienda.codificacion, vivienda.numero];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      return err;
    })
  }

  public seleccionarTodas() {
    return this.database.executeSql(`select * from viviendas`, []).then( (datos) => {
      let viviendas = [];

      if (datos.rows.length > 0) {
        for (var i = 0; i < datos.rows.length; i++) {
          let vivienda = datos.rows.item(i);

          viviendas.push({
            id: vivienda.id,
            familia: vivienda.familia,
            direccion: vivienda.direccion,
            telefono: vivienda.telefono,
            codificacion: vivienda.codificacion,
            numero: vivienda.numero
          })
        }

      }

      return viviendas;
    }, err => {
      return [];
    })
  }

  public getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  public eliminarTodas() {
    if (!this.platform.is("cordova")) {
      return;
    }

    this.database.executeSql("delete from viviendas", []);
  }

  eliminarTabla() {
    this.database.executeSql("drop table viviendas", {});
  }

}
