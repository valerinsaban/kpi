let { createApp, ref } = Vue

createApp({
  setup() {
    let fecha_inicio = ref(moment().format('YYYY-MM-DD'));
    let fecha_fin = ref(moment().format('YYYY-MM-DD'));
    let familia = ref();
    let ventas = ref(0);
    let familias = ref([]);
    let productos = ref([]);
    return {
      productos,
      familias,
      familia,
      ventas,
      fecha_inicio,
      fecha_fin
    }
  },
  methods: {
    async getFamilias() {
      let familias = await axios(`http://localhost:3000/kpi/productos/${this.fecha_inicio}/${this.fecha_fin}`);
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
              width: 20
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      };

      var chartOrigin = document.getElementById('chart');
      chartOrigin.innerHTML = '';
      if (chartOrigin) {
        var chart = new ApexCharts(chartOrigin, options);
        chart.render();
      }
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
          type: 'bar',
          height: 350
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
        }
      };

      
      var chartOrigin = document.getElementById('chart2');
      chartOrigin.innerHTML = '';
      if (chartOrigin) {
        var chart = new ApexCharts(chartOrigin, options);
        chart.render(); 
      }
    }
  }
}).mount('#app')