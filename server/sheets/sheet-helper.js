const google = require('googleapis')
const authentication = require('./authentication')
const sheets = google.sheets('v4')
const batch = require('./batch')

exports = { // note would not let me put const infront
	update(spreadsheetId, values, range = 'Sheet1!A1', valueInputOption = 'RAW'){
		const resource = { values: values }

		// console.log(JSON.stringify(resource.values, null, 2))
		
		return update(spreadsheetId, range, valueInputOption, resource, 'update')
	},
	append( spreadsheetId, values, range = 'Sheet1!A1', valueInputOption = 'RAW' ){
		
		const resource = { values: values }
				
		return update(spreadsheetId, range, valueInputOption, resource, 'append')
	},
	getSpreadsheet( spreadsheetId ){
		return new Promise( (resolve, reject) => {
			const auth = this.auth
			sheets.spreadsheets.get( {auth, spreadsheetId }, (err, res) => {
				err ? reject(err) : resolve(res) 
			})
		})
	},
	batch(spreadsheetId, batchList){

		return new Promise( (resolve, reject) => {
			const auth = this.auth
			//batchList.forEach( (ob, index) => console.log(JSON.stringify(ob, null, 2) ))
			const requests = batchList.map(batch)
			const resource = { requests }

			sheets.spreadsheets.batchUpdate( { auth, spreadsheetId, resource }, 
				(err, res) => err ? reject(err) : resolve(res) )

		})
	},
	clear(spreadsheetId, range){
		return new Promise( (resolve, reject) => {
			const auth = this.auth
			sheets.spreadsheets.values.clear({auth, spreadsheetId, range},
				(err, res) => err ? reject(err) : resolve(res) )
		})	
	},
	newSpreadSheet(title){
		return new Promise( (resolve, reject) => {
			const auth = this.auth
			sheets.spreadsheets.create({
				auth: auth,
				resource: {
					properties:{ title }
				}
			}, (err, res) =>  err ? reject(err) : resolve(res) )
		})
	},
	ready(){
		return new Promise( (resolve) => { // reject?
			authentication.authenticate().then( auth => {
				this.auth = auth
				resolve()
			})
		})
		
	}
}

const update = (spreadsheetId, range, valueInputOption, resource, operationType) => {
	return new Promise((resolve, reject) => {
		const auth = exports.auth
		sheets.spreadsheets.values[operationType]({ auth, spreadsheetId, range, valueInputOption, resource }, 
			(err, response) => {
				err ? reject(err) : resolve(response)
			})
	})
}

module.exports = exports // still need this though ? YES
