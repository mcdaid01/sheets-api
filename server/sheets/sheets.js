const google = require('googleapis')
const authentication = require('./authentication')
const sheets = google.sheets('v4')

// hard coding the sheetid at this point, probably would want to work with multiple sheets
const setSheetInfo = () => {

}



exports = { // note would not let me put const infront
	update(spreadsheetId, values, range = 'Sheet1!A1', valueInputOption = 'RAW'){
		const resource = { values: values }
		
		return update(spreadsheetId, range, valueInputOption, resource, 'update')
	},
	append( spreadsheetId, values, range = 'Sheet1!A1', valueInputOption = 'RAW' ){

		const resource = { values: values }
				
		return update(spreadsheetId, range, valueInputOption, resource, 'append')
	},
	getInfo( spreadsheetId ){
		const auth = this.auth
		sheets.spreadsheets.get( {auth, spreadsheetId }, (err, res) => {
			console.log('******************')
			console.log(res)
			//console.log(err)
			console.log(res.sheets)
	
			//console.log(res)
		})
	},
	ready(callback){
		return new Promise( (resolve, reject) => {
			authentication.authenticate().then( auth => {
				this.auth = auth
				resolve()
			})
		})
		
	}
}



const update = (spreadsheetId, range, valueInputOption, resource, operationType) => { // convert to a promise
	return new Promise((resolve, reject) => {
		const auth = exports.auth
		sheets.spreadsheets.values[operationType]({ auth, spreadsheetId, range, valueInputOption, resource }, 
			(err, response) => {
				err ? reject(err) : resolve(response)
			})
	})
}



module.exports = exports // still need this though ?

// kind of useful to have info about the sheet particularly sheet ids
