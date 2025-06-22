import React, { useState, useEffect } from 'react';
import { API_URL } from '../../const';
import axios from 'axios';
import './index.css';
const MissingValues = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user ID from localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id;

                const response = await axios.get(`${API_URL}/mvt`, {
                    headers: {
                        'X-User-ID': userId,
                    }
                });
                const sanitizedData = JSON.stringify(response.data).replace(
                    /NaN/g,
                    "0"
                );
                
                let cleanedData;
                try {
                    // First try to parse the sanitized data
                    const parsedOnce = JSON.parse(sanitizedData);
                    // Check if the result is a string that needs to be parsed again
                    if (typeof parsedOnce === 'string') {
                        cleanedData = JSON.parse(parsedOnce);
                    } else {
                        cleanedData = parsedOnce;
                    }
                    setData(cleanedData.df);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    // If parsing fails, use the original sanitized data
                    setData(response.data.df);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    console.log(data);

    const getColumns = () => {
        if (data.length === 0) return [];
        return Object.keys(data[0]);
    };

    return (
        <div className="p-4">
            <h1 className="page-title">Missing Values</h1>
            <div className="table-container">
                <table className="missing-values-table">
                    <thead>
                        <tr>
                            {getColumns().map((column, index) => (
                                <th key={index}>
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {getColumns().map((column, colIndex) => (
                                    <td 
                                        key={colIndex} 
                                        className={row[column].is_imputed === "True" ? "imputed" : ""}
                                    >
                                        {row[column].value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MissingValues;