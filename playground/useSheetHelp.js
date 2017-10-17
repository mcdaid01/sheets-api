// obviously will improve sheet-helper over time, here is a good place to test

//const _ = require('lodash')

const sheetHelper = require('../server/sheets/sheet-helper')

// let defaults = { 
// 	color1:{red:1, blue:1, green:0},
// 	color2:{red:0, blue:0, green:0}
// }

// let options = {
// 	color2:{red:1, blue:1, green:1}
// }

// console.clear()
// console.log(_.extend(defaults, options))

const playground = '1LCp05gIyLNijju3pj76c_sbQTs4mDh5GZwr3Qiltxm4' // use this one for messing about

const spreadsheetId = playground
//console.log(sheetHelper)

sheetHelper.ready().then(() => {
	
	console.log('ready')
	sheetHelper.getSpreadsheet(spreadsheetId).then( spreadsheet => {
		const sheet1 = spreadsheet.sheets[1]
		const sheetId = sheet1.properties.sheetId
		const bandedRangeId = sheet1.hasOwnProperty('bandedRanges') ? sheet1.bandedRanges[0].bandedRangeId : undefined
		console.log('bandedRangeId', bandedRangeId)
		

		// want to create a banding and then alter it

		//sheetHelper.batch( spreadsheetId, [ ['addSheet', { title: 'newSheet', 'rowCount':2, 'columnCount': 2 }] ])

		const type = ['batch1', '2bands', 'rowBanding'][0] // not sure if they work as moved clutter out of main_controller

		switch (type){
		
		case 'batch1':

			sheetHelper.batch(spreadsheetId, [ 
				['rowBanding', { bandedRangeId:  1046322736 }],
				['rowBanding', {sheetId:1052900691}],
				['sheet.gridProperties', { sheetId:974989790, gridProperties: {rowCount: 6, columnCount:10, frozenRowCount:1 } }],
				['raw', {
					updateSheetProperties: {
						properties: {
							sheetId: 974989790,
							title: 'Schools'
						},
						fields: 'title'
					}
				}]
			])

			break

		case '2bands':
			// this works only on fresh one as bandRangeId is for first one
			sheetHelper.batch( spreadsheetId, [ ['rowBanding', { sheetId, bandedRangeId, 
				range:{ startColumnIndex: 0, startRowIndex: 0, endRowIndex:6 },
				rowProperties : {
					headerColor: { red: 0.1, blue:1.0, green:0.5 }
				}
			}],
			['rowBanding', { sheetId, bandedRangeId, 
				range:{ startColumnIndex: 0, startRowIndex: 8, endRowIndex:12 },
				rowProperties : {
					headerColor: { red: 1.0, blue:0.0, green:0.5 },
					firstBandColor: { red: 0, green: 1, blue: 1 },
					secondBandColor: { red: 0, green: 0, blue: 1 }
				}
			}]
			])
			break

		case 'format':
			sheetHelper.batch(spreadsheetId, [ 
				['title', {title : 'sheets-api'}],
				['sheetTitle', {title : 'Sheet 1', sheetId: 0}],
				//['deleteSheet', {sheetId: 1940078753}],
				['userEnteredFormat', { 
					range:{ sheetId:0, startRowIndex:0, endRowIndex:1  }, //   
					userEnteredFormat:{ 
						backgroundColor: { red: 0.0, green: 0.0, blue: 0.0 },
						horizontalAlignment : 'CENTER',
						textFormat:{
							foregroundColor: { red: Math.ceil(Math.random()*10)/10, green: 1.0, blue: 1.0 }, 
							fontFamily:'arial', 
							bold:true, 
							fontSize: 12 
						}
					}
				}]
			]).then( result => console.log(result) )
			break

		}

		
	})
})
