import { getLabels } from "../Sustainability/apiData"

export const prodThroughputData = (data) => {
    const finalData = [{
        name: 'Robotic Arm',
        data: data.filter((item) => item.name == "Robotic Arm")[0].data
    }, {
        name: 'Roller Belts',
        data: data.filter((item) => item.name == "Roller Belts")[0].data
    }, {
        name: 'Boilers',
        data: data.filter((item) => item.name == "Boilers")[0].data
    },
    {
        name: 'Chillers',
        data: data.filter((item) => item.name == "Chillers")[0].data
    }]
    return finalData
}

export const prodOpexData = (data) => {
    let finalData = {
        labels: getLabels(data),
        datasets: [
            {
                label: 'Robotic Arm',
                data: data.filter((item) => item.name == "Robotic Arm")[0].data,
                borderColor: '#1b3c7a',
                backgroundColor: '#1b3c7a',
            },
            {
                label: 'Roller Belts',
                data: data.filter((item) => item.name == "Roller Belts")[0].data,
                borderColor: '#427ae3',
                backgroundColor: '#427ae3',
            },
            {
                label: 'Boilers',
                data: data.filter((item) => item.name == "Boilers")[0].data,
                borderColor: '#3dc7d1',
                backgroundColor: '#3dc7d1',
            },
            {
                label: 'Chillers',
                data: data.filter((item) => item.name == "Chillers")[0].data,
                borderColor: '#faa93e',
                backgroundColor: '#faa93e',
            },
        ],
    }
    return finalData
}

export const utilizationData = (data) => {

    function calculatePercentages(numbers) {
        const totalSum = numbers.reduce((sum, num) => sum + num, 0);
        return (totalSum / (numbers.length * 100)) * 100;
    }

    let series1 = [{
        name: 'Robotic Arm',
        data: [calculatePercentages(data.filter((item) => item.name == "Robotic Arm")[0].data)]
    }, {
        name: 'Roller Belts',
        data: [calculatePercentages(data.filter((item) => item.name == "Roller Belts")[0].data)]
    }, {
        name: 'Boilers',
        data: [calculatePercentages(data.filter((item) => item.name == "Boilers")[0].data)]
    },
    {
        name: 'Chillers',
        data: [calculatePercentages(data.filter((item) => item.name == "Chillers")[0].data)]
    }]
    return series1
}


export const lostUnitsdata = (data) => {
    function calculatePercentages(numbers) {
        const totalSum = numbers.reduce((sum, num) => sum + num, 0);
        return (totalSum / (numbers.length * 100)) * 100;
    }
    let finalData = [calculatePercentages(data.filter((item) => item.name == "Tooling Error")[0].data), calculatePercentages(data.filter((item) => item.name == "Physical Damage")[0].data), calculatePercentages(data.filter((item) => item.name == "Opener Damage")[0].data), calculatePercentages(data.filter((item) => item.name == "Others")[0].data)]
    console.log(finalData)
    return finalData
}

export const upTimeData = (data) => {
    let finalData = {
        labels: getLabels(data),
        datasets: [
            {
                label: 'Robotic Arm',
                data: data.filter((item) => item.name == "Robotic Arm")[0].data,
                borderColor: '#1b3c7a',
                backgroundColor: '#1b3c7a',
            },
            {
                label: 'Roller Belts',
                data: data.filter((item) => item.name == "Roller Belts")[0].data,
                borderColor: '#427ae3',
                backgroundColor: '#427ae3',
            },
            {
                label: 'Boilers',
                data: data.filter((item) => item.name == "Boilers")[0].data,
                borderColor: '#3dc7d1',
                backgroundColor: '#3dc7d1',
            },
            {
                label: 'Chillers',
                data: data.filter((item) => item.name == "Chillers")[0].data,
                borderColor: '#faa93e',
                backgroundColor: '#faa93e',
            },
        ],
    }
    return finalData
}

export const unitsYTDData = (data) => {
    const aseries = [{
        type: 'area',
        name: 'series1',
        data: data[0].data.map((item) => {
            return (
                parseInt(item)
            )
        })
    }]
    let count = 0
    data[0].data.filter((item) => {
        count = count + parseInt(item)
    })
    return { total: count, finalData: aseries }
}

export const unitsLostData = (data) => {
    const aseries = [{
        type: 'area',
        name: 'series1',
        data: data[0].data
    }]
    const tot = data[0].data.reduce((partialSum, a) => partialSum + a, 0) / (data[0].data.length * 100) * 100
    return { totallost: tot.toFixed(1), finalDatalost: aseries }
}

export const unitsProdData = (data) => {
    const aseries = [{
        type: 'area',
        name: 'series1',
        data: data[0].data
    }]
    const tot = data[0].data.reduce((partialSum, a) => partialSum + a, 0) / (data[0].data.length * 100) * 100
    return { totalprod: tot.toFixed(1), finalDataprod: aseries }
}