const batch = (arr) => {
	const [ type, args  ]= arr

	switch(type){
	case 'title' : 
		return {
			updateSpreadsheetProperties: {
				properties: {
					title: args.title
				},
				fields: 'title'
			}
		}
	case 'sheetTitle' : 
		return {
			updateSheetProperties: {
				properties: {
					sheetId: args.sheetId,
					title: args.title
				},
				fields: 'title'
			}
		}
	case 'addSheet': 
		return {
			addSheet: {
				properties: {
					title: args.title,
					'gridProperties': { 'rowCount': args.rowCount, 'columnCount': args.columnCount },
					'tabColor': { 'red': 1.0, 'green': 1.0, 'blue': 1.0 }
				}
			}
		}
	case 'deleteSheet' :
		return { 
			deleteSheet: { 
				sheetId : args.sheetId 
			}  
		}
	
	case 'freeze' : // can get rid of this one as gridProperties simple enough
		console.error('deprecated')
		return {
			updateSheetProperties: {
				properties: {
					sheetId: args.sheetId,
					gridProperties: {
						frozenRowCount: args.rowCount
					}
				},
				'fields': 'gridProperties.frozenRowCount'
			}
		}
	case 'sheet.gridProperties': // more generic one
		return {
			updateSheetProperties: {
				properties: {
					sheetId: args.sheetId,
					gridProperties: args.gridProperties
				},
				'fields': Object.keys(args.gridProperties).map(str => `gridProperties.${str}` ).join(',')
			}
		}
	case 'userEnteredFormat' : 
		return {
			repeatCell: {
				range: args.range,
				cell: {
					userEnteredFormat:  args.userEnteredFormat
				},
				fields: `userEnteredFormat(${Object.keys(args.userEnteredFormat).join(',')})`
			}
		}
	case 'rowBanding': // supply bandedRange for update otherwise addBanding
		const ob = {}  // colors fixed as will only need one style I imagine
		const update = args.hasOwnProperty('bandedRangeId') 
		ob[ update ? 'updateBanding' : 'addBanding' ] = {
			bandedRange:{
				range: {
					'sheetId': args.sheetId,
					startRowIndex: 0,
					startColumnIndex: 0
					//	endRowIndex: 6,
					//	endColumnIndex: 4
				},
				rowProperties: {
					headerColor: { red: 0.36, green: 0.58, blue: 0.98 },
					firstBandColor: { red: 1, green: 1, blue: 1 },
					secondBandColor: { red: 0.91, green: 0.94, blue: 1 }
				}
				
			},
			fields:'rowProperties.headerColor,rowProperties.firstBandColor,rowProperties.secondBandColor'
		}
		update ? ob.updateBanding.bandedRange.bandedRangeId = args.bandedRangeId : ''
		return ob
	case 'deleteBanding' : 
		return {
			'deleteBanding': {
				bandedRangeId: args.bandedRangeId
			}
		}
	case 'raw' :
		return args
	}
}

module.exports = batch
