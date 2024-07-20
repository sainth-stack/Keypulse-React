export const series1 = [
    {
        name: 'Actual',
        data: [
            {
                x: 'Robotic Arm',
                y: 8000,
                color: "#41B883",
            },
            {
                x: 'Roller Belts',
                y: 7000,
                color: "#00D8FF",
            },
            {
                x: 'Boilers',
                y: 5000,
                color: "#00D8FF",
            },
            {
                x: 'Chillers',
                y: 3000,
                color: "#00D8FF",
            }
        ]
    }
]


export const options1 = {
    chart: {
        // height: '400px',
        // width:'100px',
        type: 'bar'
    },

    colors: [
        "#39c734",
        "#0000FF"
    ],
    plotOptions: {
        bar: {
            columnWidth: '5px',
            horizontal: false,
            borderRadius: 0,
            borderRadiusApplication: 'around',
            borderRadiusWhenStacked: 'last',
            columnWidth: '30%',
            barHeight: '40%',
            distributed: false,
            rangeBarOverlap: true,
            rangeBarGroupRows: false,
            hideZeroBarsWhenGrouped: false,
            isDumbbell: false,
            dumbbellColors: undefined,
            isFunnel: false,
            isFunnel3d: true,
            dataLabels: {
                position: 'top',
            }
        },
    },
    grid: {
        show: false
    },

    dataLabels: {
        style: {
            fontSize: '12px',
            colors: ["#304758"]
        },
        offsetY: -20,
        formatter: function (val, opt) {
            const goals =
                opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
                    .goals
            return `${val}`
        }
    }
    // colors: colors
}

export const series2 = [
    {
        name: 'Actual',
        data: [
            {
                x: 'Miscelleneous',
                y: 1450,
                color: "#41B883",
            },
            {
                x: 'General',
                y: 1200,
                color: "#00D8FF",
            },
            {
                x: 'Recyclable',
                y: 500,
                color: "#00D8FF",
            },
            {
                x: 'critical',
                y: 200,
                color: "#00D8FF",
            },
            {
                x: 'waste',
                y: 100,
                color: "#00D8FF",
            }
        ]
    }
]


export const options2 = {
    chart: {
        // height: '400px',
        // width:'100px',
        type: 'bar'
    },

    colors: [
        "#000",
        "#0000FF"
    ],
    plotOptions: {
        bar: {
            columnWidth: '5px',
            horizontal: false,
            borderRadius: 0,
            borderRadiusApplication: 'around',
            borderRadiusWhenStacked: 'last',
            columnWidth: '30%',
            barHeight: '40%',
            distributed: false,
            rangeBarOverlap: true,
            rangeBarGroupRows: false,
            hideZeroBarsWhenGrouped: false,
            isDumbbell: false,
            dumbbellColors: undefined,
            isFunnel: false,
            isFunnel3d: true,
            dataLabels: {
                position: 'top',
            }
        }
    },
    grid: {
        show: false
    },
    dataLabels: {
        style: {
            fontSize: '12px',
            colors: ["#304758"]
        },
        offsetY: -20,
        formatter: function (val, opt) {
            const goals =
                opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
                    .goals
            return `${val}`
        }
    }
    // colors: colors
}

export const seriesplantation = [
    {
        name: 'Actual',
        data: [
            {
                x: 'Jan',
                y: 10444,
                color: "#41B883",
            },
            {
                x: 'Feb',
                y: 10200,
                color: "#00D8FF",
            },
            {
                x: 'Mar',
                y: 9200,
                color: "#00D8FF",
            },
            {
                x: 'Apr',
                y: 5325,
                color: "#00D8FF",
            },
            {
                x: 'May',
                y: 6221,
                color: "#00D8FF",
            },
            {
                x: 'Jun',
                y: 9745,
                color: "#00D8FF",
            },
            {
                x: 'Jul',
                y: 11243,
                color: "#00D8FF",
            }
        ]
    }
]


export const optionsplantation = {
    chart: {
        // height: '400px',
        // width:'100px',
        type: 'bar'
    },

    colors: [
        "#39c734",
        "#0000FF"
    ],
    plotOptions: {
        bar: {
            columnWidth: '5px',
            horizontal: false,
            borderRadius: 0,
            borderRadiusApplication: 'around',
            borderRadiusWhenStacked: 'last',
            columnWidth: '30%',
            barHeight: '40%',
            distributed: false,
            rangeBarOverlap: true,
            rangeBarGroupRows: false,
            hideZeroBarsWhenGrouped: false,
            isDumbbell: false,
            dumbbellColors: undefined,
            isFunnel: false,
            isFunnel3d: true,
            dataLabels: {
                position: 'top',
            }
        }
    },
    grid: {
        show: false
    },
    dataLabels: {
        style: {
            fontSize: '12px',
            colors: ["#304758"]
        },
        offsetY: -20,
        formatter: function (val, opt) {
            const goals =
                opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
                    .goals
            return `${val}`
        }
    },
    annotations: {
        yaxis: [
            {
                y: 9000,
                borderColor: 'red',
                label: {
                    borderColor: 'none',
                    style: {
                        color: '#d10f0f',
                        fontSize: "10px",
                        background: 'none'
                    },
                    text: 'Planned 9000'
                }
            }
        ]
    }
    // colors: colors
}



