const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp()

exports.get_latest = functions.https.onRequest((req, res) => {
    admin.database().ref('/').get().then((data) => {
        res.status(200).send({'latest_value': data.val()['latest_value']})
    });
});

exports.push_data = functions.https.onRequest((req, res) => {
    let value_in = req.query.value
    admin.database().ref('/').set({
        latest_value: value_in
    }).then(() => {
        res.status(200).send({'latest_value': value_in});
    });
});