// going to move the functionality from main_controller so that eventually when students are upload a whole
// school spreadsheet owned by the school would be created, probably first version will always use the same
// spreadsheet, will be separate from the first
const [moment, _, fs, path] = [ require('moment'), require('lodash'), require('fs'), require('path')]

const sheetids = require('../sheetids.json') // gets written as well
const sheetHelper = require('./sheet-helper')

const filePath = `${path.join(__dirname, '..')}/sheetids.json`
const getTitle = (spreadsheet) => spreadsheet.sheets[0].properties.title
const writeFile = () => fs.writeFile(filePath, JSON.stringify(sheetids), (err, result) => console.log(err, result))


// checks if sheet exists via its id. If it doesn't exist it will be created
const addSheet = async (spreadsheet, title) => {
	
	const titles = spreadsheet.sheets.map( sheet => sheet.properties.title )
	const add = () => sheetHelper.batch(spreadsheet.spreadsheetId, [ ['addSheet', { title, 'rowCount':2, 'columnCount': 2 }] ])
	
	return titles.indexOf(title)=== -1 ? add() : ''
}

const getSpreadsheet = (spreadsheetId) => sheetHelper.getSpreadsheet(spreadsheetId)

// this is the main sheet for storing the first,last,year,form,user,password
const userPassSheet = async (school, spreadsheet) => {
	
	console.log('before spreadsheetId=', spreadsheet.spreadsheetId )

	const values = school.students
	values.unshift(school.headers)
	
	await sheetHelper.update(spreadsheet.spreadsheetId, values, `${getTitle(spreadsheet)}!A1` )
	await styleSheet(spreadsheet, 0, values.length+1, school.headers.length+1, 'Students')
	

	return values
}

// was originally going to create a summary sheet, but it is easy to create
// reports if have the raw data, question is maybe could even store quite raw
// data for each student and build up from that 

// current idea is just create first few columns, add a load of scores and see
// if can create the reports charts and queries etc
const scoreSheet = async (values, spreadsheet, title) => {
	
	const monday = moment(1507553194386)
	await addSheet(spreadsheet, title)
	const totalRecords = 5

	const addDate = () => monday.add(7, 'days').format('YYYY-MM-DD')
	const talents = _.times(totalRecords, () => _.random(0, 10)/10 )
	const levels = _.times(totalRecords, () => _.random(0, 5))
	const addScore = (userIndex) => levels[userIndex] += talents[userIndex] 
	
	// mutating the sent object but not being used again
	values.forEach( (arr, index) => {
		arr.pop() // remove password, also would remove user
		for (let i=0; i < totalRecords; i++)
			arr.push( index===0 ? addDate() : _.round( addScore(i)) )

	}) // want to remove password
	
	await sheetHelper.update(spreadsheet.spreadsheetId, values, `${title}!A1` )

	await styleSheet(spreadsheet, 1, values.length+1, 5+totalRecords, title)
	
	return spreadsheet 
}

// does some common stuff such as freeze the top row, add bands set correct size
const styleSheet = async (spreadsheet, sheetIndex, rowCount, columnCount, title) => {

	const sheet = spreadsheet.sheets[sheetIndex]
	const { sheetId } = sheet.properties
	const bandedRangeId = sheet.hasOwnProperty('bandedRanges') ? sheet.bandedRanges[0].bandedRangeId : undefined

	return sheetHelper.batch(spreadsheet.spreadsheetId, [ 
		['sheetTitle', {title, sheetId }],
		['userEnteredFormat', { 
			range:{ sheetId, startRowIndex:0, endRowIndex:1  }, //   
			userEnteredFormat:{ 
				backgroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
			   	horizontalAlignment : 'CENTER',
				textFormat:{
				   foregroundColor: { red: 0.0, green: 0.0, blue: 0.0 }, 
				   fontFamily:'arial', 
				   bold:true, 
				   fontSize: 12
			   }
			}
		}],
		['rowBanding', { sheetId, bandedRangeId }],
		['sheet.gridProperties', { sheetId, gridProperties: {rowCount, columnCount, frozenRowCount:1 } }]
	])
}

const buildFull =  async schools => {
	console.log(sheetids)

	const updateMaster = async schools => {
		const title = 'schools'
		const spreadsheetId = sheetids.mainSheetId
		const spreadsheet = await sheetHelper.getSpreadsheet(spreadsheetId)
		const headers = ['Name', 'Id', 'Address', 'Zipcode'] // want in a particular order
		const details =  schools.map(ob => ob.details )
		const values = details.map( ob => headers.map( key => ob[key.toLowerCase()] ) )
		// also push on the spreadsheetIds, obviously this couldn't work on first creation
		headers.push('spreadsheetId')
		values.forEach( (row, index) => {
			console.log(index, sheetids.schools[index], row)
			row.push( sheetids.schools[index] === undefined ? 'n/a' : sheetids.schools[index] )
		})


		values.unshift(headers)
		
		await sheetHelper.clear(spreadsheetId, `${title}!A1:XX`)
		await styleSheet(spreadsheet, 0, schools.length + 1, headers.length+1, title)
		
		return sheetHelper.update(spreadsheetId, values, `${title}!A1` )
	}

	const createOrUpdate = async(school, index) => {
		const id = sheetids.schools[index]
		console.log('id', id)

		const spreadsheet = (id === undefined) ? await sheetHelper.newSpreadSheet(`school-${index}`) : await getSpreadsheet(id)
		console.log(spreadsheet)
		sheetids.schools[index] = spreadsheet.spreadsheetId // this is the written file

		
		const values = await userPassSheet(school, spreadsheet)
		
		return scoreSheet(values, spreadsheet, 'multiply')
	}

	await updateMaster(schools)
	await Promise.all( schools.map( createOrUpdate ) )
	
	// await createOrUpdate(schools[0], 0) // get working for one

	writeFile()
	return schools
}

module.exports = {
	userPassSheet,
	scoreSheet,
	buildFull
}
