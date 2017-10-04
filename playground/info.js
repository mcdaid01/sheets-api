/* Getting information about a sheet is quite important, in particular the sheetIds
	 without the id can't delete a sheet at least it appears that way. Seems odd as they
	 have index and unique titles too
*/
const google = require('googleapis')
const authentication = require('./authentication')
const { spreadsheetId } = require('../config/config.js')

sheets.spreadsheets.get( {auth, spreadsheetId }, (err, res)=>{
	console.log('******************')
	console.log(res)
	//console.log(err)
	console.log(res.sheets)

	console.log(res)
})
	
authentication.authenticate().then( auth => appendData(auth, spreadsheetId) )
