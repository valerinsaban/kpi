let { createApp, ref } = Vue

createApp({
  setup() {
    let familias = ref([]);
    let productos = ref([]);
    return {
      productos,
      familias
    }
  },
  async created() {
    await this.familias();
  },
  methods: {
    async setProductos(data) {
      this.productos = data;
      console.log(this.productos);
    },
    async setFamilias() {
      let familias = await axios('http://localhost:3000/kpi/productos/2023-12-19/2023-12-19');
      this.familias = familias.data.data;
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
          width: 880,
          type: 'pie',
          events: {
            dataPointSelection: async (event, chartContext, config) => {
              await this.setProductos(this.familias[config.dataPointIndex]);
            }
          }
        },
        labels: nombres_familias,
        colors: colores_familias,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 800
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      };

      var chartOrigin = document.getElementById('chart');
      if (chartOrigin) {
        var chart = new ApexCharts(chartOrigin, options);
        chart.render();
      }
    }
  }
}).mount('#app')