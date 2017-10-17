const google = require('googleapis')
//const path = require('path')
const sheetids = require('../server/sheetids.json')
const spreadsheetId = sheetids.mainSheetId

console.log(`\n${JSON.stringify(sheetids, null, 2)}\n`)

//const playPath = path.join(__dirname, '../playground')
//const { spreadsheetId } = require('../config/config.js')
const authentication = require('../server/sheets/authentication')


const getData = (auth, range, spreadsheetId) => {
	const sheets = google.sheets('v4')
	sheets.spreadsheets.values.get({ auth, range, spreadsheetId }, (err, response) => {

		console.log(range)
		console.log()

		const rows = response.values
		
		// real one deals with possible errors
		//const message = err ? `ERROR \n${err}` : rows.length === 0 ? `No rows ${response}` : false

		// could send in the same form which would be better bandwith
		// doesn't matter at this stage
		
		const headers = rows.shift().map(txt => txt.toLowerCase())
		const json = rows.map(row => {
			const ob = {}
			headers.forEach( (key, index) => ob[key] = row[index] )
			return ob
		})

		console.log(json)

		// const display = rows => rows.forEach(row => console.log(row.join(', ')))
		// message ? console.log(message) : display(rows)
	})
}

authentication.authenticate().then(auth => {

	// suppose would know what the data looks like so these ranges aren't so hard
	const range = 'schools!A1:E'

	getData(auth, range, spreadsheetId)
})
