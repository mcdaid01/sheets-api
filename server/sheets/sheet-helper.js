const google = require('googleapis')
const authentication = require('./authentication')
const sheets = google.sheets('v4')

const batchProcess = (arr) => {
	const [ type, args  ]= arr 
	console.log(type)
	//console.log(type, args)
	//probably should refactator to a switch as have to parse whole object each time
	// also can lead to elusive errors such as the userEnteredFormat Object.keys thing
	const obj ={
		title : {
			updateSpreadsheetProperties: {
				properties: {
					title: args.title
				},
				fields: 'title'
			}
		},
		sheetTitle : {
			updateSheetProperties: {
				properties: {
					sheetId: args.sheetId,
					title: args.title
				},
				fields: 'title'
			}
		},
		freeze : {
			updateSheetProperties: {
				properties: {
					sheetId: args.sheetId,
					gridProperties: {
						frozenRowCount: args.rowCount
					}
				},
				'fields': 'gridProperties.frozenRowCount'
			}
		},
		addSheet: {
			addSheet: {
				properties: {
					title: args.title,
					'gridProperties': { 'rowCount': args.rowCount, 'columnCount': args.columnCount },
					'tabColor': { 'red': 1.0, 'green': 1.0, 'blue': 1.0 }
				}
			}
		},
		deleteSheet : { 
			deleteSheet: { 
				sheetId : args.sheetId 
			}  
		},
		userEnteredFormat : {
			repeatCell: {
				range: args.range,
				cell: {
					userEnteredFormat:  args.userEnteredFormat
				},
				fields: `userEnteredFormat(${args.userEnteredFormat ? Object.keys(args.userEnteredFormat).join(',') : ''})`
			}
		}
	}[type] 

	// console.log(JSON.stringify(obj, null, 2) )
	

	return obj
}

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
			const requests = batchList.map(batchProcess)
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
	ready(callback){
		return new Promise( (resolve, reject) => {
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

module.exports = exports // still need this though ?

// kind of useful to have info about the sheet particularly sheet ids
