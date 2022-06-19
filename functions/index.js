const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {log, error} = require('firebase-functions/lib/logger')

const express = require('express')
const authMiddleware = require('./authMiddleware')

admin.initializeApp()

const app = express()
app.use(authMiddleware)

app.post('/api', async (req, res) => {
    res.status(200).send(
        {'name': 'Windows-iOS Clipboard', 'version': '2.0', 'author': 'Jonathan Ma'}
    )
})

app.post('/get', async (req, res) => {
    let username = req.user['email']
    log(username + ' getting clipboard')

    admin.database().ref('/users').orderByChild('email').equalTo(username).on('child_added', data => {
        res.status(200).send(
            {'latest_value': data.exists() ? data.val()['latest_value'] : ''}
        )
    })
})

app.post('/push', async (req, res) => {
    let username = req.user['email']
    let value_in = req.body.value
    log(username + ' pushing to clipboard')

    admin.database().ref('/users').orderByChild('email').equalTo(username).on('child_added', data => {
        data.getRef().child('latest_value').set(value_in)
            .then(() => res.status(200).send({'latest_value': value_in}))
    })
})

exports.api = functions.https.onRequest(app)