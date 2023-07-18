const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {Storage} = require('@google-cloud/storage');

const express = require('express')
const authMiddleware = require('./authMiddleware')
const formMiddleware = require("./formMiddleware");
const FileType = require('file-type');

// https://cloud.google.com/nodejs/docs/reference/storage/latest
// https://firebase.google.com/docs/functions/2nd-gen-upgrade

admin.initializeApp()
const storage = new Storage();
const bucketName = 'win-ios-clipboard.appspot.com'

const app = express()

// Get API info endpoint
app.get('/api', async (req, res) => {
    res.status(200).send(
        {'name': 'Windows-iOS Clipboard', 'version': '3.0', 'author': 'Jonathan Ma'}
    )
})

// Paste clipboard content endpoint
app.get('/paste', authMiddleware, async (req, res) => {
    console.log('pasting clipboard')

    // get user data from database (set by authMiddleware)
    const data = req.data

    // determine whether to return text value or file
    if (!data['file']) {
        return res.status(200).send({'value': data['value']})
    } else {
        // download file from Storage
        const contents = await storage.bucket(bucketName).file(data['uid']).download();
        const fileBuf = contents[0]
        const mimeType = await FileType.fromBuffer(fileBuf)
        console.log(mimeType)
        // set MIME type and file extension
        res.set('Content-Type', mimeType['mime'])
        res.set('File-Extension', mimeType['ext'])
        return res.status(200).send(fileBuf)
    }
})

// Copy clipboard content endpoint
app.post('/copy', authMiddleware, formMiddleware, async (req, res) => {
   console.log('copying clipboard')

    const data = req.data // set by authMiddleware

    // helper function for updating stored value in database
    const updateDb = async (value, file) => {
        await req.ref.update({
            file: file,
            value: value
        }).catch(error => {
            return res.status(500).send('Data could not be saved.' + error)
        })
        return res.status(200).send({'value': value});
    }

    // prioritize text value over file if both are sent
    const textValue = req.body['value']
    if (textValue !== undefined) {
        await updateDb(textValue, false)
    } else if (req.files.length !== 0) {
        let file = req.files[0]
        // console.log(file)

        // upload file to Storage using the user's ID as the filename
        await storage.bucket(bucketName).file(data['uid']).save(file['buffer'])
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