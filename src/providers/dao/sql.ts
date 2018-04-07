import { Injectable } from '@angular/core';
// import { Platform } from 'ionic-angular';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class Sql {

  private _dbPromise: Promise<any>;
  public database: SQLiteObject;

  constructor( public sqlite: SQLite) {
    // this._dbPromise = new Promise((resolve, reject) => {
    //   if (platform.is("cordova")) {
    //     this.platform.ready().then( () => {
    //       this.sqlite.create({
    //         name: 'qsm.db',
    //         location: 'default'
    //       }).then( (db: SQLiteObject) => {
    //         this.database = db;
    //         console.log('creando tablas viviendas');
    //         let sentencia = `
    //           create table if not exists viviendas(
    //             id integer primary key,
    //             familia text,
    //             direccion text,
    //             telefono integer,
    //             codificacion text,
    //             numero integer,
    //             idCondominio integer
    //           )`;
    //         this.database.executeSql(sentencia, {});
    //
    //         console.log('viviendas creadas')
    //         // console.log('creando tablas familiares');
    //         // sentencia = `
    //         //   create table if not exists familiares(
    //         //     id integer primary key,
    //         //     nombre text,
    //         //     telefono integer,
    //         //     celular integer,
    //         //     ci integer,
    //         //     correo text,
    //         //     genero text,
    //         //     idVivienda integer,
    //         //     expedicion text
    //         //   )`;
    //         // this.database.executeSql(sentencia, {});
    //       });
    //     });
    //   }// fin if cordova
    //
    // });

  }

  ejecutar(query, parametros) {
    return this.database.executeSql(query, parametros);
  }

  /**
   * Perform an arbitrary SQL operation on the database. Use this method
   * to have full control over the underlying database through SQL operations
   * like SELECT, INSERT, and UPDATE.
   *
   * @param {string} query the query to run
   * @param {array} params the additional params to use for query placeholders
   * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
   */
  query(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this._dbPromise.then(db => {
          db.transaction((tx: any) => {
              tx.executeSql(query, params,
                (tx: any, res: any) => resolve({ tx: tx, res: res }),
                (tx: any, err: any) => reject({ tx: tx, err: err }));
            },
            (err: any) => reject({ err: err }));
        });
      } catch (err) {
        reject({ err: err });
      }
    });
  }

}
