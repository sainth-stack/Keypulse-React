import { ApexChart } from "../../../components/ApexBarChart"
import { getDataCommon } from '../../../utils'
export const InnerResiliance = ({ selData }) => {
    const options3 = {
        chart: {
            // height: '400px',
            // width:'100px',
            type: 'bar'
        },

        colors: [
            "#faa93e",
            "#427ae3"
        ],
        plotOptions: {
            bar: {
                columnWidth: '5px',
                horizontal: false,
                borderRadius: 0,
                borderRadiusApplication: 'around',
                borderRadiusWhenStacked: 'last',
                columnWidth: '40%',
                barHeight: '50%',
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
                colors: [
                    "#faa93e",
                    "#427ae3"
                ],            },
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
        const getDataCommon = (data) => {
            console.log(data)
            const finalData = data.data.map((item, index) => {
                return {
                    x: data.label[index].substring(0, 3),
                    y: item,
                    color: "#41B883",
                }
            })
            return finalData
        }
        console.log(data)
        const finalData = [
            {
                name: "Planned",
                data: getDataCommon(data[0])
            },
            {
                name: 'Actual',
                data: getDataCommon(data[1])
            },
        ]
        return finalData
    }
    return (
        <div className="card" style={{ width: "630px" }}>
            <ApexChart series={plantationData(selData[0].data)} options={options3} height={"250px"} width={"600px"} />
        </div>
    )
}