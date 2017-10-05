/* Creates a new folder in the root of drive, not can't specify a folder this needs
   must use drive api to move it after creation 
   https://stackoverflow.com/questions/42938990/google-sheets-api-create-or-move-spreadsheet-into-folder
   also doesn't matter if you have many files with the same file name in the same folder
*/

const google = require('googleapis')
const authentication = require('../server/sheets/authentication')

const title = 'newSheet'
 
const addSheet = (auth) => {
	var sheets = google.sheets('v4')
	sheets.spreadsheets.create({
		auth: auth,
		resource: {
			properties:{ title }
		}
	}, (err, response) => {
		if (err) {
			console.log('The API returned an error: ' + err)
			return
		} else 
			console.log(`added sheet title=${title}`)
    
	})
}
 
authentication.authenticate().then(auth => {
	addSheet(auth)
})
