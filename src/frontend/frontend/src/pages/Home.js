import React, { useEffect } from 'react';
import './Home.css';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/esm/Button';
// eslint-disable-next-line
import Spinner from 'react-bootstrap/esm/Spinner';
import { useNavigate, useLocation } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { useState } from "react";
// eslint-disable-next-line
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { LineChart, Line, Legend } from 'recharts';
import {tickFormater, labelFormatter, lineColors, getFilterDates, formatDate, getRequestOptions, enableLogin} from '../Utils.js'


const backendURL = process.env.REACT_APP_BACKEND_SERVICE_URL;

function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    function fetchFranchise() {
        const url = `${backendURL}/franchise/${franchise}`;
        fetch(url, getRequestOptions(location.state))
            .then((result) => result.json())
                .then((data) => {
                    setTrucks(data.TRUCK_BRAND_NAMES);
                    setToDate(formatDate(new Date(data.END_DATE)));
                    setFromDate(formatDate(new Date(data.START_DATE)));
            })
    }

    // Add your code here for Lab 6, section 6.3 (6.3.6)
    function fetchTop10Trucks() {
        const url = `${backendURL}/franchise/${franchise}/trucks?start=${fromDate}&end=${toDate}`;
        fetch(url, getRequestOptions(location.state))
            .then((result) => result.json())
                .then((data) => {
                    setTop10Trucks(data)
                    let t = [];

                    for (let i=0; i<data.length; i++) {
                        t.push(data[i].TRUCK_BRAND_NAME);
                    }
                    setTrucks(t);
            })
    }

    function fetchYTDRevenue() {
        let monthsArr = [];
        const startYear = fromDate.substring(0,4);
        const url = `${backendURL}/franchise/${franchise}/revenue/${startYear}`;
        fetch(url, getRequestOptions(location.state))
            .then((result) => result.json())
                .then((data1) => {
                    for (let i=0; i<data1.length; i++) {
                        if (!countriesArr.includes(data1[i].COUNTRY.replace(" ", "_"))) {
                            countriesArr.push(data1[i].COUNTRY.replace(" ", "_"));
                        }
                        if (!monthsArr.includes(data1[i].DATE)) {
                            monthsArr.push(parseInt(data1[i].DATE));
                        }
                    }
                    let tr = [];
                    monthsArr.sort(function(a, b){return a-b});
                    for (let m=0; m<monthsArr.length; m++) {
                        let a = {};
                        a["Month"] = monthsArr[m];

                        for (let i=0; i<data1.length; i++) {
                            if (monthsArr[m] === data1[i].DATE) {
                                a[data1[i].COUNTRY.replace(" ", "_")] = data1[i].REVENUE;
                            }
                        } 
                        tr.push(a);                     
                    }
                    setYTDRevenue(tr);
                    setCountriesA([]);
                    let countriesAA = [];
                    for (let ii=0; ii<countriesArr.length; ii++) {
                        const cn = {name: countriesArr[ii], color: lineColors[ii]};
                        countriesAA.push(cn);
                    }
                    setCountriesA(countriesAA);
                    
        })
    }
    
    // eslint-disable-next-line
    useEffect(() => {

        fetchFranchise();

        if (location.state.hasOwnProperty('fromDate')) {
            setFromDate(location.state.fromDate);
        }
        if (location.state.hasOwnProperty('toDate')) {
            setToDate(location.state.toDate);
        }    

        fetchYTDRevenue();
        // Add fetchTop10Countries function reference for Lab 6, section 6.3 (6.3.3)
        fetchTop10Countries();

        // Add fetchTop10Trucks function reference for Lab 6, section 6.3 (6.3.7)
        fetchTop10Trucks();

        // eslint-disable-next-line react-hooks/exhaustive-deps -- Do not delete this line.
    }, [])

    function applyFilter() {
        fetchTop10Countries();
        fetchTop10Trucks();
        fetchYTDRevenue();
    }

    // Add your code here for Lab 6, section 6.3 (6.3.9)
    function gotoDetails() {
        navigate('/details', {
            state: {
                franchise: franchise, 
                truck_brand_name: top10Trucks[0]['TRUCK_BRAND_NAME'], 
                fromDate: fromDate, 
                toDate:toDate, 
                trucks: trucks, 
                accessToken: location.state.accessToken, 
                refreshToken: location.state.refreshToken
            }
        });
    }    

    function logout() {
        navigate("/login");
    }

    // Add your code here for Lab 6, section 6.3 (6.3.2)
    function fetchTop10Countries() {
        const url = `${backendURL}/franchise/${franchise}/countries?start=${fromDate}&end=${toDate}`;
        fetch(url, getRequestOptions(location.state))
            .then((result) => result.json())
                .then((data) => {
                    setTop10Countries(data)
        })
    }
    const franchise = location.state.franchise;

    let dates = getFilterDates(new Date(), new Date("2022-01-01"), new Date("2023-01-01"));
    let initialToDate =  dates[1];
    let initialFromDate =  dates[0];

    const [toDate, setToDate] = useState(initialToDate);
    let [fromDate, setFromDate] = useState(initialFromDate);
    let [ytdRevenue, setYTDRevenue] = useState([]);
    let [countriesA, setCountriesA] = useState([]);
    let countriesArr = [];
    // Insert top10Countries variable for Lab 6 Section 6.3 (6.3.1)
    let [top10Countries, setTop10Countries] = useState([]);

    // Insert top10Trucks and trucks variables for Lab 6 Section 6.3 (6.3.5)
    let [top10Trucks, setTop10Trucks] = useState([]); //used to hold Sales of the Top 10 Trucks
    let [trucks, setTrucks] = useState([]); // used to hold unique Trucks brands.

    return (
        <div>
            <div className='home-header'>
                <Image src='bug-sno-R-blue.png' className='homeLogo' />
                <h1 className="homeTitle"> Tasty App</h1>

                <Button className='backBtn' onClick={gotoDetails}>  🚚 Truck Details</Button>
                { enableLogin() &&
                    <Button className='home-logoutBtn' onClick={logout}>⎋ Logout</Button>
                }
            </div>

            <div className='home-breadcrumbs'>
                <Image src='filters-icon.png' className='home-filtersLogo' />

                <div className='home-breadcrumb-capsule'>
                    Franchise Name <b>{location.state.franchise}</b>
                </div>

                <Form>
                    <Form.Group className="mb-3 dateGroup" controlId="fromDate">
                        <Form.Label className='dateLabel'>
                            <span className='dateSpan'>Date From</span>
                            <Form.Control type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </Form.Label>

                        <Form.Label className='dateLabel'>
                            <span className='dateSpan'>Date To</span>
                            <Form.Control type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </Form.Label>

                        <Button onClick={applyFilter}> Apply</Button>
                    </Form.Group>
                </Form>

            </div>

            
            {/* Charts. */}
            <div className='homerow'>
                
                <div className='row1col'>
                    <div className='colHeader'>
                        Top 10 Countries
                    </div>
                    <div className='homecol'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout='vertical'
                                width={700}
                                height={0}
                                data={top10Countries}
                                margin={{top: 15, right: 15, left: 25, bottom: 5,}}>
                                <XAxis type="number" dataKey="REVENUE" tickFormatter={tickFormater}>
                                </XAxis>                            
                                <YAxis type="category" dataKey="COUNTRY">
                                </YAxis>
                                <Tooltip formatter={(value) => 'US$'+(new Intl.NumberFormat('en').format(value))} />
                                <Bar dataKey="REVENUE" fill="#548bf2">
                                    <LabelList dataKey="REVENUE" position="insideRight" fill='white' formatter={labelFormatter} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className='row1col'>
                    <div className='colHeader'>
                        Top 10 Trucks
                    </div>
                    <div className='homecol'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout='horizontal'
                                width={700}
                                height={0}
                                data={top10Trucks}
                                margin={{top: 15, right: 15, left: 25, bottom: 5,}}>
                                <XAxis type="category" dataKey="TRUCK_BRAND_NAME" />
                                <YAxis type="number" dataKey="REVENUE"  tickFormatter={tickFormater} />                       
                                <Tooltip formatter={(value) => 'US$'+(new Intl.NumberFormat('en').format(value))} />
                                <Bar dataKey="REVENUE" fill="#548bf2">
                                    <LabelList dataKey="REVENUE" position="top" fill='grey' formatter={labelFormatter} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className='homerow'>
                
                <div className='row2col'>
                    <div className='colHeader'>
                        YTD Revenue By Country
                        {countriesA.length===0 &&
                            <div>
                                <small>No data found for year {fromDate.substring(0,4)}, set another start year in the filter</small>
                            </div>
                        }
                    </div>
                    <div className='homecol'>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                            width={500}
                            height={300}
                            data={ytdRevenue}
                            margin={{top: 5, right: 30, left: 20, bottom: 5,}}>
                            <XAxis dataKey="Month" />
                            <YAxis  tickFormatter={tickFormater} />
                            <Tooltip formatter={(value) => 'US$'+(new Intl.NumberFormat('en').format(value))} />
                            <Legend verticalAlign="top" align="center" />
                            {
                                countriesA.map(
                                    (c) => {
                                        return <Line type="monotone" key={c.name} dataKey={c.name} stroke={c.color} strokeWidth={2} activeDot={{ r: 8 }} />
                                    }
                                )
                            }
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;