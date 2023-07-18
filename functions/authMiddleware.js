const bcrypt = require("bcrypt")
const getUuid = require('uuid-by-string');
const {getFirestore} = require("firebase-admin/firestore");

module.exports = async (req, res, next) => {

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        console.log("No Authorization header")
        return res.status(403).send('Unauthorized')
    }

    const decoded_auth = atob(req.headers.authorization.split('Basic ')[1]).split(':')
    const email = decoded_auth[0].toLowerCase()
    const password = decoded_auth[1]

    // retrieve user with matching email
    const query =
        await getFirestore().collection('users').where('email', '==', email).get();

    const signIn = !query.empty
    console.log((signIn ? 'signing in ' : 'registering ') + email)

    // sign-in if matching user found, otherwise register user
    if (signIn) {
        // save data and ref to prevent duplicate queries in API endpoint
        req.data = query.docs[0].data()
        req.ref = query.docs[0].ref
        // compare password hashes
        const success = await bcrypt.compare(password, req.data['password_hash'])
        if (!success) {
            console.error('Incorrect email or password')
            return res.status(403).send('Unauthorized')
        }
    } else { // register user
        // create password hash
        const hash = await bcrypt.hash(password, 10)
        // validate email?
        req.data = {
            email: email,
            password_hash: hash,
            file: false,
            value: ''
        }
        req.ref = await getFirestore().collection('users').add(req.data);
    }
    req.data['uid'] = getUuid(email) // store uuid (used in filenames for file copying)
    next()
}