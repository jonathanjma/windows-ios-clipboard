const admin = require('firebase-admin');
const fetch = require('node-fetch')

module.exports = validateFirebaseIdToken = async (req, res, next) => {

    admin.database().ref('/').once('value').then(data => {

        let decoded_auth = atob(req.headers.authorization.split(' ')[1])
        console.log(decoded_auth)
        let body = {'email': decoded_auth.split(':')[0], 'password': decoded_auth.split(':')[1], 'returnSecureToken': true}

        let signin = data.val() !== null && Object.keys(data.val()).includes(body['email'].split('@')[0])
        console.log('sign in: ' + signin)
        let fetch_url = 'https://identitytoolkit.googleapis.com/v1/accounts:' + (signin ? 'signInWithPassword' : 'signUp')
            + '?key=AIzaSyBiGR8NanCX0sB5YSP1b2ulAmhtmsqaMPE'
        fetch(fetch_url, {method: 'post', body: JSON.stringify(body)})
            .then(r => r.json())
            .then(json => admin.auth().verifyIdToken(json['idToken']))
            .then(token => {
                console.log('ID Token correctly decoded', JSON.stringify(token));
                req.user = token;
                next();
                if (signin) {
                    console.log(body['email'] + ' signed in')
                } else {
                    admin.database().ref('/' + body['email'].split('@')[0]).set({
                        latest_value: ''
                    }).then(() => console.log(body['email'] + ' registered'));
                }
            })
            .catch(err => {
                console.error('Error while verifying Firebase ID token:', err);
                res.status(403).send('Unauthorized');
            })
    })

    // let idToken;
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    //     console.log('Found "Authorization" header');
    //     // Read the ID Token from the Authorization header.
    //     idToken = req.headers.authorization.split('Bearer ')[1];
    //     console.log('token ' + idToken)
    // } else {
    //     console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
    //         'Make sure you authorize your request by providing the following HTTP header:',
    //         'Authorization: Bearer <Firebase ID Token>.');
    //     res.status(403).send('Unauthorized');
    //     return;
    // }
    //
    // try {
    //     const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    //     console.log('ID Token correctly decoded', JSON.stringify(decodedIdToken));
    //     req.user = decodedIdToken;
    //     next();
    // } catch (error) {
    //     console.error('Error while verifying Firebase ID token:', error);
    //     res.status(403).send('Unauthorized');
    // }
};