import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
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
        text: 'UpTime',
        color: 'black',
        fontWeight: 700,
        padding: 50,
        font: {
          size: 20,
          family: 'Poppins'
        }
      },
      grid: {
        display: false,
      }
    },
    y: {
      title: {
        display: true,
        text: 'Throughput',
        color: 'black',
        fontWeight: 700,
        padding: 50,
        font: {
          size: 20,
          family: 'Poppins'
        }
      },
      grid: {
        display: false
      }
    }
  }
};

// export const data = {
//     labels,
//     datasets: [
//         {
//             label: 'Dataset 1',
//             data: [10, 30, 40, 15],
//             borderColor: 'rgb(255, 99, 132)',
//             backgroundColor: 'rgba(255, 99, 132, 0.5)',
//         },
//         {
//             label: 'Dataset 2',
//             data: [15, 20, 10, 17],
//             borderColor: 'rgb(53, 162, 235)',
//             backgroundColor: 'rgba(53, 162, 235, 0.5)',
//         },
//         {
//             label: 'Dataset 2',
//             data: [10, 9, 10, 17],
//             borderColor: 'lightblue',
//             backgroundColor: 'rgba(53, 162, 235, 0.5)',
//         },
//         {
//             label: 'Dataset 2',
//             data: [12, 2, 20, 33],
//             borderColor: 'lightgreen',
//             backgroundColor: 'rgba(53, 162, 235, 0.5)',
//         },
//     ],
// };
const labels4 = ['05-08-2023', '05-08-2023', '06-08-2023', '07-08-2023', '08-08-2023', '09-08-2023', '010-08-2023']
const data4 = {
  labels: labels4,
  datasets: [
    {
      label: 'data',
      data: [0, 20, 16, 15, 35, 21, 32],
      borderColor: 'lightblue',
      backgroundColor: 'darkblue',
    },
  ],
};
export function StackChart(props) {
  return <Line options={options} data={data4} style={{marginTop:'80px',marginRight:'20px'}}/>;
}