export const series3 = [
    {
        name: 'Actual',
        data: [
            {
                x: ["Robotic", "Arm"],
                y: 105000,
                color: "#41B883",
            },
            {
                x: ['Roller', 'Belts'],
                y: 88400,
                color: "#00D8FF",
            },
            {
                x: ['Boilers'],
                y: 220502,
                color: "#00D8FF",
            },
            {
                x: ['Chillers'],
                y: 158000,
                color: "#00D8FF",
            }
        ]
    }
]


export const options3 = {
    chart: {
        // height: '400px',
        // width:'100px',
        type: 'bar'
    },

    colors: [
        "#427ae3",
        "#0000FF"
    ],
    plotOptions: {
        bar: {
            columnWidth: '5px',
            horizontal: false,
            borderRadius: 0,
            borderRadiusApplication: 'around',
            borderRadiusWhenStacked: 'last',
            columnWidth: '30%',
            barHeight: '40%',
            distributed: false,
            rangeBarOverlap: true,
            rangeBarGroupRows: false,
            hideZeroBarsWhenGrouped: false,
            isDumbbell: false,
            dumbbellColors: undefined,
            isFunnel: false,
            isFunnel3d: true,
            dataLabels: {
                position: 'top',
            }
        },
    },
    grid: {
        show: false
    },

    dataLabels: {
        style: {
            fontSize: '12px',
            colors: ["#304758"]
        },
        offsetY: -20,
        formatter: function (val, opt) {
            const goals =
                opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
                    .goals
            return `${val}`
        }
    }
    // colors: colors
}


export var dounut1 = {
    series: [15, 85],
    labels: ["Wind Energy", "Solar Energy"],
    colors: ["#445d7c",
        "#504262"],
    fill: {
        colors: ["#445d7c",
            "#504262"]
    },
    chart: {
        width: 390,
        type: 'donut',
    },
    plotOptions: {
        pie: {
            startAngle: -100,
            endAngle: 270
        }
    },
    // dataLabels: {
    //   enabled: false
    // },
    // fill: {
    //   type: 'gradient',
    // },
    tooltip: {
        enabled: true,
        y: {
            formatter: function (value) {
                return value + ' Units';
            }
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        bottom: 0
        //   align:'center'
    },
    // title: {
    //   display:false,
    //   text: 'Gradient Donut with custom Start-angle'
    // },
};



export const data = [
    {
        inferences: ["Energy consumption by Chillers is 7% more than energy consumed by the other 3 types of machines", "During the period of observation, Boilers have consumed least energy, 3% down MoM"],
        recomondations: ["Chillers may be operated with multiple temperature ranges to maintain overall optimal value with reduced electricity consumption", "Reduce machine idling by switching off machines with a set pattern"],
        predictions: ["Total energy consumption over next 2 months is expected to be 10.5 MWh and 12 MWh"]
    },
    {
        inferences: ["Overall waste generation is found to be within the set limits", "Recyclable waste segregation needs attention as the aggregate so far is less than expected"],
        recomondations: ["Enforce recyclable waste segregation and collection with stringent measures", "Treat critical waste to ensure reduced intensity and impact"],
        predictions: ["Waste generation over next 3 months expected to reduce by 2.5%, 3% and 1.2%"]
    },
    {
        inferences: ["Summer months have seen lower count of plantation as expected", "Early showers helped double the plantations in the month of July."],
        recomondations: ["Increase geo diversity as well as plant diversity", "Evaluate new and inexpensive plant tracking tool in the market"],
        predictions: ["Expected plantation over next 2 months are 34,000 and 57,000"]
    },
    {
        inferences: ["Recycle water usage has increased to 2.1%", "Premium water purchase has gone down by 1.8%"],
        recomondations: ["Adhere to water supply schedules", "Conduct weekly water leak checks across all production plants"],
        predictions: ["Predicted water consumption over next 3 months are 21,000; 24,500; and 19,300"]
    },
    {
        inferences: ["Solar energy generated is highest during the fiscal", "Wind energy dropped by 0.7% YoY owing to unplanned downtime of two windmills"],
        recomondations: ["Consider energy generation from produced waste", "10% of energy generated may be transferred to central power grid"],
        predictions: ["Solar energy generation forecast over next 2 months - 0.81 MW and 0.74 MW", "Wind energy forecast for next 2 months - 1.1 MW and 1.7 MW"]
    },
    {
        inferences: ["CO2 emission has been all time low in the months - January and April", "March and June have been found to be high emission months, correlating with doubled production in those months"],
        recomondations: ["Consider establishing CO2 treatment plants", "Release processed CO2 into air instead of direct emissions"],
        predictions: ["Overall CO2 emission in the next 2 months predicted to be 140KG and 167KG", "Expected carbon neutralization in next 3 months is 1.7%, 1.85% and 1.47%"]
    }
]