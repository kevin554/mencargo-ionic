import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import chartJs from 'chart.js';
import {MovimientoProvider} from "../../providers/movimiento/movimiento";

@IonicPage()
@Component({
  selector: 'page-reportes',
  templateUrl: 'reportes.html',
})
export class ReportesPage {

  @ViewChild('barCanvas') barCanvas;
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild('pieCanvas') pieCanvas;

  barChart: any;
  lineChart: any;
  pieChart: any;
  private objCondominio:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private _mp: MovimientoProvider) {

    if (navParams.get("condominio")) {
      this.objCondominio = navParams.get("condominio");
    }

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.barChart = this.getVisitasSemanales();
    }, 150);
    setTimeout(() => {
      this.lineChart = this.getVisitasAnuales();
    }, 250);
    setTimeout(() => {
      this.pieChart = this.getVisitasPorVivienda();
    }, 350);
  }

  private getVisitasSemanales() {
    // obtengo las visitas de manera global
    let peticion = this._mp.getInvitadosDeCondominio(
      "",
      "",
      this.objCondominio.fkcondominio
    );

    peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let lista:any[] = [];

        for (let indice in datos) {
          let visita = datos[indice];
          lista.push(visita);
        }

        let fecha = new Date();
        let diasADescontar = (fecha.getDay() == 0) ? 7 : (fecha.getDay() + 1);

        fecha.setDate(fecha.getDate() - diasADescontar);

        // lista con las visitas de esta semana
        let listaSemanal:any[] = [];
        for (let obj of lista) {
          if (new Date(obj.hora_ingreso) > fecha) {
            listaSemanal.push(obj);
          }
        }

        let reporte:any[] = this.getCantidadDeVisitasPorDia(listaSemanal);

        this.getBarChart(reporte);
      } else {

      }

    }).subscribe(
      success => {

      },
      err => {

      }
    );
  }

  private getCantidadDeVisitasPorDia(lista:any[]) {
    let listaCantidadVisitas:number[] = [];

    for (let i = 0; i < 7; i++) {
      listaCantidadVisitas.push(0);
    }

    for (let i in lista) {
      let fecha = new Date(lista[i].hora_ingreso);
      let diaDeSemana = fecha.getDay() == 0 ? 6 : fecha.getDay() - 1;

      listaCantidadVisitas[diaDeSemana]++;
    }

    return listaCantidadVisitas;
  }

  private getBarChart(reporte:number[]) {
    const data = {
      labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      datasets: [{
        label: 'Durante la semana',
        data: reporte,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    };

    const options = {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };

    return this.getChart(this.barCanvas.nativeElement, 'bar', data, options);
  }

  public getVisitasPorVivienda() {
    // obtengo las visitas de manera global
    let peticion = this._mp.getInvitadosDeCondominio(
      "",
      "",
      this.objCondominio.fkcondominio
    );

    peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let lista:any[] = [];

        for (let indice in datos) {
          let visita = datos[indice];
          lista.push(visita);
        }

        let viviendas = this.getViviendas(lista);
        let reporte:any[] = [];

        for (let vivienda of viviendas) {
          let cantidadVisitas = this.getVisitas(lista, vivienda);

          let obj = {
            vivienda: vivienda,
            visitas: cantidadVisitas
          }

          reporte.push(obj)
        }

        this.getPieChart(reporte);
      } else {

      }

    }).subscribe(
      success => {

      },
      err => {

      }
    );
  }

  private getPieChart(reporte:any[]) {
    let labels:string[] = [];

    for (let i in reporte) {
      let item = reporte[i];
      labels.push(item.vivienda);
    }

    let theData:string[] = [];

    for (let i in reporte) {
      let item = reporte[i];
      theData.push(item.visitas)
    }

    const data = {
      // labels: ['Ramiro', 'Mendez', 'Ribera'],
      labels: labels,
      datasets: [
        {
          // data: [300, 50, 100],
          data: theData,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    };

    return this.getChart(this.pieCanvas.nativeElement, 'pie', data);
  }

  private getViviendas(lista:any[]) {
    let viviendas:any[] = [];

    for (let i in lista) {
      let item = lista[i];
      let vivienda = item.vivienda;

      if (viviendas.indexOf(vivienda) > -1) {

      } else {
        viviendas.push(vivienda);
      }
    }

    return viviendas;
  }

  private getVisitas(lista:any[], vivienda) {
    let cantidadVisitas = 0;

    for (let i in lista) {
      let item = lista[i];

      if (item.vivienda == vivienda) {
        cantidadVisitas++;
      }
    }

    return cantidadVisitas++;
  }

  private getVisitasAnuales() {
    // obtengo las visitas de manera global
    let peticion = this._mp.getInvitadosDeCondominio(
      "",
      "",
      this.objCondominio.fkcondominio
    );

    peticion.map( resp => {
      let datos = resp.json();

      if (datos.success) {
        datos = datos.response;

        let lista:any[] = [];

        for (let indice in datos) {
          let visita = datos[indice];

          if (new Date(visita.hora_ingreso).getFullYear() == 2018) {
            lista.push(visita);
          }
        }

        let reporte:any[] = this.getCantidadDeVisitasPorMes(lista);

        this.getLineChart(reporte);
      } else {

      }

    }).subscribe(
      success => {

      },
      err => {

      }
    );
  }

  private getCantidadDeVisitasPorMes(lista:any[]) {
    let listaCantidadVisitas:number[] = [];

    for (let i = 0; i < 12; i++) {
      listaCantidadVisitas.push(0);
    }

    for (let obj of lista) {
      let fecha = new Date(obj.hora_ingreso);
      let mes = fecha.getMonth();

      listaCantidadVisitas[mes]++;
    }

    return listaCantidadVisitas;
  }

  private getLineChart(reporte:any[]) {
    const data = {
      labels: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      datasets: [
        {
          label: '2018',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          // data: [65, 59, 80, 81, 56, 55, 40],
          data: reporte,
          spanGaps: false,
        }
      ]
    };

    return this.getChart(this.lineCanvas.nativeElement, 'line', data);
  }

  private getChart(context, chartType, data, options?) {
    return new chartJs(context, {
      data,
      options,
      type: chartType,
    });
  }

}
