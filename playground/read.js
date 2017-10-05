const google = require('googleapis')
const path = require('path')

const playPath = path.join(__dirname, '../playground')
const { spreadsheetId } = require('../config/config.js')
const authentication = require('../server/sheets/authentication')


const getData = (auth, range, spreadsheetId) => {
	const sheets = google.sheets('v4')
	sheets.spreadsheets.values.get({ auth, range, spreadsheetId }, (err, response) => {
		const rows = response.values
		const message = err ? `ERROR \n${err}` : rows.length === 0 ? `No rows ${response}` : false
		const display = rows => rows.forEach(row => console.log(row.join(', ')))
		message ? console.log(message) : display(rows)
	})
}

authentication.authenticate().then(auth => {

	const range = 'Sheet1!A2:C'

	getData(auth, range, spreadsheetId)
})
