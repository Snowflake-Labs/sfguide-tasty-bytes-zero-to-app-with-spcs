/**************************************
 * 
 * franchise_all.js
 * 
 * This file contains the remaining endpoints 
 * fully built out. 
 * 
 **************************************/
const express = require("express");
const router = express.Router();

const auth = require('../auth')
const utils = require('../utils')
var snowflake = require('../connect.js')
var sql_queries = require('../sql')

function fullUrl(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

router.get('/:franchise/', auth.validateAccess, async (req, res) => {
    console.log(req.method + ': ' + req.path);
    const franchise = req.params.franchise

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.trucks_by_franchise,
        binds: [franchise],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve order data', err);
                res.status(500).json({ error: 'Unable to retrieve order data' });
            } else {
                data = rows[0];
                res.status(200).json(data);
            }
        },
    }));
});

router.get('/:franchise/revenue/:year(\\d{4})', auth.validateAccess, async (req, res) => {
    const franchise = req.params.franchise;
    const year = req.params.year;

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.ytd_revenue_by_country,
        binds: [franchise, year],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve order data', err);
                res.status(500).json({ error: 'Unable to retrieve order data' });
            } else {
                res.json(rows);
            }
        },
    }));
});

router.get('/:franchise/trucks/', auth.validateAccess, async (req, res) => {
    const franchise = req.params.franchise;
    const startdate = utils.parseDate(req.query.start) ?? utils.defaultStartDate();
    const enddate = utils.parseDate(req.query.end) ?? utils.defaultEndDate();

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.top_10_trucks,
        binds: [franchise, startdate, enddate],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve order data', err);
                res.status(500).json({ error: 'Unable to retrieve order data' });
            } else {
                res.json(rows);
            }
        },
    }));
});


router.get('/:franchise/trucks/:truckbrandname/sales_dayofweek', auth.validateAccess, async (req, res) => {
    const franchise = req.params.franchise;
    const truckbrandname = req.params.truckbrandname
    const startdate = utils.parseDate(req.query.start) ?? utils.defaultStartDate();
    const enddate = utils.parseDate(req.query.end) ?? utils.defaultEndDate();

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.sales_by_day_of_week,
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


router.get('/:franchise/trucks/:truckbrandname/sales_topitems_dayofweek', auth.validateAccess, async (req, res) => {
    const franchise = req.params.franchise;
    const truckbrandname = req.params.truckbrandname
    const startdate = utils.parseDate(req.query.start) ?? utils.defaultStartDate();
    const enddate = utils.parseDate(req.query.end) ?? utils.defaultEndDate();

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.top_selling_items_by_day_of_week,
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

router.get('/:franchise/trucks/:truckbrandname/locations', auth.validateAccess, async (req, res) => {
    const franchise = req.params.franchise;
    const truckbrandname = req.params.truckbrandname
    const startdate = utils.parseDate(req.query.start) ?? utils.defaultStartDate();
    const enddate = utils.parseDate(req.query.end) ?? utils.defaultEndDate();

    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.best_cities_by_day_ofweek,
        binds: [franchise, startdate, enddate, truckbrandname],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve order data', err);
                res.status(500).json({ error: 'Unable to retrieve order data' });
            } else {
                res.json(rows);
            }
        },
    }));
});

module.exports = router;