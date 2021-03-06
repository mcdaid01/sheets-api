const fs = require('fs')
const readline = require('readline')
const googleAuth = require('google-auth-library')

const {tokenFile, SCOPES} = require('../../config/config.js')

//the directory where we're going to save the token
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/' 
const TOKEN_PATH = TOKEN_DIR + tokenFile //the file which will contain the token
 
class Authentication {
	authenticate(){
		return new Promise((resolve, reject) => {
			const credentials = this.getClientSecret()
			const authorizePromise = this.authorize(credentials)
			authorizePromise.then(resolve, reject)
		})
	}
	getClientSecret(){
		const client_secret = require('../../config/client_secret.json')
		// console.log('*****************')
		// console.log(client_secret)
		// console.log('*****************')
		return client_secret
	}
	authorize(credentials) {
		const clientSecret = credentials.installed.client_secret
		const clientId = credentials.installed.client_id
		const redirectUrl = credentials.installed.redirect_uris[0]
		const auth = new googleAuth()
		const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
 
		return new Promise((resolve, reject) => {
			// Check if we have previously stored a token.
			fs.readFile(TOKEN_PATH, (err, token) => {
				if (err) 
					this.getNewToken(oauth2Client).then((oauth2ClientNew) => {
						resolve(oauth2ClientNew)
					}, (err) => {
						reject(err)
					})
				else {
					oauth2Client.credentials = JSON.parse(token)
					resolve(oauth2Client)
				}
			})
		})
	}
	getNewToken(oauth2Client, callback) {
		return new Promise((resolve, reject) => {
			const authUrl = oauth2Client.generateAuthUrl({
				access_type: 'offline',
				scope: SCOPES
			})
			console.log('Authorize this app by visiting this url: \n ', authUrl)
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})
			rl.question('\n\nEnter the code from that page here: ', (code) => {
				rl.close()
				oauth2Client.getToken(code, (err, token) => {
					if (err) {
						console.log('Error while trying to retrieve access token', err)
						reject()
					}
					oauth2Client.credentials = token
					this.storeToken(token)
					resolve(oauth2Client)
				})
			})
		})
	}
	storeToken(token) {
		try {
			fs.mkdirSync(TOKEN_DIR)
		} catch (err) {
			if (err.code != 'EEXIST') 
				throw err
      
		}
		fs.writeFile(TOKEN_PATH, JSON.stringify(token))
		console.log('Token stored to ' + TOKEN_PATH)
	}
}
 
module.exports = new Authentication()
