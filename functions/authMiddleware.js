const admin = require('firebase-admin')
const fetch = require('node-fetch')
const apiKey = require('./env')

module.exports = validateFirebaseIdToken = (req, res, next) => {

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        console.log('Couldn\'t find Authorization header')
        res.status(403).send('Unauthorized')
        return
    }

    let decoded_auth = atob(req.headers.authorization.split('Basic ')[1])
    let body = {'email': decoded_auth.split(':')[0].toLowerCase(),
        'password': decoded_auth.split(':')[1], 'returnSecureToken': true}

    admin.database().ref('/users').orderByChild('email').once('value').then(data => {
        let users = [];
        Object.entries(data.val()).forEach(([key, value]) => users.push(value.email))

        let signin = users.length !== 0 && users.includes(body['email'])
        console.log((signin ? 'signing in ' : 'registering ') + body['email'])
        let fetch_url = 'https://identitytoolkit.googleapis.com/v1/accounts:' + (signin ? 'signInWithPassword' : 'signUp')
            + '?key=' + apiKey
        fetch(fetch_url, {method: 'post', body: JSON.stringify(body)})
            .then(r => {
                if (r.status === 200) {
                    return r.json()
                } else {
                    return Promise.reject('Invalid email/password')
                }
            })
            // .then(json => admin.auth().verifyIdToken(json['idToken']))
            .then(token => {
                console.log('Credentials successfully verified')
                req.user = {'email': body['email']}
                if (signin) {
                    console.log(body['email'] + ' signed in')
                    next()
                } else {
                    return admin.database().ref('users').push().set({
                        'email': body['email'],
                        'latest_value': ''
                    }).then(() => {
                        console.log(body['email'] + ' registered')
                        next()
                    })
                }
            })
            .catch(err => {
                console.error('Error while verifying credentials:', err)
                res.status(403).send('Unauthorized')
            })
    })

    // let idToken
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    //     console.log('Found "Authorization" header')
    //     // Read the ID Token from the Authorization header.
    //     idToken = req.headers.authorization.split('Bearer ')[1]
    //     console.log('token ' + idToken)
    // } else {
    //     console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
    //         'Make sure you authorize your request by providing the following HTTP header:',
    //         'Authorization: Bearer <Firebase ID Token>.')
    //     res.status(403).send('Unauthorized')
    //     return
    // }
    //
    // try {
    //     const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    //     console.log('ID Token correctly decoded', JSON.stringify(decodedIdToken))
    //     req.user = decodedIdToken
    //     next()
    // } catch (error) {
    //     console.error('Error while verifying Firebase ID token:', error)
    //     res.status(403).send('Unauthorized')
    // }
}