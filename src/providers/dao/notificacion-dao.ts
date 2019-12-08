import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class NotificacionDao {

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
            create table if not exists notificaciones(
              id integer primary key,
              titulo text,
              mensaje text,
              fkfamilia integer,
              fkcondominio integer,
              fecha text,
              lectura text
            )`;
          this.database.executeSql(sentencia, {})
              .then( () => {
                this.databaseReady.next(true)
              }).catch();

        });
      });
    }// fin if cordova
  }

  insertar(notificacion) {
    let sentencia = `
      insert into notificaciones (id, titulo, mensaje, fkfamilia, fkcondominio,
          fecha, lectura)
        values (?, ?, ?, ?, ?, ?, ?)`;
    sentencia = `
      insert or replace into notificaciones (id, titulo, mensaje, fkfamilia,
          fkcondominio, fecha, lectura)
        values (?, ?, ?, ?, ?, ?, ?)`;
    let parametros = [notificacion.id, notificacion.titulo, notificacion.mensaje,
      notificacion.fkfamilia, notificacion.fkcondominio, notificacion.fecha,
      notificacion.lectura];

    return this.database.executeSql(sentencia, parametros).then( datos => {
      return datos;
    }, err => {
      return err;
    })
  }

  seleccionarTodas() {
    return this.database.executeSql(`select * from notificaciones`, []).then( (datos) => {
      let notificaciones = [];

      if (datos.rows.length > 0) {
        for (var i = 0; i < datos.rows.length; i++) {
          let notificacion = datos.rows.item(i);

          notificaciones.push({
            id: notificacion.id,
            titulo: notificacion.titulo,
            mensaje: notificacion.mensaje,
            fkfamilia: notificacion.fkfamilia,
            fkcondominio: notificacion.fkcondominio,
            fecha: notificacion.fecha,
            lectura: notificacion.lectura
          })
        }

      }

      return notificaciones;
    }, err => {
      return [];
    })
  }

  eliminar(id) {
    let sentencia = `
      delete from notificaciones where id = ?`;
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
