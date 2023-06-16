const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {log, error} = require('firebase-functions/logger')

const express = require('express')
const authMiddleware = require('./authMiddleware')

admin.initializeApp()

const app = express()
app.use(authMiddleware)

app.get('/', async (req, res) => {
    res.status(200).send(
        {'name': 'Windows-iOS Clipboard', 'version': '3.0', 'author': 'Jonathan Ma'}
    )
})

app.get('/get', async (req, res) => {
    let username = req.user['email']
    log(username + ' getting clipboard')

    let query = await getDatabase().ref('/users').orderByChild('email').equalTo(username)
    query.on('child_added', dataObj => {
        let userData = dataObj.toJSON()
        return res.status(200).send({'value': userData['value']})
    })
})

app.post('/push', async (req, res) => {
    let username = req.user['email']
    log(username + ' pushing to clipboard')

    console.log(req.headers["content-type"])

    let new_value = req.body['value']
    if (new_value === undefined) {
        return res.status(400).send('Value is required.')
    }

    let query = await getDatabase().ref('/users').orderByChild('email').equalTo(username)
    query.on('child_added', dataObj => {
        dataObj.ref.update({
            'value': new_value
        }, (error) => {
            if (error) {
                return res.status(500).send('Data could not be saved.' + error);
            } else {
                return res.status(200).send({'value': new_value});
            }
        })
    })
})

exports.api = functions.https.onRequest(app)