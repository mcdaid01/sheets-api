/* batch methods can lots of operations in this case, set a new title to the sheet
and replace some of the text and finally add a new sheet and delete one if if called pigs 
obviously some of the ids have to change to make it work
*/
const google = require('googleapis')
const authentication = require('./authentication')

const { spreadsheetId } = require('../config/config.js')

const [title, find, replacement, sheetId] = ['my super new title', 'Richard', 'Dick']

const requests = []

requests.push({
	updateSpreadsheetProperties: {
	  properties: {
			title: title
	  },
	  fields: 'title'
	}
})

requests.push({
	findReplace: {
	  find: find,
	  replacement: replacement,
	  allSheets: true
	}
})

requests.push({
	'addSheet': {
	  'properties': {
			'title': 'Deposits',
			'gridProperties': {
		  'rowCount': 5,
		  'columnCount': 5
			},
			'tabColor': {
		  'red': 1.0,
		  'green': 1.0,
		  'blue': 0.0
			}
	  }
	}
})

if (false)
	requests.push({ 
		'deleteSheet': { 'sheetId': sheetId } } ) // note this comes from the last part of sheet url (gid)  

const batchUpdateRequest = {requests: requests}

const appendData = (auth, spreadsheetId)=> {
	const sheets = google.sheets('v4')

	sheets.spreadsheets.batchUpdate({
		auth, spreadsheetId,
		resource: batchUpdateRequest
			
	}, (err, res) => err ? console.log(`error \n\n ${err}`) : console.log(`operation complete ${res}`) )
}

authentication.authenticate().then( auth => appendData(auth, spreadsheetId) )
