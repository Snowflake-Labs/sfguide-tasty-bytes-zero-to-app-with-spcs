/**************************************
 * 
 * app.js
 * 
 * Main Node Express app file that sets
 * up the server, defines the routes and
 * adds additional routes defined in files
 * from /routes folder
 * 
 **************************************/
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
var snowflake = require('./connect.js')
var sql_queries = require('./sql')

// Helpers for parsing dates and loggin requests
var utils = require('./utils')

const login = require('./routes/login.js')


console.log('Starting up Node Express, build version 00014')

// Create a new Express app
const app = express();

// Enable environment variables in .env file
dotenv.config()

// 4.5.1 add CORS to the app
cors_origin = process.env.CORS_ADDRESS ?? 'http://localhost:3001';
if (cors_origin){
    app.use(cors({
        origin: [cors_origin]
    }));
}

port = process.env.PORT ?? 3000
app.listen(port, () => {
    console.log('Server running on port ' + port);
    console.log('Environment: ' + app.get('env'));
    if (cors_origin)
        console.log('CORS origin allowed: ' + cors_origin);
    console.log('Client validation: ' + process.env.CLIENT_VALIDATION);
    console.log('Using warehouse: ' + process.env.SNOWFLAKE_WAREHOUSE);
    console.log('Using role: ' + process.env.SNOWFLAKE_ROLE);
});

// Add additional middleware (json response output, request logging )
app.use(express.json())
app.use(utils.logRequest);

// 4.4.2 Add helpers for authenetication and tokens
var auth = require('./auth')

// 4.4.3 Add routes for login
app.use("/", login);

// 4.4.4 Add validation of tokens to each route
app.use(auth.validateToken);

// Definition of first route
app.get("/", async (req, res, next) => {
    console.log(req.method + ': ' + req.path);
    // 4.2.3 Connect to Snowflake and return query result
    snowflake.getConnection().then(conn => 
        conn.execute({
        sqlText: sql_queries.all_franchise_names,
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to retrieve franchises', err);
                res.status(500).json({ error: 'Unable to retrieve franchises' });
            } else {
                res.status(200).json(rows);
            }
        },
    }));
});

app.get("/debug", (req, res, next) => {
    console.log("/test => route on API");

    const sf_context_current_user = req.headers['sf-context-current-user'];
    const sf_oauth_token = require('fs').existsSync('/snowflake/session/token');
    const test_data = {
        "Header sf-context-current-user": sf_context_current_user,
        "Snowflake OAuth token": sf_oauth_token
    }
    res.status(200).json(test_data);
});

app.get("/reconnect", async function (req, res, next) {
    console.log("/closeconn => route on API");
    let connection = await snowflake.getConnection().then(async conn => {
        let isConnectionValid = await conn.isValidAsync();
        console.log('Is the connection valid? - ' + isConnectionValid)

        conn.destroy(async function (err, conn) {
            if (err) {
                isConnectionValid = await conn.isValidAsync();
                console.error('Unable to disconnect: ' + err.message);
                res.status(500).json({connectionId:conn.getId(), isValid: isConnectionValid});
            } else {
                isConnectionValid = await conn.isValidAsync();
                console.log('Disconnected connection with id: ' + conn.getId());
                res.status(200).json({connectionId:conn.getId(), isValid: isConnectionValid});
            }
        });
    });
});

// 4.3.1 Add franchise routes
const franchise = require('./routes/franchise.js')
app.use("/franchise", franchise);

// 4.3.6 Add remaining franchise routes
const franchise_all = require('./routes/franchise_all.js')
app.use("/franchise", franchise_all);