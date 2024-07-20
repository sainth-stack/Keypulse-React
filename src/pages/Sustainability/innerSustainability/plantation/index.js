import { LineChart } from "../../../../components/LineChart"
import { getLabels } from "../../apiData";
export const InnerPlantation = ({ selData }) => {
    const co2Data = (data) => {
        const finalData = {
            labels: getLabels(data),
            datasets: [
                {
                    label: 'Planned',
                    data: Array(data[0].data.length).fill(9000),
                    borderColor: "#faa93e",
                    backgroundColor: "#faa93e",
                },
                {
                    label: 'Actual',
                    data: data[0].data,
                    borderColor: '#427ae3',
                    backgroundColor: '#427ae3'
                },
            ],
        };

        return finalData
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
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
                    text: 'KG/Ton',
                    color: 'black',
                    fontWeight: 700,
                    padding: 5
                },
                grid: {
                    display: false
                }
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
    };

    return (
        <div className="card" style={{ width: "520px" }}>
            <LineChart height={"200px"} width={"100%"} data={co2Data(selData)} options={options} />
        </div>
    )
}