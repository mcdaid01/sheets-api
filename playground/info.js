/* Getting information about a sheet is quite important, in particular the sheetIds
	 without the id can't delete a sheet at least it appears that way. Seems odd as they
	 have index and unique titles too
*/
const google = require('googleapis')
const authentication = require('../server/sheets/authentication')
const { spreadsheetId } = require('../config/config.js')

//const spreadsheetId = '17c85kM11wmaOpSvLrv5mNsHS2-0aOVZU3D0esJfXmKQ'


const getInfo = (auth, spreadsheetId) => {
	const sheets = google.sheets('v4')
	sheets.spreadsheets.get( {auth, spreadsheetId }, (err, res) => {
		console.log('******************')
		console.log(res.sheets[0])
		//console.log(err)
		//console.log(res.sheets)

		//console.log(res)
	})
}	
authentication.authenticate().then( auth => getInfo(auth, spreadsheetId) )
