import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
// import { Sql } from './sql';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
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
          console.log('creando tablas viviendas');
          let sentencia = `
            create table if not exists viviendas(
              id integer primary key,
              familia text,
              direccion text,
              telefono integer,
              codificacion text,
              numero integer,
              idCondominio integer
            )`;
          this.database.executeSql(sentencia, {})
              .then( () => {
                this.databaseReady.next(true)
              }).catch();

          console.log('viviendas creadas')
        });
      });
    }// fin if cordova
  }

  insertar(vivienda, idConcominio) {
    let sentencia = `
      insert into viviendas (id, familia, direccion, telefono, codificacion,
          numero, idCondominio)
        values (?, ?, ?, ?, ?, ?, ?)`;
    let parametros = [vivienda.id, vivienda.familia, vivienda.direccion,
      vivienda.telefono, vivienda.codificacion, vivienda.numero, idConcominio];
    console.log('parametros' + JSON.stringify(parametros))

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      console.log('Error: ', err);
      return err;
    })
  }

  actualizar() {

  }

  eliminar() {

  }

  seleccionar(id) {

  }

  seleccionarTodas() {
    return this.database.executeSql(`select * from viviendas`, []).then( (datos) => {
      console.log('select fro mviviendas')
      let viviendas = [];

      if (datos.rows.length > 0) {
        console.log('hay viviendas en local');
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

      console.log('devuelve las viviendas');
      return viviendas;
    }, err => {
      console.log('Error: '+  JSON.stringify(err));
      return [];
    })
  }

  getDatabaseState() {
      return this.databaseReady.asObservable();
    }
}
