export var options = {
    chart: {
        height: 350,
        type: 'radialBar',
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
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: "15px",
                    show: true,
                }
            },
        },
    },
    tooltip: {
        enabled: false,
        y: {
            formatter: function (value) {
                return value + ' %';
            }
        }
    },
    stroke: {
        lineCap: "round",
        width: -20
    },
    labels: ["Risk Review"],
}