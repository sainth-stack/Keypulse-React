import Chart from 'react-apexcharts'
// import { options } from './data'
export const Piechart = ({options}) => {
    return (
        <Chart options={options} series={options.series} type="donut" width={'65%'} />
    )
}