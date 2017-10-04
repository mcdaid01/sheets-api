/* note two methods */
const google = require('googleapis')
const authentication = require('./authentication')
const opType = ['update', 'append'][1] // useful to append as go on next available line

const { spreadsheetId } = require('../config/config.js')

const appendData = (auth, spreadsheetId)=> {
	const sheets = google.sheets('v4')
	sheets.spreadsheets.values[ opType ]({
		auth, spreadsheetId,
		range: 'Sheet1!A1', //Change Sheet1 if your worksheet's name is something else
		valueInputOption: 'RAW', // USER_ENTERED
		resource: {
	 values: [ ['Void', 'Canvas', 'Website'], ['Paul', 'Shan', 'Human'] ]
		}
	}, (err, response) => err ? console.log(`error \n\n ${err}`) : console.log(`operation '${opType}' complete`) )
}

authentication.authenticate().then( auth => appendData(auth, spreadsheetId) )
