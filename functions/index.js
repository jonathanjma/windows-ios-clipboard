const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {Storage} = require('@google-cloud/storage');
const {getDatabase} = require("firebase-admin/database");

const express = require('express')
const authMiddleware = require('./authMiddleware')
const formMiddleware = require("./formMiddleware");
const mime = require("mime")

// https://cloud.google.com/nodejs/docs/reference/storage/latest
// https://github.com/googleapis/nodejs-storage/blob/main/samples/uploadFromMemory.js
// https://firebase.google.com/docs/functions/2nd-gen-upgrade

admin.initializeApp()
const storage = new Storage();
const bucketName = 'win-ios-clipboard.appspot.com'

const app = express()

// Get API info endpoint
app.get('/', async (req, res) => {
    res.status(200).send(
        {'name': 'Windows-iOS Clipboard', 'version': '3.0', 'author': 'Jonathan Ma'}
    )
})

// Paste clipboard content endpoint
app.get('/paste', authMiddleware, async (req, res) => {
    let [email, uid] = [req.user['email'], req.user['uid']] // set by authMiddleware
    console.log(uid + ' getting clipboard')

    // get user data from database
    let query = await getDatabase().ref('/users').orderByChild('email').equalTo(email)
    query.on('child_added', async childObj => {
        let userData = childObj.toJSON()
        // determine whether to return text value or file
        if (!userData['file']) {
            return res.status(200).send({'value': userData['value']})
        } else {
            // download file from Storage
            const contents = await storage.bucket(bucketName).file(uid).download();
            // set MIME type using file extension
            res.set('Content-Type', mime.getType(userData['value'].split('.')[1]))
            res.status(200).send(contents[0])
        }
    })
})

// Copy clipboard content endpoint
app.post('/copy', authMiddleware, formMiddleware, async (req, res) => {
    let [email, uid] = [req.user['email'], req.user['uid']] // set by authMiddleware
    console.log(uid + ' getting clipboard')

    // helper function for updating stored value in database
    const updateDb = async (value, file) => {
        let query = await getDatabase().ref('/users').orderByChild('email').equalTo(email)
        query.on('child_added', childObj => {
            childObj.ref.update({
                'file': file,
                'value': value
            }, (error) => {
                if (error) {
                    return res.status(500).send('Data could not be saved.' + error);
                } else {
                    return res.status(200).send({'value': value});
                }
            })
        })
    }

    // prioritize text value over file if both are sent
    let textValue = req.body['value']
    if (textValue !== undefined) {
        await updateDb(textValue, false)
    } else if (req.files.length !== 0) {
        let file = req.files[0]
        console.log(file)

        // upload file to Storage using the user's ID as the filename
        await storage.bucket(bucketName).file(uid).save(file['buffer'])
            .catch((e) => {
                console.log(e);
                return res.status(500).send('File upload failed.');
            });

        // update db with name of stored file
        await updateDb(file['fileName'], true)
    } else {
        // if no text value or file sent
        return res.status(400).send('Value is required.')
    }
})

exports.api = functions.https.onRequest(app)