/**************************************
 * 
 * user.js
 * 
 * This file contains a convenience
 * method to generate a new user and a
 * hashed password for that user to be
 * stored in the database. It is not
 * needed to complete the lab as there
 * is already 3 pregenerated users with
 * passwords set up in Lab 3.
 * 
 * To generate a user with this module,
 * run `npm run create_user USER_NAME 
 * FRANCHISE_ID PASSWORD`
 * 
 **************************************/
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');
var sql_queries = require('./sql')
const bcrypt = require('bcrypt')
const connection = require('../connect')

async function createUser(user_name, franchise, password) {

    console.log('U: ' + user_name + ', f:' + franchise + ', p:' + password)

    const hashedPassword = await bcrypt.hash(password, 10)

    connection.execute({
        sqlText: sql_queries.insert_user,
        binds: [user_name, hashedPassword, franchise],
        complete: (err, stmt, rows) => {
            if (err) {
                console.error('Unable to save user', err);                
            } else {
                console.log("Successfully created user " + user_name)
            }
        },
    });
}

user = Object.fromEntries(process.argv.map(x => x.split('=')).filter(x => x.length>1))
createUser(user.user_name, user.franchise, user.password)

