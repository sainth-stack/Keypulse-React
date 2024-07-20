import { ApexChart } from "../../components/ApexBarChart"
import { toptions, options2, options3, options4, dounut1, namesSort } from "./data"
import PieChart from "../../components/PieChart"
import { BiUpArrowAlt } from 'react-icons/bi'
import { BiDownArrowAlt } from 'react-icons/bi'
import AreaChart from "../../components/AreaChart/areacahrt"
import { useEffect, useState, useRef } from "react"
import { RxDotFilled } from 'react-icons/rx'
import { getTitle, getData, customStyles } from '../../utils'
import { LineChart } from "../../components/LineChart"
import axios from "axios";
import makeAnimated from 'react-select/animated';
import { aoptions, aoptions2, aoptions3 } from "../../components/AreaChart/data"
import { lostUnitsdata, prodOpexData, prodThroughputData, unitsLostData, unitsProdData, unitsYTDData, upTimeData, utilizationData } from "./apiData"
import { Popup } from "../../components/Popup"
import { UnitsYTD } from "./InnerProductivity/unitsYTD/unitsYTD"
import { UnitsLost } from "./InnerProductivity/unitsLost/unitsLost"
import { OveralPlantProductivity } from "./InnerProductivity/overal-plant-productivity"
import { OveralProductivityUtilization } from "./InnerProductivity/overal-productivity-utilization"
import { LostUnitsCauses } from "./InnerProductivity/lost-units-causes"
import { OveralProductivityUptime } from "./InnerProductivity/overal-productivity-uptime/unitsLost"
import { ProductivityThroughput } from "./InnerProductivity/productivity-throughput"
import { ProductivityOpex } from "./InnerProductivity/productivity-opex"
import { getLabels } from "../Sustainability/apiData"
import Select from 'react-select';
const ADAPTERS_BASE_URL = process.env.REACT_APP_BASE_URL;

