/**************************************
 * 
 * franchise.js
 * 
 * This file contains the endpoints that
 * should be built out with parsing the 
 * parameters and sending bound SQL queries
 * using the connection
 * 
 **************************************/
const express = require("express");
const router = express.Router();

const auth = require('../auth')
const utils = require('../utils')
var snowflake = require('../connect.js')
var sql_queries = require('../sql')

router.get('/:franchise/countries/', async (req, res) => {
    // 4.3.2 Parse parameters and connect to Snowflake a return query response    
    const franchise = req.params.franchise
    const startdate = utils.parseDate(req.query.start) ?? utils.defaultStartDate();
    const enddate = utils.parseDate(req.query.end) ?? utils.defaultEndDate();

    console.log('start: ' + startdate + ', end: ' + enddate);

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.top_10_countries,
        binds: [franchise, startdate, enddate],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve order data', err);
                res.status(500).json({ error: 'Unable to retrieve order data' });
            } else {
                res.status(200).json(rows);
            }
        },
    }));
});


router.get('/:franchise/trucks/:truckbrandname/sales_topitems', async (req, res) => {
    const franchise = req.params.franchise;
    const truckbrandname = req.params.truckbrandname
    const startdate = utils.parseDate(req.query.start) ?? utils.defaultStartDate();
    const enddate = utils.parseDate(req.query.end) ?? utils.defaultEndDate();

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.top_selling_items_by_truck,
        binds: [franchise, startdate, enddate, truckbrandname],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve sales data', err);
                res.status(500).json({ error: 'Unable to retrieve sales data' });
            } else {
                res.json(rows);
            }
        },
    }));
});

module.exports = router;