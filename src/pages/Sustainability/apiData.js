export const namesSusSort = [
    { file: "kpEnergy.csv", id: 1 },
    { file: "kpWaste.csv", id: 2 },
    { file: "kpPlantation.csv", id: 3 },
    { file: "kpWater.csv", id: 4 },
    { file: "kpAltEnergy.csv", id: 5 },
    { file: "kpco2.csv", id: 6 },
]
const getData = (data) => {
    const finalData = data[0].data.map((item, index) => {
        return {
            x: data[0].label[index].substring(0, 3),
            y: item,
            color: "#00D8FF",
        }
    })
    return finalData
}

export const energyData = (data) => {
    function calculatePercentages(numbers) {
        return numbers.reduce((partialSum, a) => partialSum + a, 0)
    }
    let finalData = [
        {
            name: 'Actual',
            data: [
                {
                    x: 'Robotic Arm',
                    y: calculatePercentages(data[0].data),
                    color: "#41B883",
                },
                {
                    x: 'Roller Belts',
                    y: calculatePercentages(data[1].data),
                    color: "#00D8FF",
                },
                {
                    x: 'Boilers',
                    y: calculatePercentages(data[2].data),
                    color: "#00D8FF",
                },
                {
                    x: 'Chillers',
                    y: calculatePercentages(data[3].data),
                    color: "#00D8FF",
                }
            ]
        }
    ]
    return finalData
}

export const wasteData = (data) => {
    function calculatePercentages(numbers) {
        return numbers.reduce((partialSum, a) => partialSum + a, 0)
    }
    let finalData = [
        {
            name: 'Actual',
            data: [
                {
                    x: 'Miscelleneous',
                    y: calculatePercentages(data[0].data),
                    color: "#41B883",
                },
                {
                    x: 'General',
                    y: calculatePercentages(data[1].data),
                    color: "#00D8FF",
                },
                {
                    x: 'Recyclable',
                    y: calculatePercentages(data[2].data),
                    color: "#00D8FF",
                },
                {
                    x: 'critical',
                    y: calculatePercentages(data[3].data),
                    color: "#00D8FF",
                },
                {
                    x: 'waste',
                    y: calculatePercentages(data[4].data),
                    color: "#00D8FF",
                }
            ]
        }
    ]
    return finalData
}

export const waterData = (data) => {
    function calculatePercentages(numbers) {
        return numbers.reduce((partialSum, a) => partialSum + a, 0)
    }
    let finalData = [
        {
            name: 'Actual',
            data: [
                {
                    x: ["Robotic", "Arm"],
                    y: calculatePercentages(data[0].data),
                    color: "#41B883",
                },
                {
                    x: ['Roller', 'Belts'],
                    y: calculatePercentages(data[1].data),
                    color: "#00D8FF",
                },
                {
                    x: ['Boilers'],
                    y: calculatePercentages(data[2].data),
                    color: "#00D8FF",
                },
                {
                    x: ['Chillers'],
                    y: calculatePercentages(data[3].data),
                    color: "#00D8FF",
                }
            ]
        }
    ]
    return finalData
}


export const plantationData = (data) => {
    const finalData = [
        {
            name: 'Actual',
            data: getData(data)
        }
    ]
    console.log(finalData)
    return finalData
}

export const altEnergyData = (data) => {
    const finalData = [data[0].data.reduce((partialSum, a) => partialSum + a, 0), data[1].data.reduce((partialSum, a) => partialSum + a, 0)]
    return finalData
}

export const getLabels = (data) => {
    const finalData = data[0].data.map((item, index) => {
        return data[0].label[index].substring(0, 3)
    })
    return finalData
}
export const co2Data = (data) => {
    const finalData = {
        labels: getLabels(data),
        datasets: [
            {
                label: 'CO2',
                data: data[0].data,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };
    return finalData
}