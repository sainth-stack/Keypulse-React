import { ApexChart } from "../../components/ApexBarChart"
import { options1, series1, options2, series2, dounut1, options3, series3, dounut2, seriesplantation, optionsplantation, data } from "./data"
import PieChart from "../../components/PieChart"
import { LineChart } from "../../components/LineChart"
import { useState, useEffect, useRef } from "react"
import { getTitle, getData, customStyles } from "../../utils"
import { RxDotFilled } from 'react-icons/rx'
import { altEnergyData, co2Data, energyData, namesSusSort, plantationData, wasteData, waterData } from "./apiData"
import axios from 'axios'
import { Popup } from "../../components/Popup"
import { InnerEnergy } from "./innerSustainability/energy"
import { InnerWaste } from "./innerSustainability/waste"
import { InnerWater } from "./innerSustainability/water"
import { InnerAltEnergy } from "./innerSustainability/alternate-energy"
import { InnerCO2Emmision } from "./innerSustainability/co2emmision"
import { InnerPlantation } from "./innerSustainability/plantation"
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const ADAPTERS_BASE_URL = process.env.REACT_APP_BASE_URL;

export const Sustainability = () => {
    const [show, setShow] = useState(false)
    const [show1, setShow1] = useState(false)
    const [show2, setShow2] = useState(false)
    const [show3, setShow3] = useState(false)
    const [show4, setShow4] = useState(false)
    const [show5, setShow5] = useState(false)
    const [label, setLabel] = useState("")
    const [label1, setLabel1] = useState("")
    const [label2, setLabel2] = useState("")
    const [label3, setLabel3] = useState("")
    const [label4, setLabel4] = useState("")
    const [label5, setLabel5] = useState("")
    const [hover, setHover] = useState("")
    const [hover1, setHover1] = useState("")
    const [hover2, setHover2] = useState("")
    const [hover3, setHover3] = useState("")
    const [hover4, setHover4] = useState("")
    const [hover5, setHover5] = useState("")
    const [apidata, setApiData] = useState([])
    const [apidata2, setApiData2] = useState([])
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
            await axios.get(`${ADAPTERS_BASE_URL}/sustainability/getData`).then((response) => {
                // console.log(response.data)
                // const data = JSON.parse(response?.data)
                // const data = response?.data
                // console.log(JSON.parse(data))
                setApiData(response?.data.result);
            });
        } catch (err) {
            console.log(err)
        }
    }

    const downloadData = async () => {
        console.log(selectedKpi)
        const list = selectedKpi.map((item) => item.value)
        try {
            await axios.get(`${ADAPTERS_BASE_URL}/sustainability/download/organization=${selectedOrg.value}/list=${list.toString()}`).then((response) => {
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




    const fileInputRef = useRef(null); // Explicit type
    const [file, setFile] = useState([])

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
        for (let i = 0; i < data?.length; i++) {
            finalData.push(data[i])
        }
        const uploadData = []
        namesSusSort.map(sortingObj => {
            finalData.filter((item) => {
                if (item.name == sortingObj.file) {
                    uploadData.push(item)
                }
            })
        });

        for (let i = 0; i < uploadData?.length; i++) {
            formData.append('file', uploadData[i]);
        }
        try {
            await axios.post(`${ADAPTERS_BASE_URL}/sustainability/FileUpload`, formData)
                .then((response) => {
                    setManualData(true)
                    fetchData()
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
        label: "Energy (KWH)", value: "kpEnergy.csv", children: <InnerEnergy {...{ selData }} />, size: "xl", estimate: false,
    },
    {
        label: "Waste (Tons)", value: "kpWaste.csv", children: <InnerWaste {...{ selData }} />, size: "xl", estimate: true
    },
    {
        label: "Plantation", value: "kpPlantation.csv", children: <InnerPlantation {...{ selData }} />, size: "lg", estimate: false
    },
    {
        label: "Water (Kilolitres)", value: "kpWater.csv", children: <InnerWater {...{ selData }} />, size: "xl", estimate: false
    },
    {
        label: "Alternate Energy", value: "kpAltEnergy.csv", children: <InnerAltEnergy {...{ selData }} />, size: "xl", estimate: false
    },
    {
        label: "CO2 Emission", value: "kpco2.csv", children: <InnerCO2Emmision {...{ selData }} />, size: "lg", estimate: true
    }
    ]

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
            case 'kpEnergy.csv':
                return <div className="col-4">
                    <div style={{ border: '1px solid #E6E6E6', padding: '2px', margin: '5px 0px 5px 5px', cursor: "pointer" }} onClick={(e) => handlePopup(e, "Energy (KWH)", data5)}>
                        <div className="d-flex justify-content-between">
                            <h6 style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Energy {" (KWH)"}</h6>
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
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <ApexChart series={energyData(data5)} options={options1} height={"250px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpWaste.csv':
                return <div className="col-4">
                    <div style={{ border: '1px solid #E6E6E6', padding: '2px', margin: '5px 0px 5px 5px', cursor: 'pointer' }} onClick={(e) => handlePopup(e, "Waste (Tons)", data5)}>
                        <div className="d-flex justify-content-between">
                            <h6 style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Waste {"(Tons)"}</h6>
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
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <ApexChart series={wasteData(data5)} options={options2} height={"250px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpPlantation.csv':
                return <div className="col-4">
                    <div style={{ border: '1px solid #E6E6E6', padding: '2px', margin: '5px 0px 5px 5px', cursor: 'pointer' }} onClick={(e) => handlePopup(e, "Plantation", data5)}>
                        <div className="d-flex justify-content-between">
                            <h6 style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Plantation</h6>
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
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <ApexChart series={plantationData(data5)} options={optionsplantation} height={"250px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpWater.csv':
                return <div className="col-4">
                    <div style={{ border: '1px solid #E6E6E6', padding: '2px', margin: '5px 0px 5px 5px', cursor: "pointer" }} onClick={(e) => handlePopup(e, "Water (Kilolitres)", data5)}>
                        <div className="d-flex justify-content-between">
                            <h6 style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Water {" (Kilolitres)"}</h6>
                            <div style={{ height: '20px', justifyContent: 'space-around', display: "flex", alignItems: "center", width: "45px", borderRadius: "50px" }}>
                                <div style={{ display: "flex", justifyContent: 'start' }} onClick={(e) => { handleTooltip(e, setShow3, true) }}><RxDotFilled cursor={"pointer"} color='#427ae3' onClick={() => { setLabel3("inf") }} onMouseEnter={() => setHover3("inf")} onMouseLeave={() => { setHover3("") }} /> <RxDotFilled cursor={"pointer"} color='#800080' onClick={() => { setLabel3("rec") }} onMouseEnter={() => setHover3("rec")} onMouseLeave={() => { setHover3("") }} /> <RxDotFilled cursor={"pointer"} color='#39c734' onClick={() => { setLabel3("pre") }} onMouseEnter={() => setHover3("pre")} onMouseLeave={() => { setHover3("") }} /></div>
                                <div>
                                    {/* <button className='btn btn-primary mb-2' onClick={() => setShow(!show)}>IPR</button> */}
                                    {hover3 == "inf" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-150px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Inferences
                                    </div>}
                                    {hover3 == "rec" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-200px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Recommendations
                                    </div>}
                                    {hover3 == "pre" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-150px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Predictions
                                    </div>}
                                    {show3 && <div className='card p-2' style={{ position: 'absolute', marginLeft: "-300px", marginTop: "-20px", zIndex: 9999, width: '250px' }}>
                                        {label3 === "inf" && <div>
                                            {getTitle("Inferences", "#427ae3", () => setShow3(false))}
                                            <>{inference?.length > 0 ? getData(inference, "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                        </div>}
                                        {label3 === "rec" && <div>
                                            {getTitle("Recommendations", "#800080", () => setShow3(false))}
                                            {data[3].recomondations?.length > 0 ? getData(data[3].recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                        </div>}
                                        {label3 === "pre" && <div className=''>
                                            {getTitle("Predictions", "#39c734", () => setShow3(false))}
                                            <>{prediction?.length > 0 ? getData(prediction, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <ApexChart series={waterData(data5)} options={options3} height={"250px"} width={"100%"} />
                        </div>
                    </div>
                </div>
            case 'kpAltEnergy.csv':
                return <div className="col-4">
                    <div style={{ border: '1px solid #E6E6E6', padding: '2px', margin: '5px 0px 5px 5px', cursor: "pointer" }} onClick={(e) => handlePopup(e, "Alternate Energy", data5)}>
                        <div className="d-flex justify-content-between">
                            <h6 style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>Alternate Energy</h6>
                            <div style={{ height: '20px', justifyContent: 'space-around', display: "flex", alignItems: "center", width: "45px", borderRadius: "50px" }}>
                                <div style={{ display: "flex", justifyContent: 'start' }} onClick={(e) => { handleTooltip(e, setShow4, true) }}><RxDotFilled cursor={"pointer"} color='#427ae3' onClick={() => { setLabel4("inf") }} onMouseEnter={() => setHover4("inf")} onMouseLeave={() => { setHover4("") }} /> <RxDotFilled cursor={"pointer"} color='#800080' onClick={() => { setLabel4("rec") }} onMouseEnter={() => setHover4("rec")} onMouseLeave={() => { setHover4("") }} /> <RxDotFilled cursor={"pointer"} color='#39c734' onClick={() => { setLabel4("pre") }} onMouseEnter={() => setHover4("pre")} onMouseLeave={() => { setHover4("") }} /></div>
                                <div>
                                    {/* <button className='btn btn-primary mb-2' onClick={() => setShow(!show)}>IPR</button> */}
                                    {hover4 == "inf" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Inferences
                                    </div>}
                                    {hover4 == "rec" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Recommendations
                                    </div>}
                                    {hover4 == "pre" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "0px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Predictions
                                    </div>}
                                    {show4 && <div className='card p-2' style={{ position: 'absolute', marginLeft: "-300px", marginTop: "-20px", zIndex: 9999, width: '250px' }}>
                                        {label4 === "inf" && <div>
                                            {getTitle("Inferences", "#427ae3", () => setShow4(false))}
                                            <>{inference?.length > 0 ? getData(inference, "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                        </div>}
                                        {label4 === "rec" && <div>
                                            {getTitle("Recommendations", "#800080", () => setShow4(false))}
                                            {data[4].recomondations?.length > 0 ? getData(data[4].recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                        </div>}
                                        {label4 === "pre" && <div className=''>
                                            {getTitle("Predictions", "#39c734", () => setShow4(false))}
                                            <>{prediction?.length > 0 ? getData(prediction, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div style={{ minHeight: "265px", maxHeight: "260px", width: "100%" }}>
                            <PieChart options={dounut1} series={altEnergyData(data5)} width={"100%"} height={"280px"} />
                        </div>
                    </div>
                </div>
            case 'kpco2.csv':
                return <div className="col-4">
                    <div style={{ border: '1px solid #E6E6E6', padding: '2px', margin: '5px 0px 5px 5px', cursor: "pointer" }} onClick={(e) => handlePopup(e, "CO2 Emission", data5)}>
                        <div className="d-flex justify-content-between">
                            <h6 style={{ fontFamily: "poppins", fontWeight: 500, fontSize: '18px', fontWeight: 600, display: 'flex', justifyContent: "start" }}>CO2 Emission</h6>
                            <div style={{ height: '20px', justifyContent: 'space-around', display: "flex", alignItems: "center", width: "45px", borderRadius: "50px" }}>
                                <div style={{ display: "flex", justifyContent: 'start' }} onClick={(e) => { handleTooltip(e, setShow5, true) }}><RxDotFilled cursor={"pointer"} color='#427ae3' onClick={() => { setLabel5("inf") }} onMouseEnter={() => setHover5("inf")} onMouseLeave={() => { setHover5("") }} /> <RxDotFilled cursor={"pointer"} color='#800080' onClick={() => { setLabel5("rec") }} onMouseEnter={() => setHover5("rec")} onMouseLeave={() => { setHover5("") }} /> <RxDotFilled cursor={"pointer"} color='#39c734' onClick={() => { setLabel5("pre") }} onMouseEnter={() => setHover5("pre")} onMouseLeave={() => { setHover5("") }} /></div>
                                <div>
                                    {/* <button className='btn btn-primary mb-2' onClick={() => setShow(!show)}>IPR</button> */}
                                    {hover5 == "inf" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-150px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Inferences
                                    </div>}
                                    {hover5 == "rec" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-200px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Recommendations
                                    </div>}
                                    {hover5 == "pre" && <div className='card p-1' style={{ position: 'absolute', marginLeft: "-150px", marginTop: "-20px", zIndex: 9999, alignItems: 'center' }}>
                                        Predictions
                                    </div>}
                                    {show5 && <div className='card p-2' style={{ position: 'absolute', marginLeft: "-300px", marginTop: "-20px", zIndex: 9999, width: '250px' }}>
                                        {label5 === "inf" && <div>
                                            {getTitle("Inferences", "#427ae3", () => setShow5(false))}
                                            <>{inference?.length > 0 ? getData(inference, "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                        </div>}
                                        {label5 === "rec" && <div>
                                            {getTitle("Recommendations", "#800080", () => setShow5(false))}
                                            {data[5].recomondations?.length > 0 ? getData(data[5].recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                        </div>}
                                        {label5 === "pre" && <div className=''>
                                            {getTitle("Predictions", "#39c734", () => setShow5(false))}
                                            <>{prediction?.length > 0 ? getData(prediction, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div style={{ minHeight: "265px", maxHeight: "265px", width: "100%" }}>
                            <LineChart height={"260px"} width={"100%"} data={co2Data(data5)} />
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
            <div className="row ms-1" style={{ minHeight: "80vh" }}>
                {apidata?.length > 0 && <div className="row gx-1 gy-1 p-2 pt-0">
                    {apidata?.map((item) => {
                        if (item.name == "kpEnergy.csv") {
                            console.log(item)
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpWaste.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpPlantation.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpWater.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    {apidata?.map((item) => {
                        if (item.name == "kpAltEnergy.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}

                    {apidata?.map((item) => {
                        if (item.name == "kpco2.csv") {
                            return handleGetData(item.name, item.data, item.inference, item.predictions)
                        }
                    })}
                    <Popup {...{ showModal, setShowModal, headerTitle: title, children: getCharts()?.children, size: getCharts()?.size, fullscreen: getCharts()?.size == "xl" ? true : false, estimate: getCharts()?.estimate }} />
                </div>}

            </div>
        </div>
    )
}
