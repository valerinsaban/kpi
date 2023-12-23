let { createApp, ref } = Vue

createApp({
  setup() {
    let fecha_inicio = ref(moment().format('YYYY-MM-DD'));
    let fecha_fin = ref(moment().format('YYYY-MM-DD'));
    let hora_inicio = ref(moment().format('01:00'));
    let hora_fin = ref(moment().format('23:59'));
    let intervalo = ref(60);
    let medida = ref('minutes');
    let familia = ref();
    let ventas = ref(0);
    let familias = ref([]);
    let productos = ref([]);
    let meseros = ref([]);
    let clientes = ref([]);
    let horarios = ref([]);
    let limite = ref(10);
    let cf = ref(true);
    let tipo = ref('bar');
    return {
      productos,
      horarios,
      familias,
      meseros,
      clientes,
      familia,
      ventas,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      intervalo,
      medida,
      limite,
      cf,
      tipo
    }
  },
  methods: {
    async getFamilias() {
      let familias = await axios(`https://olazul.kairossoft.app:3502/kpi/productos/${this.fecha_inicio}/${this.fecha_fin}`);
      this.familias = familias.data.data;
      this.ventas = familias.data.ventas;
      let totales_familias = [];
      let nombres_familias = [];
      let colores_familias = [];
      if (familias.data.result) {
        for (let f = 0; f < this.familias.length; f++) {
          totales_familias.push(this.familias[f].total);
          nombres_familias.push(this.familias[f].descripcion);
          colores_familias.push(this.familias[f].background);
        }
      }
      let options = {
        series: totales_familias,
        chart: {
          redrawOnParentResize: true,
          width: 600,
          height: 600,
          type: 'pie',
          events: {
            dataPointSelection: async (event, chartContext, config) => {
              await this.getProductos(this.familias[config.dataPointIndex]);
            }
          }
        },
        labels: nombres_familias,
        colors: colores_familias,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: '100%'
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      };

      let chartOrigin = document.getElementById('chart');
      chartOrigin.innerHTML = '';
      let chart = new ApexCharts(chartOrigin, options);
      chart.render();
    },
    async getProductos(data) {
      this.familia = data;
      this.productos = data.productos;
      let totales_productos = [];
      let nombres_productos = [];

      for (let p = 0; p < this.productos.length; p++) {
        totales_productos.push(this.productos[p].total);
        nombres_productos.push(this.productos[p].descLarga);
      }

      var options = {
        series: [{
          data: totales_productos
        }],
        chart: {
          type: this.tipo,
          height: 600,
          fontSize: "8px",
        },
        colors: [data.background],
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: nombres_productos,
          labels: {
            style: {
              fontSize: '9px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '9px'
            }
          }
        }
      };


      let chartOrigin = document.getElementById('chart2');
      chartOrigin.innerHTML = '';
      let chart = new ApexCharts(chartOrigin, options);
      chart.render();
    },
    async getHorarios() {
      let horarios = await axios(`https://olazul.kairossoft.app:3502/kpi/horarios/${this.fecha_inicio}/${this.fecha_fin}/${this.hora_inicio}/${this.hora_fin}/${this.intervalo}/${this.medida}`);
      this.horarios = horarios.data.data;

      let totales_horarios = [0];
      let nombres_horarios = [this.hora_inicio];

      for (let f = 0; f < this.horarios.length; f++) {
        totales_horarios.push(this.horarios[f].comandas);
        nombres_horarios.push(`${this.horarios[f].hora_fin}`);
      }

      var options = {
        series: [{
          name: 'comandas',
          data: totales_horarios
        }],
        chart: {
          height: 350,
          type: this.tipo,
        },
        stroke: {
          width: 5,
          curve: 'smooth'
        },
        xaxis: {
          categories: nombres_horarios,
          labels: {
            style: {
              fontSize: '9px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '9px'
            }
          }
        },
        title: {
          text: 'Forecast',
          align: 'left',
          style: {
            fontSize: "16px",
            color: '#666'
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: ['#FDD835'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1
          },
        }
      };

      let chartOrigin = document.getElementById('chart3');
      chartOrigin.innerHTML = '';
      let chart = new ApexCharts(chartOrigin, options);
      chart.render();
    },
    async getClientes() {
      let clientes = await axios(`https://olazul.kairossoft.app:3502/kpi/clientes/${this.fecha_inicio}/${this.fecha_fin}/${this.limite}/${this.cf}`);
      this.clientes = clientes.data.data;

      let totales_clientes = [];
      let nombres_clientes = [];

      for (let c = 0; c < this.clientes.length; c++) {
        totales_clientes.push(this.clientes[c].ventas);
        nombres_clientes.push(this.clientes[c].cliente.nombreC);
      }

      var options = {
        series: [{
          name: 'Comandas',
          data: totales_clientes
        }],
        chart: {
          height: 500,
          type: this.tipo,
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            columnWidth: '50%',
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: 2
        },
        grid: {
          row: {
            colors: ['#fff', '#f2f2f2']
          }
        },
        xaxis: {
          labels: {
            rotate: -45
          },
          categories: nombres_clientes,
          tickPlacement: 'on',
          style: {
            fontSize: '9px'
          }
        },
        yaxis: {
          title: {
            text: 'Comandas',
          },
          labels: {
            style: {
              fontSize: '9px'
            }
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: "horizontal",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.85,
            opacityTo: 0.85,
            stops: [50, 0, 100]
          },
        }
      };

      let chartOrigin = document.getElementById('chart4');
      chartOrigin.innerHTML = '';
      let chart = new ApexCharts(chartOrigin, options);
      chart.render();
    },
    async getMeseros() {
      let meseros = await axios(`https://olazul.kairossoft.app:3502/kpi/meseros/${this.fecha_inicio}/${this.fecha_fin}`);
      this.meseros = meseros.data.data;

      let totales_meseros = [];
      let nombres_meseros = [];

      for (let m = 0; m < this.meseros.length; m++) {
        totales_meseros.push(this.meseros[m].comandas);
        nombres_meseros.push(this.meseros[m].userName);
      }

      var options = {
        series: [{
          name: 'Comandas',
          data: totales_meseros
        }],
        chart: {
          height: 500,
          type: this.tipo,
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            columnWidth: '50%',
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: 2
        },
        grid: {
          row: {
            colors: ['#fff', '#f2f2f2']
          }
        },
        xaxis: {
          labels: {
            rotate: -45
          },
          categories: nombres_meseros,
          tickPlacement: 'on',
          style: {
            fontSize: '9px'
          }
        },
        yaxis: {
          title: {
            text: 'Comandas',
          },
          labels: {
            style: {
              fontSize: '9px'
            }
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: "horizontal",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.85,
            opacityTo: 0.85,
            stops: [50, 0, 100]
          },
        }
      };

      let chartOrigin = document.getElementById('chart5');
      chartOrigin.innerHTML = '';
      let chart = new ApexCharts(chartOrigin, options);
      chart.render();
    },
    number(number) {
      return Intl.NumberFormat('en-EN', {
        style: 'currency',
        currency: 'GTQ',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number)
    }
  }
}).mount('#app')