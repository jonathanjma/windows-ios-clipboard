const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {log, error} = require('firebase-functions/lib/logger');

const express = require('express');
const authMiddleware = require('./authMiddleware');

/*
https://stackoverflow.com/questions/66688858/use-headers-and-basic-authentication-in-python-requests
https://imgur.com/a/msGAhWW (shortcuts)
*/

admin.initializeApp();

const app = express();
app.use(authMiddleware);

app.post('/api', async (req, res) => {
    res.status(200).send(
        {'name': 'Windows-iOS Clipboard', 'version': '2.0', 'author': 'Jonathan Ma'}
    );
})

app.post('/get', async (req, res) => {
    let username = req.user['email'].split('@')[0]
    log(username)

    admin.database().ref('/' + username).get().then(data => {
        res.status(200).send(
            {'latest_value': data.exists() ? data.val()['latest_value'] : ''}
        )
    });
});

app.post('/push', async (req, res) => {
    let username = req.user['email'].split('@')[0]
    let value_in = req.body.value
    log(username, value_in)

    admin.database().ref('/' + username).set({
        latest_value: value_in
    }).then(() => {
        res.status(200).send({'latest_value': value_in});
    });
});

exports.api = functions.https.onRequest(app);