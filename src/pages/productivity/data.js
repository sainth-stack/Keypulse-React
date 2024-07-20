export var options = {
    chart: {
        height: 350,
        type: 'radialBar',
        sparkline: {
            enabled: true
        }
    },
    colors: [
        function ({ value, seriesIndex, dataPointIndex, w }) {
            if (value < 40) {
                return "#d10f0f";
            } else if (value > 70) {
                return "#39c734";
            } else return "#ffbf00"
        }
    ],
    plotOptions: {
        radialBar: {
            hollow: {
                margin: 15,
                size: "60%"
            },
            dataLabels: {
                name: {
                    show: false,
                    offsetY: -10,
                    align: 'center',
                    verticalAlign: 'middle',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: "12px",
                },
                value: {
                    formatter: function (val) {
                        return `${parseInt(val)}%`;
                    },
                    offsetY: 5,
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: "15px",
                    show: true,
                }
            },
        },
    },
    tooltip: {
        enabled: true,
        y: {
            formatter: function (val, opts) {
                return val + "%";
            }, title: {
                formatter: (seriesName) => seriesName,
            },
        },
    },
    stroke: {
        lineCap: "round",
        width: -20
    },
    labels: ["Risk Review"],
}
