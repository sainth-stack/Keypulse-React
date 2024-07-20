import './styles.css'
import { StackChart } from './StackChart';
import PieChart from '../../components/PieChart';
export const ResourceManagement = () => {
    function Heading(props) {
        return (
            <div className="d-flex justify-content-between align-items-center p-2">
                {props.icon && props.icon} <h5>{props.title}</h5>
                {props.title === "OKR Progress" && <button
                    className="text-left justify-content-start bg-green text-light"
                    style={{ borderRadius: "4px", textTransform: "uppercase" }}
                // onClick={() => {
                //     props.setOrderModalShow3(true)
                // }}
                >
                    Add OKR
                </button>}
                <div className="dropdown actionDropdown">
                    {props.left && <button
                        className="btn btn-light dropdown-hide align-items-center"
                        id="dropdownMenuButton"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <i className="fa fa-ellipsis-h pe-auto" />
                    </button>}
                    {<div
                        className="dropdown-menu dropdown-menu-right text-left "
                        aria-labelledby="dropdownMenuButton"
                    >
                        <button
                            className="dropdown-item text-capitalize text-left justify-content-start"
                        // onClick={() => {
                        //     downloadSheet2()
                        // }}
                        >
                            Export as Excel
                        </button>

                    </div>}
                </div>
            </div>
        );
    }
    var options = {
        series: [44, 55, 41, 17, 15],
        labels: ["Risk Review", "Impact Review", "BCP", 'Survival Time', 'Rivival Time'],
        colors: ['#F44336', '#E91E63', '#9C27B0', "#00FF00"],
        fill: {
            colors: ['#F44336', '#E91E63', '#9C27B0', "#00FF00"]
        },
        chart: {
            width: 380,
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
        legend: {
            display: true,
            padding: 50
        },
        // title: {
        //   display:false,
        //   text: 'Gradient Donut with custom Start-angle'
        // },
    };

    var options1 = {
        series: [10, 5, 21, 1, 25],
        labels: ["CO2", "Waste", "Water", 'Electricity', 'Plantation'],
        colors: ['#000', '#E91E63', '#80d4ff', '#7DF9FF', '#53FF1A'],
        fill: {
            colors: ['#000', '#E91E63', '#80d4ff', '#7DF9FF', '#53FF1A']
        },
        chart: {
            width: 380,
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
        legend: {
            display: true,
            padding: 50
        },
        // title: {
        //   display:false,
        //   text: 'Gradient Donut with custom Start-angle'
        // },
    };
    var options3 = {
        series: [82, 15],
        colors: ["#FF6347", "#808080"],
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: '',
                            formatter: () => '82%'
                        }
                    }
                }
            }
        }

        // labels: ["CO2", "Waste", "Water", 'Electricity', 'Plantation'],
    };
    var options4 = {
        series: [34, 15],
        colors: ["#FF6347", "#808080"],
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: '',
                            formatter: () => '46%'
                        }
                    }
                }
            }
        }

        // labels: ["CO2", "Waste", "Water", 'Electricity', 'Plantation'],
    };
    return (
        <div>
            <div className='row p-4 pt-3'>
                <div className={`row m-0 p-0`} >
                    <div className={`col-md-8 gradient-color card shadow rounded graphCardHeight border-0 `}>
                        <Heading title="Productivity" data={[]} employees={[]} />
                        <hr />
                        <div className="mt-3" style={{
                            display: "flex", justifyContent: "start"
                        }}>
                            {/* <StackChart data={[]} labels={['Remaining', 'Achieved']} /> */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div className='ms-5 ps-5'>
                                        <Heading title="Overall Number" data={[]} employees={[]} left={false} />
                                        <PieChart options={options3} width={300} />
                                    </div>
                                    <div className='ms-5 ps-5'>
                                        <Heading title="OpEx" data={[]} employees={[]} left={false} />
                                        <PieChart options={options3} width={300} />
                                    </div>
                                </div >
                                <div style={{ display: "flex", justifyContent: "space-between" }} className='mt-5 pt-3'>
                                    <div className='ms-5 ps-5'>
                                        <Heading title="Throuput" data={[]} employees={[]} left={false} />
                                        <PieChart options={options4} width={300} />
                                    </div>
                                    <div className='ms-5 ps-5'>
                                        <Heading title="UpTime" data={[]} employees={[]} left={false} />
                                        <PieChart options={options4} width={300} />
                                    </div>
                                </div >
                            </div>
                        </div>
                    </div>
                    <div className='col-md-4'>
                        <div className={`row-md-12 gradient-color card shadow rounded m-1 p-1 me-0 pe-0 graphCardHeight border-0`}>
                            <Heading title="Resilieance" data={[]} employees={[]} />
                            <hr style={{ padding: 0 }} />
                            <div className="mt-3" style={{
                                display: "flex", justifyContent: "center"
                            }}>
                                <PieChart options={options} />
                            </div>
                        </div>
                        <div className={`col gradient-color card shadow rounded m-1 p-1 me-0 pe-0 graphCardHeight border-0`}>
                            <Heading title="Sustainability" data={[]} employees={[]} />
                            <hr style={{ padding: 0 }} />
                            <div className="mt-3" style={{
                                display: "flex", justifyContent: "center"
                            }}>
                                <PieChart options={options1} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}