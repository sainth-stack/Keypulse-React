import { heading, roptions } from './data'
import { useState, useEffect, useRef } from 'react'
import { ApexChart } from "../../components/ApexBarChart"
import { getTitle, getData, customStyles } from '../../utils'
import { RxDotFilled } from 'react-icons/rx'
import cyber from '../../assets/svg/cyber.png'
import vulner from '../../assets/svg/vulnar.png'
import inci from '../../assets/svg/incident.png'
import config from '../../assets/svg/config.png'
import risk from '../../assets/svg/risks.png'
import train from '../../assets/svg/train.png'
import cont from '../../assets/svg/conti.png'
import com from '../../assets/svg/commun.png'
import ser from '../../assets/svg/service.png'
import build from '../../assets/svg/build.png'
import axios from 'axios'
import { namesResSort, getApiData } from './data'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Popup } from "../../components/Popup"
import { InnerResiliance } from './InnerResiliance'
const ADAPTERS_BASE_URL = process.env.REACT_APP_BASE_URL;

export const Resilience = () => {
    const [second, setSecond] = useState(false)
    const [first, setFirst] = useState(false)
    const [title, setTitle] = useState("")
    const [selData, setSelData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const animatedComponents = makeAnimated();
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [manualData, setManualData] = useState(false)
    const [selectedDS, setSelectedDS] = useState(null);

    const handleChangeOrg = (selectedOption) => {
        setSelectedOrg(selectedOption);
    };

    const handleChangeKpi = (selectedOption) => {
        setSelectedKpi(selectedOption);
    };
    const handleChangeDS = (selectedOption) => {
        setSelectedDS(selectedOption);
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
    const Card = ({ img, text, series, data }) => {
        const [show, setShow] = useState(false)
        const [label, setLabel] = useState("")
        const [hover, setHover] = useState("")
        const handleClose = (e) => {
            // e.stopPropagation();
            setShow(false)
        }
        const handleTooltip = (e, setfunc, showVal) => {
            e.stopPropagation();
            setfunc(showVal)
        }
        return (
            <div className='ps-4 pe-4 pt-3' style={{ border: "2px solid #E6E6E6", borderRadius: '0px', alignItems: 'center' }}>
                <div className='d-flex justify-content-between' >
                    <h5 style={{ fontFamily: "Inter", fontSize: '18px', fontWeight: 600, height: '50px', marginBottom: '0px', width: "220px" }}>{text}</h5>
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
                                    {getTitle("Inferences", "#427ae3", handleClose)}
                                    <>{data.inference?.length > 0 ? getData(data.inference[0], "#427ae3") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Inferences Found!</li>}</>
                                </div>}
                                {label === "rec" && <div>
                                    {getTitle("Recommendations", "#800080", handleClose)}
                                    {data.recomondations?.length > 0 ? getData(data.recomondations, "#800080") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Recommendations Found!</li>}

                                </div>}
                                {label === "pre" && <div className=''>
                                    {getTitle("Predictions", "#39c734", handleClose)}
                                    <>{data.predictions?.length > 0 ? getData(data?.predictions, "#39c734") : <li className='m-0 p-0' style={{ fontFamily: "poppins", fontWeight: 400, fontSize: '12px', width: '190px', listStyle: 'none' }}>No Predictions Found!</li>}</>
                                </div>}
                            </div>}
                        </div>
                    </div>
                </div>
                <div className='d-flex justify-content-between' style={{ alignItems: 'center' }}>
                    <img src={img} alt="img" height={"100px"} className='mt-0' />
                    <div style={{ position: 'relative', }}>
                        <ApexChart series={series} options={roptions} width={"100%"} />
                    </div>
                </div>
            </div>
        )
    }

    const handlePopup = (e, title, data) => {
        e.stopPropagation();
        setShowModal(true)
        setTitle(title)
        setSelData(data)
    }



    const [apidata, setApiData] = useState([])
    // const [apidata2, setApiData2] = useState([])
    const fetchData = async () => {
        try {
            await axios.get(`${ADAPTERS_BASE_URL}/resilience/getData`).then((response) => {
                setApiData(response?.data.result);
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
            setSecond(false)
            setFirst(false)
        } else if (selectedDS?.value === 'Manual') {
            setApiData([])
            setSecond(false)
            setFirst(false)
            if (manualData) {
                fetchData()
            }
        }
    }, [selectedDS, manualData])

    const fileInputRef = useRef(null); // Explicit type
    const handleFileChange = (event) => {
        handleUpload(event.target.files)
    };
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const downloadData = async () => {
        console.log(selectedKpi)
        const list = selectedKpi.map((item) => item.value)
        try {
            await axios.get(`${ADAPTERS_BASE_URL}/resilience/download/organization=${selectedOrg.value}/list=${list.toString()}`).then((response) => {
                //    const data = JSON.parse(response?.data?.replace(/\bNaN\b/g, "null"));
                const data = response?.data
                // console.log(JSON.parse(data))
                setApiData(data.result);
            });
        } catch (err) {
            console.log(err)
        }
    }


    const kpidata = [
        { label: 'Cyber Security Policy Creation and Distribution', value: 'kpCSP.csv' },
        { label: 'Risk Management Initiatives', value: 'kpRMI.csv' },
        { label: 'Cyber Security Training', value: 'kpCST.csv' },
        { label: 'Vulnerability Management Reviews', value: 'kpVMR.csv' },
        { label: 'Continuity Supervision Meetings', value: 'kpCSM.csv' },
        { label: 'Mock BCP Drills', value: 'kpBCP.csv' },
        { label: 'Incident Management', value: 'kpIM.csv' },
        { label: 'Continuity of Service and Management (Post Facto)', value: 'kpPF.csv' },
        { label: 'Configuration and Change Management', value: 'kpCCM.csv' },
        { label: 'Communications', value: 'kpCOMM.csv' }
    ]

    const getFilterData = () => {
        // const filterData = apidata.filter((item) => {
        //     return selectedKpi.filter((child) => child.value === item.name).length > 0
        // })
        // setApiData2(filterData)
        downloadData()
    }

    const handleUpload = async (data) => {
        var formData = new FormData();
        const finalData = []
        for (let i = 0; i < data.length; i++) {
            finalData.push(data[i])
        }
        const uploadData = []
        namesResSort.map(sortingObj => {
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
            await axios.post(`${ADAPTERS_BASE_URL}/resilience/FileUpload`, formData)
                .then((response) => {
                    fetchData()
                    setManualData(true)
                });
        } catch (err) {
            console.log(err)
        }
    }

    let datan = {
        data1: apidata?.filter((item) => item.name === "kpCSP.csv") || [],
        data2: apidata?.filter((item) => item.name === "kpRMI.csv") || [],
        data3: apidata?.filter((item) => item.name === "kpCST.csv") || [],
        data4: apidata?.filter((item) => item.name === "kpVMR.csv") || [],
        data5: apidata?.filter((item) => item.name === "kpCSM.csv") || [],
        data6: apidata?.filter((item) => item.name === "kpBCP.csv") || [],
        data7: apidata?.filter((item) => item.name === "kpIM.csv") || [],
        data8: apidata?.filter((item) => item.name === "kpPF.csv") || [],
        data9: apidata?.filter((item) => item.name === "kpCCM.csv") || [],
        data10: apidata?.filter((item) => item.name === "kpCOMM.csv") || []
    }

    let finalData = {
        data1: getApiData(datan.data1) || [],
        data2: getApiData(datan.data2) || [],
        data3: getApiData(datan.data3) || [],
        data4: getApiData(datan.data4) || [],
        data5: getApiData(datan.data5) || [],
        data6: getApiData(datan.data6) || [],
        data7: getApiData(datan.data7) || [],
        data8: getApiData(datan.data8) || [],
        data9: getApiData(datan.data9) || [],
        data10: getApiData(datan.data10) || []
    }
    const data = [
        {
            img: cyber,
            name: "Cyber Security Policy Creation and Distribution",
            series: [{
                name: 'Planned',
                data: finalData.data1
            }],
            inference: [datan?.data1[0]?.inference],
            recomondations: ["Adhere to planned activities"],
            predictions: [datan?.data1[0]?.predictions],
            fullData: datan.data1
        },
        {
            img: risk,
            name: "Risk Management Initiatives",
            series: [{
                name: 'Planned',
                data: finalData.data2
            }],
            inference: [datan?.data2[0]?.inference],
            recomondations: ["Make up missed/lost activities"],
            predictions: [datan?.data2[0]?.predictions],
            fullData: datan.data2
        },
        {
            img: train,
            name: "Cyber Security Training",
            series: [{
                name: 'Planned',
                data: finalData.data3
            }],
            inference: [datan?.data3[0]?.inference],
            recomondations: ["Adhere to planned activities"],
            predictions: [datan?.data3[0]?.predictions],
            fullData: datan.data3
        },
        {
            img: vulner,
            name: "Vulnerability Management Reviews",
            series: [{
                name: 'Planned',
                data: finalData.data4
            }],
            inference: [datan?.data4[0]?.inference],
            recomondations: ["Make up missed/lost activities"],
            predictions: [datan?.data4[0]?.predictions],
            fullData: datan.data4
        },
        {
            img: cont,
            name: "Continuity Supervision Meetings",
            series: [{
                name: 'Planned',
                data: finalData.data5
            }],
            inference: [datan?.data5[0]?.inference],
            recomondations: ["Adhere to planned activities"],
            predictions: [datan?.data5[0]?.predictions],
            fullData: datan.data5
        },
        ({
            img: build,
            name: "Mock BCP Drills",
            series: [{
                name: 'Planned',
                data: finalData.data6
            }],
            inference: [datan?.data6[0]?.inference],
            recomondations: ["Make up missed/lost activities"],
            predictions: [datan?.data6[0]?.predictions],
            fullData: datan.data6
        }),
        ({
            img: inci,
            name: "Incident Management",
            series: [{
                name: 'Occurred',
                data: finalData.data7
            }],
            inference: [datan?.data7[0]?.inference],
            recomondations: ["Keep up Good work"],
            predictions: [datan?.data7[0]?.predictions],
            fullData: datan.data7
        }),
        ({
            img: ser,
            name: "Continuity of Service and Management (Post Facto)",
            series: [{
                name: 'Occurred',
                data: finalData.data8
            }],
            inference: [datan?.data8[0]?.inference],
            recomondations: ["Keep up Good work"],
            predictions: [datan?.data8[0]?.predictions],
            fullData: datan.data8
        }),
        ({
            img: config,
            name: "Configuration and Change Management",
            series: [{
                name: 'Planned',
                data: finalData.data9
            }],
            inference: [datan?.data9[0]?.inference],
            recomondations: ["Adhere to planned activities"],
            predictions: [datan?.data9[0]?.predictions],
            fullData: datan.data9
        }),
        ({
            img: com,
            name: "Communications",
            series: [{
                name: 'Planned',
                data: finalData.data10
            }],
            inference: [datan?.data10[0]?.inference],
            recomondations: ["Adhere to planned activities"],
            predictions: [datan?.data10[0]?.predictions],
            fullData: datan.data10
        })
    ]

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
            <div className="p-1 m-1" style={{ minHeight: "100vh" }}>
                <div className='row gy-2 gx-3 mt-2' >
                    {first && heading.map((item, index) => {
                        return (
                            <>{index < 2 && <div className="col-lg-6 col-md-6 col-sm-6">
                                <div style={{ background: '#34b4eb', fontFamily: "Inter" }} className='pt-2 pb-2 text-center text-white'>
                                    {/* <span className='lightcolor' style={{ position: 'absolute', left: 300 }}>{item.num}</span> */}
                                    <h3 className='text-center mt-2' style={{ fontSize: '22px' }}>{item.name}</h3>
                                </div>
                            </div>}</>
                        )
                    })}
                </div>
                <div className="row gy-3 gx-3 mt-2">
                    {data.map((item, index) => {
                        if ((item.series[0].data.length > 0 && index < 6) && !first) {
                            setFirst(true)
                        }
                        return (
                            <>{(item.series[0].data.length > 0 && index < 6) && <div className='col-lg-6 col-md-6 col-sm-6 cursor-pointer' style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, item.name, item.fullData)}>
                                <Card img={item.img} text={item.name} series={item.series} data={item} />
                            </div>}</>
                        )
                    })}
                </div>
                <div className='row gy-2 gx-3 mt-2 flex-wrap'>
                    {second && heading.map((item, index) => {
                        return (
                            <>{index >= 2 && <div className="col-lg-6 col-md-6 col-sm-6">
                                <div style={{ background: '#34b4eb', fontFamily: "Inter" }} className='pt-2 pb-2 text-center text-white'>
                                    {/* <span className='lightcolor' style={{ position: 'absolute', left: 300 }}>{item.num}</span> */}
                                    <h3 className='text-center mt-2' style={{ fontSize: '22px' }}>{item.name}</h3>
                                </div>
                            </div>}</>
                        )
                    })}
                </div>
                <div className="row gy-3 gx-3 mt-2">
                    {data.map((item, index) => {
                        if ((item.series[0].data.length > 0 && index > 5) && !second) {
                            setSecond(true)
                        }
                        return (
                            <>{(item.series[0].data.length > 0 && index > 5) && <div className='col-lg-6 col-md-6 col-sm-6' style={{ cursor: "pointer" }} onClick={(e) => handlePopup(e, item.name, item.fullData)}>
                                <Card img={item.img} text={item.name} series={item.series} data={item} />
                            </div>}</>
                        )
                    })}
                </div>
                <Popup {...{ showModal, setShowModal, headerTitle: title, children: <InnerResiliance {...{ selData }} />, size: "lg", fullscreen: false }} />
            </div>
        </div>

    )
}