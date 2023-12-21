let { createApp, ref } = Vue

createApp({
  setup() {
    let fecha_inicio = ref(moment().format('YYYY-MM-DD'));
    let fecha_fin = ref(moment().format('YYYY-MM-DD'));
    let familias = ref([]);
    let productos = ref([]);
    return {
      productos,
      familias,
      fecha_inicio,
      fecha_fin
    }
  },
  async created() {
    // await this.getFamilias();
  },
  methods: {
    async getProductos(data) {
      this.productos = data.productos;
      
      console.log(this.productos);
    },
    async getFamilias() {
      let familias = await axios(`http://localhost:3000/kpi/productos/${this.fecha_inicio}/${this.fecha_fin}`);
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
              await this.getProductos(this.familias[config.dataPointIndex]);
            }
          }
        },
        labels: nombres_familias,
        // colors: colores_familias,
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