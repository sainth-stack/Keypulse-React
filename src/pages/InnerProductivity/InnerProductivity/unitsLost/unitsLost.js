import { ApexChart } from "../../../../components/ApexBarChart"
export const UnitsLost = ({ selData }) => {
    const options3 = {
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
                colors: [  "#427ae3",
                "#0000FF"]
            },
            offsetY: -20,
            formatter: function (val, opt) {
                const goals =
                    opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex]
                        .goals
                return `${val}`
            }
        },
        yaxis: {
            title: {
                text: 'Units'
            }
        },
        // colors: colors
    }
    const plantationData = (data) => {
        const getData = (data) => {
            const finalData = data[0].data.map((item, index) => {
                return {
                    x: data[0].label[index].substring(0, 3),
                    y: item,
                    color: "#41B883",
                }
            })
            return finalData
        }
        const finalData = [
            {
                name: 'Actual',
                data: getData(data)
            }
        ]
        return finalData
    }
    return (
        <div className="card" style={{ width: "520px" }}>
            <ApexChart series={plantationData(selData)} options={options3} height={"250px"} width={"500px"} />
        </div>
    )
}