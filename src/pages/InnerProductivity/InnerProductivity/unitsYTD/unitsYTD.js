import { ApexChart } from "../../../../components/ApexBarChart"
import { plantationData } from "../../../../utils"
export const UnitsYTD = ({ selData }) => {
    const options3 = {
        chart: {
            // height: '400px',
            // width:'100px',
            type: 'bar'
        },

        colors: [
            "#faa93e",
            "#427ae3",
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
                    "#427ae3",
                ],              },
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
    // const plantationData = (data) => {
    //     const finalData = [
    //         {
    //             name: "Planned",
    //             data: [
    //                 { x: "Jan", y: 50000, color: "#faa93e" },
    //                 { x: "Feb", y: 50000, color: "#faa93e" },
    //                 { x: "Mar", y: 50000, color: "#faa93e" },
    //                 { x: "Apr", y: 50000, color: "#faa93e" },
    //                 { x: "May", y: 50000, color: "#faa93e" },
    //                 { x: "Jun", y: 50000, color: "#faa93e" },
    //                 { x: "Jul", y: 50000, color: "#faa93e" },
    //                 { x: "Aug", y: 50000, color: "#faa93e" },
    //             ]
    //         },
    //         {
    //             name: 'Actual',
    //             data: [
    //                 {
    //                     x: 'Jan',
    //                     y: data[0].data[0],
    //                     color: "#41B883",
    //                 },
    //                 {
    //                     x: 'Feb',
    //                     y: data[0].data[1],
    //                     color: "#00D8FF",
    //                 },
    //                 {
    //                     x: 'Mar',
    //                     y: data[0].data[2],
    //                     color: "#00D8FF",
    //                 },
    //                 {
    //                     x: 'Apr',
    //                     y: data[0].data[3],
    //                     color: "#00D8FF",
    //                 },
    //                 {
    //                     x: 'May',
    //                     y: data[0].data[4],
    //                     color: "#00D8FF",
    //                 },
    //                 {
    //                     x: 'Jun',
    //                     y: data[0].data[5],
    //                     color: "#00D8FF",
    //                 },
    //                 {
    //                     x: 'Jul',
    //                     y: data[0].data[6],
    //                     color: "#00D8FF",
    //                 },
    //                 {
    //                     x: 'Aug',
    //                     y: data[0].data[7],
    //                     color: "#00D8FF",
    //                 }
    //             ]
    //         },
           
    //     ]
    //     return finalData
    // }
    return (
        <div className="card" style={{ width: "680px" }}>
            <ApexChart series={plantationData(selData,true,50000,"#faa93e")} options={options3} height={"250px"} width={"630px"} />
        </div>
    )
}