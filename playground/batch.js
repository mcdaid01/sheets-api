/* batch methods can lots of operations in this case, set a new title to the sheet
and replace some of the text and finally add a new sheet and delete one if if called pigs 
obviously some of the ids have to change to make it work
*/
const google = require('googleapis')
const authentication = require('../server/sheets/authentication')

const { spreadsheetId } = require('../config/config.js')

const [title, find, replacement, sheetId] = ['sheets-api', 'Richard', 'Dick']

const buildRequest  = (id, args, requests) => {

	const map = {
		title : () => {
			// change the spreadsheet title
			requests.push({
				updateSpreadsheetProperties: {
					properties: {
						title: args.title
					},
					fields: 'title'
				}
			})			
		},
		sheetTitle: () => { // notice the difference method name SpreadsheetProp vs sheetProp
			requests.push({
				updateSheetProperties: {
					properties: {
						sheetId: args.sheetId,
						title: args.title
					},
					fields: 'title'
				}
			})
		},
		findReplace : () => {
			requests.push({
				findReplace: {
					find: find,
					replacement: replacement,
					allSheets: true
				}
			})
		},
		addSheet : () => {
			requests.push({
				'addSheet': {
					'properties': {
						'title': args.title,
						'gridProperties': { 'rowCount': 5, 'columnCount': 5
						},
						'tabColor': { 'red': 1.0, 'green': 1.0, 'blue': 0.0 }
					}
				}
			})
		},
		deleteSheet : () => {
			requests.push({ 
				'deleteSheet': { 'sheetId': args.sheetId } } ) // re from the url
		},
		freeze : () => {
			requests.push({
				'updateSheetProperties': {
					'properties': {
						'sheetId': args.sheetId,
						'gridProperties': {
							'frozenRowCount': 1
						}
					},
					'fields': 'gridProperties.frozenRowCount'
				}
			})
		},
		bold : () => {
			requests.push({
				'repeatCell': {
				  'range': {
						'sheetId': args.sheetId,
						'startRowIndex': 0,
						'endRowIndex': 1
				  },
				  'cell': {
						'userEnteredFormat': {
					  
					  'textFormat': {
								'bold': true
					  }
						}
				  },
				  'fields': 'userEnteredFormat(textFormat)'
				}
			  })
		}
	}

	map[id]()
	return requests

}

const requests = []

//buildRequest( 'title', {title:`my-new-title ${Date.now()}`}, requests )
//buildRequest( 'addSheet', {title:`sheet ${Math.ceil(Math.random() * 20)}`}, requests )

// note this means its anchored when everything else moves
buildRequest( 'freeze', {sheetId:0}, requests )
buildRequest( 'bold', {sheetId:0}, requests )
buildRequest( 'sheetTitle', {title:'Sheet1', sheetId:0}, requests )
buildRequest( 'title', {title:'supder-sss'}, requests )


// buildRequest( 'deleteSheet', {sheetId:'1523052179'}, requests ) // re can get id from url when the sheet selected



const batchUpdateRequest = {requests: requests}

const process = (auth, spreadsheetId) => {
	const sheets = google.sheets('v4')

	sheets.spreadsheets.batchUpdate({
		auth, spreadsheetId,
		resource: batchUpdateRequest
			
	}, (err, res) => err ? console.log(`error \n\n ${err}`) : console.log(`operation complete ${res}`) )
}

authentication.authenticate().then( auth => process(auth, spreadsheetId) )
