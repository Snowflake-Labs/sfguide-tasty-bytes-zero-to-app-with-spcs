/**************************************
 * 
 * auth.js
 * 
 * Contains Node Express middleware to
 * validate a JWT token passed in to a
 * header for a request.
 * Also contains methods to generate
 * Access and Refresh Tokens that are
 * passed to the users after login
 * 
 **************************************/
const jwt = require("jsonwebtoken")
var snowflake = require('./connect.js')
var sql_queries = require('./sql')

function lookupUser(user_name) {
    return new Promise(async function (result, error) {
        snowflake.getConnection().then(conn =>
            conn.execute({
                sqlText: sql_queries.verify_user,
                binds: [user_name],
                complete: (err, stmt, rows) => {
                    if (err) {
                        error({result: false, message: 'Unable to lookup user', error:err});
                    } else {
                        if (rows.length == 0) {
                            result({message: 'User does not exist'});
                        } else {
                            user_row = rows[0]
                            user_name = user_row.USER_NAME;
                            franchise_id = user_row.FRANCHISE_ID;
                            hashed_password = user_row.HASHED_PASSWORD;
                            data = {result: true, validation: 'Snowflake', user_name: user_name, franchise_id: franchise_id, hashed_password: hashed_password };
                            result(data);
                        }
                    }
                },
            }));
    });
}

function validateJWTToken(req, res, next) {
    //get token from request header
    const authHeader = req.headers["authorization"]
    if (authHeader) {
        const token = authHeader.split(" ")[1]
        //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
        if (token == null) res.status(400).send("Token not present")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.status(403).send("Auth Token invalid");
            }
            else {
                req.user = user;
                next();
            }
        });
    } else {
        res.status(400).send("Auth header not present - expecting JWT bearer token")
    }
};

function validateSnowflakeHeader(req, res, next) {

    if (!req.headers['sf-context-current-user']) {
        console.warn('Validation mode is Snowflake but sf-context-current-user header is missing - user is not validated');
        res.status(422).send("Incorrect data");
        return
    }

    const login_user = req.headers['sf-context-current-user']
    console.log('sf-context-current-user: ' + login_user);
    lookupUser(login_user).then(result => {
        if (result.result === true){
            console.log('Authorizing user ' + result.user_name + ' for franchise: ' + result.franchise_id);
            req.user = { validation: 'Snowflake', user: result.user_name, franchise: result.franchise_id };
            next();
        } else {
            console.warn('User does not exist: ' + login_user);
            res.status(401).json('Invalid user or password');
            return
        }
    }, error => {
        console.error(error.message, error.error);
        res.status(500).json({ error: error.message });
        return
    });
};

function validateDevAccss(req, res, next) {
    if (req.user && req.user.franchise) {
        console.log('Development mode: accepting user "' + process.env.DEV_AUTH_USER + '" from environment variables with franchise ' + process.env.DEV_AUTH_FRANCHISE);
        req.user = { validation: 'dev', user: process.env.DEV_AUTH_USER, franchise: process.env.DEV_AUTH_FRANCHISE };
        next();
    }
    else {
        console.error('Development mode, but no user is set in ENV variables. Set DEV_AUTH_USER and DEV_AUTH_FRANCHISE. Defaulting to user "user1" and franchise "1".');
        req.user = { validation: 'dev', user: 'user1', franchise: 1 };
        next();

    }
};


module.exports = {

    refreshTokens: [],

    // accessTokens
    generateAccessToken: function (user) {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "360m" })
    },

    // refreshTokens
    generateRefreshToken: function (user) {
        const refreshToken =
            jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20m" })
        this.refreshTokens.push(refreshToken)
        return refreshToken
    },


    validateToken: function (req, res, next) {
        let clientValidation = "";
        if (process.env.CLIENT_VALIDATION){
            clientValidation = process.env.CLIENT_VALIDATION.toUpperCase();
        }
        if (clientValidation === 'JWT') {
            validateJWTToken(req, res, next);
        } else if (clientValidation === 'SNOWFLAKE') {
            validateSnowflakeHeader(req, res, next);
        }
        else if (clientValidation === 'DEV') {
            validateDevAccss(req, res, next);
        }
        else {
            // No validation, we don't validate anything
            console.warn('No validation enabled for service, calls are not validated')
            req.user = { validation: 'none' };
            next();
        }
    },

    validateAccess: function (req, res, next) {

        if (req.user.validation === 'none') {
            next();
        }
        else {
            if (req.user && req.user.franchise) {
                const franchise = req.params.franchise
                if (franchise == req.user.franchise) {
                    res.franchise = req.user.franchise
                    next()
                } else if (franchise == undefined) {
                    next()
                }
                else {
                    res.status(403).json({ error: 'Unauthorized' })
                }
            }
            else {
                res.status(403).json({ error: 'Unauthorized' });
            }
        }
    },

    lookupUser: lookupUser,
};
