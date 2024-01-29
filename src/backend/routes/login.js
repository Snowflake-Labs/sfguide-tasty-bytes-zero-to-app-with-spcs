const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
var auth = require('../auth')
var sql_queries = require('../sql')
var snowflake = require('../connect.js')

router.get("/authorize", async (req, res) => {

    console.log('Authorize with request headers:')
    if (!req.headers['sf-context-current-user']) {
        res.status(422).send("Incorrect data");
        return
    }

    const login_user = req.headers['sf-context-current-user']
    console.log(`Authorizing user ${login_user} from context header`);
    auth.lookupUser(login_user).then(result => {
        if (result.result === true) {            
            console.log('Authorizing user ' + result.user_name + ' for franchise: ' + result.franchise_id);
            const accessToken = auth.generateAccessToken({ user: result.user_name, franchise: result.franchise_id, preauthorized: true });
            const refreshToken = auth.generateRefreshToken({ user: result.user_name, franchise: result.franchise_id, preauthorized: true });
            res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
            return
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
});

router.post("/login", async (req, res) => {

    console.log(req.body);
    if (!req.body.name || !req.body.password) {
        res.status(422).send("Incorrect data")
        return
    }

    const login_user = req.body.name
    const login_password = req.body.password

    auth.lookupUser(login_user).then(result => {
        if (result.result === true) {
            console.log('Authenticating user ' + result.user_name + ' for franchise: ' + result.franchise_id);
            bcrypt.compare(login_password, result.hashed_password, function (err, result) {
                if (err) {
                    console.log('Failed to check password for: ' + login_user + ' - ' + err.message)
                    res.status(401).json('Invalid user or password')
                    return
                }
                if (result) {
                    console.log('Successful login, generating token for: ' + user_name + ', franchise: ' + franchise_id)
                    const accessToken = auth.generateAccessToken({ user: req.body.name, franchise: franchise_id, preauthorized: false })
                    const refreshToken = auth.generateRefreshToken({ user: req.body.name, franchise: franchise_id, preauthorized: false })
                    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken })
                    return
                }
                console.log('Incorrect password for user: ' + login_user)
                res.status(401).json('Invalid user or password')
                return
            });
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
});

router.post("/refresh", (req, res) => {
    if (!req.body.token)
        res.status(422).send("Incorrect data")
    if (!auth.refreshTokens.includes(req.body.token))
        res.status(400).send("Refresh Token Invalid")
    auth.refreshTokens = auth.refreshTokens.filter((c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = auth.generateAccessToken({ user: req.body.token.user, franchise: req.body.token.franchise })
    const refreshToken = auth.generateRefreshToken({ user: req.body.token.user, franchise: req.body.token.franchise })
    //generate new accessToken and refreshTokens
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
});

module.exports = router;