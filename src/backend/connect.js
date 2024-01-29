/**************************************
 * 
 * connect.js
 * 
 * This file set's up the connection to
 * Snowflake using the environment var-
 * iables from the .env file
 * 
 **************************************/
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');
const fs = require('fs');

// Enable environment variables in .env file
dotenv.config()

var connection;

function getOptions() {
    const options = {
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    };

    if (fs.existsSync('/snowflake/session/token')) {
        options.token = fs.readFileSync('/snowflake/session/token', 'ascii');
        options.authenticator = "OAUTH";
        options.account = process.env.SNOWFLAKE_ACCOUNT;
        options.accessUrl = 'https://' + process.env.SNOWFLAKE_HOST;
    } else {
        options.account = process.env.SNOWFLAKE_ACCOUNT;
        options.username = process.env.SNOWFLAKE_USERNAME;
        options.role = process.env.SNOWFLAKE_ROLE;
        options.password = process.env.SNOWFLAKE_PASSWORD;
    };

    return options;
}

function getConnection(forceReconnect = false) {
    return new Promise(async function (connected, error) {

        if (connection && !forceReconnect) {
            const isConnectionValid = await connection.isValidAsync();
            if (isConnectionValid) {
                connected(connection);
                return
            }
        }

        console.log('Creating new connection to Snowflake');
        const options = getOptions();
        connection = snowflake.createConnection(options);
        connection.connect((err, conn) => {
            if (err) {
                console.error('Unable to connect to Snowflake', err);
                error(err);
            } else {
                console.log('Connected to Snowflake account ' + options.account + ', id: ' + conn.getId());
                connected(connection);
            }
        });
    });
};

module.exports = { getConnection };