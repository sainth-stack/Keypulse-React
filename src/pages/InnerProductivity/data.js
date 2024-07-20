export var toptions = {
  chart: {
    type: 'bar',
    height: 350
  },
  colors: ["#1b3c7a", "#427ae3", "#3dc7d1", '#faa93e'],
  fill: {
    colors: ["#1b3c7a", "#427ae3", "#3dc7d1", '#faa93e']
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  yaxis: {
    title: {
      text: 'Throughout (units)'
    }
  },
  xaxis: {
    title: {
      text: 'Month'
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val
      }
    }
  }
};
export const options2 = {

  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      width: 12,
      height: 12,
    },
    title: {
      display: false,
      text: 'Chart.js Line Chart',
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Month',
        color: 'black',
        fontWeight: 700,
        padding: 5
      },
      grid: {
        display: false,
      }
    },
    y: {
      title: {
        display: true,
        text: 'Operational Expenses($)',
        color: 'black',
        fontWeight: 700,
        padding: 5
      },
      grid: {
        display: false
      }
    }
  }
};


export var options3 = {
  chart: {
    type: 'bar',
    // height: 350
  },
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '55%',
      endingShape: 'rounded',
      responsive: true,

    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['2023'],
    labels: {
      show: true,
    }
  },
  colors: ["#1b3c7a", "#427ae3", "#3dc7d1", "#faa93e"],
  fill: {
    colors: ["#1b3c7a", "#427ae3", "#3dc7d1", ""]
  },
  // yaxis: {
  //   title: {
  //     text: 'Machine'
  //   },
  // },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + "%"
      }
    }
  }
};

export const options4 = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      width: 12,
      height: 12,
    },
    title: {
      display: false,
      text: 'Chart.js Line Chart',
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Month',
        color: 'black',
        fontWeight: 700,
        padding: 5
      },
      grid: {
        display: false,
      }
    },
    y: {
      title: {
        display: true,
        text: 'Up Time (hours)  2023',
        color: 'black',
        fontWeight: 700,
        padding: 5
      },
      grid: {
        display: false
      }
    }
  }
};

export var dounut1 = {
  // series: [20, 30, 40, 10],
  labels: ["Tooling Error", "Physical Damage", "Opener Damage", "Other Causes"],
  colors: ["#1b3c7a", "#427ae3", "#3dc7d1", "#39c734"],
  fill: {
    colors: ["#1b3c7a", "#427ae3", "#3dc7d1", "#39c734"]
  },
  chart: {
    width: 380,
    type: 'donut',
  },
  plotOptions: {
    pie: {
      startAngle: -100,
      endAngle: 270,
    }
  },
  // responsive:true,
  // dataLabels: {
  //   enabled: false
  // },
  // fill: {
  //   type: 'gradient',
  // },
  legend: {
    show: true,
    position: 'bottom',
    width: 250,
    offsetX: 80,
    //  horizontalAlign:'center' 
  },
  // title: {
  //   display:false,
  //   text: 'Gradient Donut with custom Start-angle'
  // },
};



export const namesSort = [
  { file: "kpUnitsYTD.csv", name: "Productivity - Throughout", id: 1 },
  { file: "kpUnitsLost.csv", name: "Productivity - OpEx", id: 2 },
  { file: "kpPlantProd.csv", name: "Productivity - Throughout", id: 3 },
  { file: "kpUtilization.csv", name: "Productivity - OpEx", id: 4 },
  { file: "kpLostCause.csv", name: "Productivity - Throughout", id: 5 },
  { file: "kpUptime.csv", name: "Productivity - OpEx", id: 6 },
  { file: "kpThroughput.csv", name: "Productivity - Throughout", id: 7 },
  { file: "kpOpEx.csv", name: "Productivity - OpEx", id: 8 }
]
