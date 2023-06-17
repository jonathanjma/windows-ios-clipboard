const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {Storage} = require('@google-cloud/storage');
const {log, error} = require('firebase-functions/logger')
const {getDatabase} = require("firebase-admin/database");

const express = require('express')
const authMiddleware = require('./authMiddleware')
const {processForm} = require("./uploadMiddleware");
const mime = require("mime")

// https://cloud.google.com/nodejs/docs/reference/storage/latest
// https://github.com/googleapis/nodejs-storage/blob/main/samples/uploadFromMemory.js
// https://firebase.google.com/docs/functions/2nd-gen-upgrade

admin.initializeApp()
const storage = new Storage();
const bucketName = 'win-ios-clipboard.appspot.com'

const app = express()
app.use(authMiddleware);

app.get('/', async (req, res) => {
    res.status(200).send(
        {'name': 'Windows-iOS Clipboard', 'version': '3.0', 'author': 'Jonathan Ma'}
    )
})

app.get('/get', async (req, res) => {
    let username = req.user['email'] // set by authMiddleware
    log(username + ' getting clipboard')

    let query = await getDatabase().ref('/users').orderByChild('email').equalTo(username)
    query.on('child_added', async childObj => {
        let userData = childObj.toJSON()
        if (!userData['file']) {
            return res.status(200).send({'value': userData['value']})
        } else {
            const contents = await storage.bucket(bucketName).file(req.user['uid']).download();
            console.log(contents)
            res.set('Content-Type', mime.getType(userData['value'].split('.')[1]))
            res.status(200).send(contents[0])
        }
    })
})

app.post('/push', processForm, async (req, res) => {
    let username = req.user['email']
    log(username + ' pushing to clipboard')

    console.log(req.headers["content-type"])
    console.log(req.files, req.body)

    let textValue = req.body['value']
    if (textValue !== undefined) {
        let query = await getDatabase().ref('/users').orderByChild('email').equalTo(username)
        query.on('child_added', childObj => {
            childObj.ref.update({
                'file': false,
                'value': textValue
            }, (error) => {
                if (error) {
                    return res.status(500).send('Data could not be saved.' + error);
                } else {
                    return res.status(200).send({'value': textValue});
                }
            })
        })
    } else if (req.files.length !== 0) {
        let file = req.files[0]
        console.log(file)

        await storage.bucket(bucketName).file(req.user['uid']).save(file['buffer'])
            .catch((e) => {
                console.log(e);
                return res.status(500).send('file upload failed');
            });

        let query = await getDatabase().ref('/users').orderByChild('email').equalTo(username)
        query.on('child_added', childObj => {
            childObj.ref.update({
                'file': true,
                'value': file['originalname']
            }, (error) => {
                if (error) {
                    return res.status(500).send('Data could not be saved.' + error);
                } else {
                    return res.status(200).send({'value': file['originalname']});
                }
            })
        })
    } else {
        return res.status(400).send('Value is required.')
    }
})

exports.api = functions.https.onRequest(app)