export const InnerProductivity = () => {
    const [show, setShow] = useState(false)
    const [show1, setShow1] = useState(false)
    const [show2, setShow2] = useState(false)
    const [label, setLabel] = useState("")
    const [label1, setLabel1] = useState("")
    const [label2, setLabel2] = useState("")
    const [hover, setHover] = useState("")
    const [hover1, setHover1] = useState("")
    const [hover2, setHover2] = useState("")
    const [decHover, setDecHover] = useState(false)
    const [incHover, setIncHover] = useState(false)
    const [apidata, setApiData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [title, setTitle] = useState("")
    const [selData, setSelData] = useState([])
    const animatedComponents = makeAnimated();
    const [selectedDS, setSelectedDS] = useState(null);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [manualData, setManualData] = useState(false)
    const handleChangeDS = (selectedOption) => {
        setSelectedDS(selectedOption);
    };

    const handleChangeOrg = (selectedOption) => {
        setSelectedOrg(selectedOption);
    };

    const handleChangeKpi = (selectedOption) => {
        setSelectedKpi(selectedOption);
    };
    const datasources = [
        { value: 'Manual', label: 'Manual' },
        { value: 'IOT', label: 'IOT' },
        { value: 'Operational Datastore', label: 'Operational Datastore' }
    ]
    const options = [
        { value: 'Heavy machinery', label: 'Heavy machinery' },
        { value: 'Automotive', label: 'Automotive' },
        { value: 'Paper and pulp', label: 'Paper and pulp' }
    ]
    const fetchData = async () => {
        try {
            await axios.get(`${ADAPTERS_BASE_URL}/productivity/getData`).then((response) => {
                //    const data = JSON.parse(response?.data?.replace(/\bNaN\b/g, "null"));
                const data = response?.data
                // console.log(JSON.parse(data))
                setApiData(data.result);
            });
        } catch (err) {
            console.log(err)
        }
    }

    const downloadData = async () => {
        console.log(selectedKpi)
        const list = selectedKpi.map((item) => item.value)
        try {
            await axios.get(`${ADAPTERS_BASE_URL}/productivity/download/organization=${selectedOrg.value}/list=${list.toString()}`).then((response) => {
                //    const data = JSON.parse(response?.data?.replace(/\bNaN\b/g, "null"));
                const data = response?.data
                // console.log(JSON.parse(data))
                setApiData(data.result);
            });
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (selectedDS?.value === 'IOT') {
            // downloadData()
            setManualData(false)
            setApiData([])
        } else if (selectedDS?.value === 'Manual') {
            setApiData([])
            if (manualData) {
                fetchData()
            }
        }
    }, [selectedDS, manualData])

    const data = [
        {
            inferences: ["Average monthly units produced are consistent but for 2 months.", "Month of February'23 has seen 6% lower production", "Months of April'23 and June'23 have recorded 2.5% and 4.1% higher production"],
            recomondations: ["Ensure supply and availability of raw material and water sources."],
            predictions: ["Predicted units for the next 3 months are 36,013, 29,210 and 41,245"]
        },
        {
            inferences: ["Two major incidents resulted in 74% of lost units", "Deployed new resources couldn't avoid physical damage during their initial 2 work months", "Unplanned shutdown caused loss in the month of Februrary'23"],
            recomondations: ["Upskilling and tool training may reduce the loss", "Align planned maintenance schedules to off peak hours"],
            predictions: ["Units likely to be lost in next 3 months are 0, 12, 0"]
        },
        {
            inferences: ["Month on Month (MoM) plant productivity is Good and adheres to the planned production"],
            recomondations: ["Continue to adhere to the production and maintenance plans"],
            predictions: ["Productivity in next three months is expected to be 84%"]
        }
    ]

    const fileInputRef = useRef(null); // Explicit type

    const handleFileChange = (event) => {
        // const selectedFile = event.target.files;
        handleUpload(event.target.files)
        // setFile(selectedFile)
    };
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUpload = async (data) => {
        var formData = new FormData();
        const finalData = []
        for (let i = 0; i < data.length; i++) {
            finalData.push(data[i])
        }
        const uploadData = []
        namesSort.map(sortingObj => {
            finalData.filter((item) => {
                if (item.name == sortingObj.file) {
                    uploadData.push(item)
                }
            })
        });

        for (let i = 0; i < uploadData.length; i++) {
            formData.append('file', uploadData[i]);
        }
        try {
            await axios.post(`${ADAPTERS_BASE_URL}/productivity/FileUpload`, formData)
                .then((response) => {
                    fetchData()
                    setManualData(true)
                });
        } catch (err) {
            console.log(err)
        }
    }

    const handleReports = async () => {
        try {
            await axios.get(`${ADAPTERS_BASE_URL}/download`)
                .then((response) => {
                    console.log(response)
                });
        } catch (err) {
            console.log(err)
        }
    }

    const handlePopup = (e, title, data) => {
        e.stopPropagation();
        setShowModal(true)
        setTitle(title)
        setSelData(data)
    }

    const handleTooltip = (e, setfunc, showVal) => {
        e.stopPropagation();
        setfunc(showVal)
    }

    const kpidata = [{
        label: "Units YTD", children: <UnitsYTD {...{ selData }} />, size: "lg", value: "kpUnitsYTD.csv"
    }, {
        label: "Units Lost", value: "kpUnitsLost.csv", children: <UnitsLost {...{ selData }} />, size: "lg"
    },
    {
        label: "Overall Plant Productivity", value: "kpPlantProd.csv", children: <OveralPlantProductivity {...{ selData }} />, size: "lg"
    },
    {
        label: "Overall Productivity - Utilization (YTD)", value: "kpUtilization.csv", children: <OveralProductivityUtilization {...{ selData }} />, size: "xl"
    },
    {
        label: "Lost Units:Causes", value: "kpLostCause.csv", children: <LostUnitsCauses {...{ selData }} />, size: "xl", estimate: true
    },
    {
        label: "Overall Productivity - Uptime (YTD)", value: "kpUptime.csv", children: <OveralProductivityUptime {...{ selData }} />, size: "xl"
    },
    {
        label: "Productivity - Throughout", value: "kpThroughput.csv", children: <ProductivityThroughput {...{ selData }} />, size: "xl"
    },
    {
        label: "Productivity - OpEx", value: "kpOpEx.csv", children: <ProductivityOpex {...{ selData }} />, size: "xl"
    }]

    const getCharts = () => {
        const final = kpidata.filter((item) => {
            if (item.label === title) return true
        })
        return final[0]
    }


    const getFilterData = () => {
        // const filterData = apidata.filter((item) => {
        //     return selectedKpi.filter((child) => child.value === item.name).length > 0
        // })
        // setApiData2(filterData)
        downloadData()
    }


    const handleGetData = (name, data5, inference, prediction) => {
        switch (name) {
            case 'kpThroughput.csv':
                return <div className="col-6 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Productivity - Throughout", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }}>
                        <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Productivity - Throughout</h6>
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <ApexChart series={prodThroughputData(data5)} options={{
                                ...toptions, xaxis: {
                                    categories: getLabels(data5),
                                    title: {
                                        text: 'Month'
                                    }
                                },
                            }} height={"250px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpOpEx.csv':
                return <div className="col-6 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Productivity - OpEx", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }}>
                        <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Productivity - OpEx</h6>
                        {/* <ApexChart series={options2.series1} options={options2} height={"250px"} width={"100%"} /> */}
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <LineChart data={prodOpexData(data5)} options={options2} height={"140px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpUtilization.csv':
                return <div className="col-4 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Overall Productivity - Utilization (YTD)", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }}>
                        <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Overall Productivity - Utilization (YTD)</h6>
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <ApexChart series={utilizationData(data5)} options={options3} height={"200px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpLostCause.csv':
                return <div className="col-4 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Lost Units:Causes", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }}>
                        <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Lost Units:Causes</h6>
                        <div style={{ minHeight: "265px", maxHeight: "255px", width: "100%" }}>
                            <PieChart options={{ ...dounut1, series: lostUnitsdata(data5) }} height="283px" width={445} />
                        </div>
                    </div>
                </div>
            case 'kpUptime.csv':
                return <div className="col-4 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Overall Productivity - Uptime (YTD)", data5)}>
                    <div style={{ border: '1px solid #E6E6E6', minHeight: "230px" }}>
                        <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Overall Productivity - Uptime (YTD)</h6>
                        {/* <ApexChart series={options4.series1} options={options4} height={"250px"} width={"100%"} /> */}
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <LineChart data={upTimeData(data5)} options={options4} height={"200px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpUnitsYTD.csv':
                let { total, finalData } = unitsYTDData(data5)
                return <div className="col-4 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Units YTD", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }} className="p-2">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6 className="ps-2" style={{ fontFamily: "poppins", fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Units YTD</h6>
                                {/* <h6 className="ps-2" style={{ fontFamily: "poppins", fontSize: '14px', fontWeight: 400, display: 'flex', justifyContent: "start" }}>Units Produced</h6> */}
                            </div>
                            <div style={{ height: '20px', justifyContent: 'space-around', display: "flex", alignItems: "center", width: "45px", borderRadius: "50px" }}>
                                <div style={{ display: "flex", justifyContent: 'start' }} onClick={(e) => { handleTooltip(e, setShow, true) }}><RxDotFilled cursor={"pointer"} color='#427ae3' onClick={() => { setLabel("inf") }} onMouseEnter={() => setHover("inf")} onMouseLeave={() => { setHover("") }} /> <RxDotFilled cursor={"pointer"} color='#800080' onClick={() => { setLabel("rec") }} onMouseEnter={() => setHover("rec")} onMouseLeave={() => { setHover("") }} /> <RxDotFilled cursor={"pointer"} color='#39c734' onClick={() => { setLabel("pre") }} onMouseEnter={() => setHover("pre")} onMouseLeave={() => { setHover("") }} /></div>
                                <div>
                                    {/* <button className='btn btn-primary mb-2' onClick={() => setShow(!show)}>IPR</button> */}
                                    {hover == "inf" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Inferences
                                    </div>}
                                    {hover == "rec" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Recommendations
                                    </div>}
                                    {hover == "pre" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Predictions
                                    </div>}
                                    {show && <div className='card p-2' style={{ position: 'absolute', marginLeft: "-300px", marginTop: "-20px", zIndex: 9999, width: '250px' }}>
                                        {label === "inf" && <div>
                                            {getTitle("Inferences", "#427ae3", () => setShow(false))}
                                            <>{inference?.length > 0 ? getData(inference, "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                        </div>}
                                        {label === "rec" && <div>
                                            {getTitle("Recommendations", "#800080", () => setShow(false))}
                                            {data[0].recomondations?.length > 0 ? getData(data[0].recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                        </div>}
                                        {label === "pre" && <div className=''>
                                            {getTitle("Predictions", "#39c734", () => setShow(false))}
                                            <>{prediction?.length > 0 ? getData(prediction, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        {/* <ApexChart series={options3.series1} options={options3} height={"250px"} width={"100%"} /> */}
                        <div className="d-flex text-center justify-content-between p-2" style={{ background: "", alignItems: 'center' }}>
                            <div >
                                <h2 style={{ color: "#ffbf00" }}>{total}</h2>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h6>Target</h6>
                                    <h6 style={{ color: 'black' }}>450000</h6>
                                </div>
                            </div>
                            <div>
                                <AreaChart options={aoptions} series={finalData} />
                                <div className="d-flex text-white justify-content-center" style={{ height: "50px", width: '100%', background: "#d10f0f", borderRadius: '8px', alignItems: 'center', fontSize: '18px' }} onMouseEnter={() => setDecHover(true)} onMouseLeave={() => setDecHover(false)}>
                                    <BiDownArrowAlt size={24} style={{ marginRight: "10px", marginTop: "2px" }} />  -6%
                                    {decHover && <div className="card text-center p-1" style={{ width: '170px', height: '30px', position: 'absolute', display: "flex", justifyContent: "center", alignItems: 'center', marginLeft: '-30px', marginTop: '-20px' }}>
                                        6% decrease MoM
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            case 'kpUnitsLost.csv':
                let { totallost, finalDatalost } = unitsLostData(data5)
                return <div className="col-4 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Units Lost", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }} className="p-2">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Units Lost</h6>
                                {/* <h6 className="ps-2" style={{ fontFamily: "poppins", fontSize: '14px', fontWeight: 400, display: 'flex', justifyContent: "start" }}>Units Losts</h6> */}
                            </div>
                            <div style={{ height: '20px', justifyContent: 'space-around', display: "flex", alignItems: "center", width: "45px", borderRadius: "50px" }}>
                                <div style={{ display: "flex", justifyContent: 'start' }} onClick={(e) => { handleTooltip(e, setShow1, true) }}><RxDotFilled cursor={"pointer"} color='#427ae3' onClick={() => { setLabel1("inf") }} onMouseEnter={() => setHover1("inf")} onMouseLeave={() => { setHover1("") }} /> <RxDotFilled cursor={"pointer"} color='#800080' onClick={() => { setLabel1("rec") }} onMouseEnter={() => setHover1("rec")} onMouseLeave={() => { setHover1("") }} /> <RxDotFilled cursor={"pointer"} color='#39c734' onClick={() => { setLabel1("pre") }} onMouseEnter={() => setHover1("pre")} onMouseLeave={() => { setHover1("") }} /></div>
                                <div>
                                    {/* <button className='btn btn-primary mb-2' onClick={() => setShow(!show)}>IPR</button> */}
                                    {hover1 == "inf" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Inferences
                                    </div>}
                                    {hover1 == "rec" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Recommendations
                                    </div>}
                                    {hover1 == "pre" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Predictions
                                    </div>}
                                    {show1 && <div className='card p-2' style={{ position: 'absolute', marginLeft: "-300px", marginTop: "-20px", zIndex: 9999, width: '250px' }}>
                                        {label1 === "inf" && <div>
                                            {getTitle("Inferences", "#427ae3", () => setShow1(false))}
                                            <>{inference?.length > 0 ? getData(inference, "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                        </div>}
                                        {label1 === "rec" && <div>
                                            {getTitle("Recommendations", "#800080", () => setShow1(false))}
                                            {data[1].recomondations?.length > 0 ? getData(data[1].recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                        </div>}
                                        {label1 === "pre" && <div className=''>
                                            {getTitle("Predictions", "#39c734", () => setShow1(false))}
                                            <>{prediction?.length > 0 ? getData(prediction, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex ps-2 justify-content-between" style={{ background: "", alignItems: 'center', height: '180px' }}>
                            <div className="pt-3" style={{ height: '70px' }}>
                                <h2>{parseInt(totallost)}</h2>
                            </div>
                            <div>
                                <AreaChart options={aoptions2} series={finalDatalost} />
                            </div>
                        </div>
                    </div>
                </div>
            case 'kpPlantProd.csv':
                let { totalprod, finalDataprod } = unitsProdData(data5)
                return <div className="col-4 apexchart" style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, "Overall Plant Productivity", data5)}>
                    <div style={{ border: '1px solid #E6E6E6' }} className="p-2">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6 className="ps-2" style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Overall Plant Productivity</h6>
                                {/* <h6 className="ps-2" style={{ fontFamily: "poppins", fontSize: '14px', fontWeight: 400, display: 'flex', justifyContent: "start" }}>Productivity</h6> */}
                            </div>
                            <div style={{ height: '20px', justifyContent: 'space-around', display: "flex", alignItems: "center", width: "45px", borderRadius: "50px" }}>
                                <div style={{ display: "flex", justifyContent: 'start' }} onClick={(e) => { handleTooltip(e, setShow2, true) }}><RxDotFilled cursor={"pointer"} color='#427ae3' onClick={() => { setLabel2("inf") }} onMouseEnter={() => setHover2("inf")} onMouseLeave={() => { setHover2("") }} /> <RxDotFilled cursor={"pointer"} color='#800080' onClick={() => { setLabel2("rec") }} onMouseEnter={() => setHover2("rec")} onMouseLeave={() => { setHover2("") }} /> <RxDotFilled cursor={"pointer"} color='#39c734' onClick={() => { setLabel2("pre") }} onMouseEnter={() => setHover2("pre")} onMouseLeave={() => { setHover2("") }} /></div>
                                <div>
                                    {/* <button className='btn btn-primary mb-2' onClick={() => setShow(!show)}>IPR</button> */}
                                    {hover2 == "inf" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-150px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Inferences
                                    </div>}
                                    {hover2 == "rec" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-200px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Recommendations
                                    </div>}
                                    {hover2 == "pre" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-150px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Predictions
                                    </div>}
                                    {show2 && <div className='card p-2' style={{ position: 'absolute', marginLeft: "-300px", marginTop: "-20px", zIndex: 9999, width: '250px' }}>
                                        {label2 === "inf" && <div>
                                            {getTitle("Inferences", "#427ae3", () => setShow2(false))}
                                            <>{inference?.length > 0 ? getData(inference, "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                        </div>}
                                        {label2 === "rec" && <div>
                                            {getTitle("Recommendations", "#800080", () => setShow2(false))}
                                            {data[2].recomondations?.length > 0 ? getData(data[2].recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                        </div>}
                                        {label2 === "pre" && <div className=''>
                                            {getTitle("Predictions", "#39c734", () => setShow2(false))}
                                            <>{prediction?.length > 0 ? getData(prediction, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex text-center justify-content-between p-2" style={{ background: "", alignItems: 'center' }}>
                            <div >
                                <h2 style={{ color: "#39c734" }}>{totalprod}%</h2>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h6 >Target</h6>
                                    <h6 style={{ color: 'black' }}>75%</h6>
                                </div>
                            </div>
                            <div>
                                <AreaChart options={aoptions3} series={finalDataprod} />
                                <div className="d-flex text-white justify-content-center" style={{ height: "50px", width: '100%', background: "#39c734", borderRadius: '8px', alignItems: 'center', fontSize: '18px' }} onMouseEnter={() => setIncHover(true)} onMouseLeave={() => { setIncHover(false) }}>
                                    <BiUpArrowAlt size={24} style={{ marginRight: "10px", marginTop: "2px" }} />  4%
                                    {incHover && <div className="card text-center p-1" style={{ width: '170px', height: '30px', position: 'absolute', display: "flex", justifyContent: "center", alignItems: 'center', marginLeft: '-30px', marginTop: '-20px' }}>
                                        4% increase MoM
                                    </div>}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
        }
    }

    return (
        <div>
            <div className="d-flex" style={{ display: 'flex', justifyContent: "space-between", width: '100%' }}>
                <div className=""
                    style={{
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'start',
                        marginRight: '10px',
                        marginTop: '5px',
                        padding: '10px'
                    }}
                >
                    <div className="me-2" style={{ display: "flex", alignItems: "center" }}>
                        <h2 style={{ fontSize: "14px", fontFamily: "poppins", marginTop: '7px', marginRight: "10px" }}>Data Source</h2>
                        <Select
                            styles={{
                                ...customStyles, container: provided => ({
                                    ...provided,
                                    minWidth: 200,
                                    maxWidth: 250,
                                    // zIndex: 9999999999,
                                    // Ensure the dropdown is rendered above other elements
                                }),
                            }}
                            components={animatedComponents}
                            onChange={handleChangeDS}
                            options={datasources}
                        />
                    </div>
                    {selectedDS?.value !== 'Manual' && <div style={{ display: 'flex' }}>
                        <div className="" style={{ display: "flex", alignItems: "center" }}>
                            <h2 style={{ fontSize: "14px", fontFamily: "poppins", marginTop: '7px', marginRight: "10px" }}>Industry</h2>
                            <Select
                                styles={{
                                    ...customStyles, container: provided => ({
                                        ...provided,
                                        minWidth: 200,
                                        maxWidth: 250,
                                        // zIndex: 9999999999,
                                        // Ensure the dropdown is rendered above other elements
                                    }),
                                }}
                                components={animatedComponents}
                                onChange={handleChangeOrg}
                                options={options}
                            />
                        </div>
                        <div className="d-flex">
                            <div className="" style={{ display: "flex", justifyContent: 'center', alignItems: "center", marginLeft: '10px' }}>
                                <h2 style={{ fontSize: "14px", fontFamily: "poppins", marginTop: '7px', marginRight: "10px" }}>KPI(s)</h2>
                                <Select
                                    styles={customStyles}
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    isMulti
                                    onChange={handleChangeKpi}
                                    options={kpidata}
                                />
                            </div>
                            <button
                                className=" ms-2 btn btn-primary"
                                lineHeight={'24px'}
                                height={'44px'}
                                style={{ fontSize: '12px' }}
                                // startIcon={<image src={upload} />}
                                children={'Filter'}
                                onClick={() => getFilterData()}
                            />
                        </div>
                    </div>}
                </div>
                {selectedDS?.value === "Manual" && <div className="d-flex">
                    <div className="p-3 ps-0 ms-2">
                        <button
                            className="btn btn-primary"
                            lineHeight={'24px'}
                            height={'44px'}
                            style={{ fontSize: '12px' }}
                            // startIcon={<image src={upload} />}
                            children={'Upload CSV File'}
                            onClick={() => handleButtonClick()}
                        />{' '}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            multiple={true}
                            accept="*"
                        />
                    </div>
                </div>}
            </div>
            <div className="row ms-1" style={{ minHeight: "100vh" }}>
                {apidata.length > 0 && <div className="row gx-1 gy-1 p-2 pt-0">
                    {apidata?.map((item) => {
                        if (item.name == "kpUnitsYTD.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpUnitsLost.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpPlantProd.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpUtilization.csv") {
                            return handleGetData(item.name, item.data)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpLostCause.csv") {
                            return handleGetData(item.name, item.data)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpUptime.csv") {
                            return handleGetData(item.name, item.data)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpThroughput.csv") {
                            return handleGetData(item.name, item.data)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpOpEx.csv") {
                            return handleGetData(item.name, item.data)
                        }
                    })}
                    <Popup {...{ showModal, setShowModal, headerTitle: title, children: getCharts()?.children, size: getCharts()?.size, fullscreen: getCharts()?.size == "xl" ? true : false, estimate: getCharts()?.estimate }} />
                </div>}
            </div>
        </div>
    )
}