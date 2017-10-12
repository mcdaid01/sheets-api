// going to move the functionality from main_controller so that eventually when students are upload a whole
// school spreadsheet owned by the school would be created, probably first version will always use the same
// spreadsheet, will be separate from the first
const moment = require('moment')
const _ = require('lodash')

const sheetHelper = require('./sheet-helper')
const getTitle = (spreadsheet) => spreadsheet.sheets[0].properties.title
const getId = (spreadsheet, sheetIndex) => spreadsheet.sheets[sheetIndex].properties.sheetId


// const sheetExists = (spreadsheet, sheetIndex) => spreadsheet.sheets[sheetIndex]!==undefined // not used

// checks if sheet exists via its id. If it doesn't exist it will be created
const addSheet = async (spreadsheet, title) => {
	// could create new array and then find index
	const titles = spreadsheet.sheets.map( sheet => sheet.properties.title )
	const add = () => sheetHelper.batch(spreadsheet.spreadsheetId, [ ['addSheet', { title, 'rowCount':2, 'columnCount': 2 }] ])
	


	return titles.indexOf(title)=== -1 ? add() : ''
}

const setSheetProps = (spreadsheet, sheetIndex, title) => {
	console.log('sheetIndex', sheetIndex)
	const {spreadsheetId} = spreadsheet
	const sheetId = getId(spreadsheet, sheetIndex)
	console.log('spreadsheetId=', spreadsheetId, sheetId, title)
	
	return sheetHelper.batch(spreadsheetId, [ 
		['freeze', {rowCount : 1, sheetId }],
		['sheetTitle', {title, sheetId }],
		['userEnteredFormat', { 
			 range:{ sheetId, startRowIndex:0, endRowIndex:1  }, //   
			 userEnteredFormat:{ 
				backgroundColor: { red: 0.0, green: 0.0, blue: 0.0 },
				horizontalAlignment : 'CENTER',
				 textFormat:{
					foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, 
					fontFamily:'arial', 
					bold:true, 
					fontSize: 12
				}
			 }
		 }]
	])
}

const getInfo = (spreadsheetId) => sheetHelper.getInfo(spreadsheetId)

// this is the main sheet for storing the first,last,year,form,user,password
const userPassSheet = async (school) => {
	
	// save creating new spreadsheets each time, can reuse
	//const spreadsheet = await sheetHelper.newSpreadSheet('sheets-api-sample')
	const spreadsheet = await getInfo('1RvUHgJvTgyHEQbD52o-9vj4s-vspdjUBYsQG7TSPAe0')
	const { spreadsheetId } = spreadsheet
	console.log('before spreadsheetId=', spreadsheetId )

	const values = school.students
	values.unshift(school.headers)
	
	await sheetHelper.update(spreadsheetId, values, `${getTitle(spreadsheet)}!A1` )
	await setSheetProps(spreadsheet,  0, 'Students' )

	return values
}

// was originally going to create a summary sheet, but it is easy to create
// reports if have the raw data, question is maybe could even store quite raw
// data for each student and build up from that 

// current idea is just create first few columns, add a load of scores and see
// if can create the reports charts and queries etc
const scoreSheet = async (values, title) => {
	
	const monday = moment(1507553194386)
	const spreadsheet = await getInfo('1RvUHgJvTgyHEQbD52o-9vj4s-vspdjUBYsQG7TSPAe0')
	await addSheet(spreadsheet, title)
	const totalRecords = 5

	const addDate = () => monday.add(7, 'days').format('YYYY-MM-DD')
	const talents = _.times(totalRecords, () => _.random(0, 10)/10 )
	const levels = _.times(totalRecords, (i) => _.random(0, 5))
	const addScore = (userIndex) => levels[userIndex] += talents[userIndex] 
	
	// mutating the sent object but not being used again
	values.forEach( (arr, index) => {
		arr.pop() // remove password, also would remove user
		for (let i=0; i < totalRecords; i++)
			arr.push( index===0 ? addDate() : _.round( addScore(i)) )

	}) // want to remove password
	
	await sheetHelper.update(spreadsheet.spreadsheetId, values, `${title}!A1` )
	
	return spreadsheet 
}

module.exports = {
	userPassSheet,
	scoreSheet
}

// 
// 
// 