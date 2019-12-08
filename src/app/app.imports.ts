// Global state (para cambiar el tema de la app)
import { AppState } from './app.global';


// providers
import { ViviendaProvider, FamiliaProvider, InvitadoProvider,
  MovimientoProvider, AdministradorProvider,
  UsuarioProvider, UtilServiceProvider, Sql, FamiliarDao,
  ViviendaDao, InvitadoDao, EventoProvider, GrupoProvider, NotificacionDao,
  IngresosProvider, ContactosProvider, FamiliaresProvider } from '../providers/index.services';


/* IONIC NATIVE PROVIDERS */
/*
ionic cordova plugin add cordova-plugin-android-fingerprint-auth
npm install --save @ionic-native/android-fingerprint-auth
*/
import { AndroidFingerprintAuth } from '@ionic-native/android-fingerprint-auth';
/*
ionic cordova plugin add cordova-plugin-android-permissions
npm install --save @ionic-native/android-permissions
*/
import { AndroidPermissions } from '@ionic-native/android-permissions';
/*
ionic cordova plugin add phonegap-plugin-barcodescanner
npm install --save @ionic-native/barcode-scanner
npm install ngx-qrcode2 --save
*/
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
/*
ionic cordova plugin add call-number
npm install --save @ionic-native/call-number
*/
import { CallNumber } from '@ionic-native/call-number';
/*
ionic cordova plugin add cordova-plugin-contacts
npm install --save @ionic-native/contacts
*/
import { Contacts } from '@ionic-native/contacts';
/*
ionic cordova plugin add cordova-plugin-file
npm install --save @ionic-native/file
*/
import { File } from '@ionic-native/file';
/*
ionic cordova plugin add cordova-plugin-firebase
npm install --save @ionic-native/firebase
*/
import { Firebase } from '@ionic-native/firebase';
/*
ionic cordova plugin add cordova-plugin-x-socialsharing
npm install --save @ionic-native/social-sharing
*/
import { SocialSharing } from '@ionic-native/social-sharing'
/*
ionic cordova plugin add cordova-plugin-splashscreen
npm install --save @ionic-native/splash-screen
*/
import { SplashScreen } from '@ionic-native/splash-screen';
/*
ionic cordova plugin add cordova-sqlite-storage
npm install --save @ionic-native/sqlite
*/
import { SQLite } from '@ionic-native/sqlite';
/*
ionic cordova plugin add cordova-plugin-statusbar
npm install --save @ionic-native/status-bar
*/
import { StatusBar } from '@ionic-native/status-bar';
/*
ionic cordova plugin add cordova-plugin-headercolor
npm install --save @ionic-native/header-color
*/
import { HeaderColor } from '@ionic-native/header-color';
/*
ionic cordova plugin add cordova-plugin-network-information
npm install --save @ionic-native/network
*/
import { Network } from '@ionic-native/network';


/* modules */
import { BrowserModule } from '@angular/platform-browser';
/*
npm install --save sweetalert2 @toverux/ngx-sweetalert2
*/
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

export const MODULES = [
  BrowserModule,
  SweetAlert2Module.forRoot(),
];

export const PROVIDERS = [
  AppState,
  ViviendaProvider,
  FamiliaProvider,
  InvitadoProvider,
  MovimientoProvider,
  AdministradorProvider,
  UsuarioProvider,
  UtilServiceProvider,
  Sql,
  FamiliarDao,
  ViviendaDao,
  InvitadoDao,
  EventoProvider,
  GrupoProvider,
  NotificacionDao,
  IngresosProvider,
  ContactosProvider,
  FamiliaresProvider, 


  // ionic native specific providers
  BarcodeScanner,
  StatusBar,
  SplashScreen,
  AndroidPermissions,
  SocialSharing,
  File,
  Firebase,
  SQLite,
  Contacts,
  CallNumber,
  AndroidFingerprintAuth,
  HeaderColor,
  Network
];
