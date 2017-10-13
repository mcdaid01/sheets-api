// going to move the functionality from main_controller so that eventually when students are upload a whole
// school spreadsheet owned by the school would be created, probably first version will always use the same
// spreadsheet, will be separate from the first
const [moment, _, fs, path] = [ require('moment'), require('lodash'), require('fs'), require('path')]

const sheetids = require('../sheetids.json') // eventually will write this file
const sheetHelper = require('./sheet-helper')

const filePath = `${path.join(__dirname, '..')}/sheetids.json`

const getTitle = (spreadsheet) => spreadsheet.sheets[0].properties.title
const getId = (spreadsheet, sheetIndex) => spreadsheet.sheets[sheetIndex].properties.sheetId

const writeFile = () => fs.writeFile(filePath, JSON.stringify(sheetids), (err, result) => console.log(err, result))



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

const getSpreadsheet = (spreadsheetId) => sheetHelper.getSpreadsheet(spreadsheetId)

// this is the main sheet for storing the first,last,year,form,user,password
const userPassSheet = async (school, spreadsheet) => {
	
	// save creating new spreadsheets each time, can reuse
	//const spreadsheet = await sheetHelper.newSpreadSheet('sheets-api-sample')
	//const spreadsheet = await getSpreadsheet(spreadsheetId)
	
	
	console.log('before spreadsheetId=', spreadsheet.spreadsheetId )

	const values = school.students
	values.unshift(school.headers)
	
	await sheetHelper.update(spreadsheet.spreadsheetId, values, `${getTitle(spreadsheet)}!A1` )
	await setSheetProps(spreadsheet,  0, 'Students' )

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

const buildFull =  async schools => {
	console.log(sheetids)

	const updateMaster = async schools => {
		const title = 'schools'
		const spreadsheetId = sheetids.mainSheetId
		const headers = ['Name', 'Id', 'Address', 'Zipcode'] // want in a particular order
		const details =  schools.map(ob => ob.details )
		const values = details.map( ob => headers.map( key => ob[key.toLowerCase()] ) )

		values.unshift(headers)		
		await sheetHelper.clear(spreadsheetId, `${title}!A1:XX`)
		
		return sheetHelper.update(spreadsheetId, values, `${title}!A1` )
	}

	const createOrUpdate = async(school,index) => {
		const id = sheetids.schools[index]
		console.log('id', id)

		const spreadsheet = (id === undefined) ? await sheetHelper.newSpreadSheet(`school-${index}`) : await getSpreadsheet(id)
		console.log(spreadsheet)
		sheetids.schools[index] = spreadsheet.spreadsheetId

		const values = await userPassSheet(school, spreadsheet)
		return scoreSheet(values, spreadsheet, 'multiply')
	}

	await updateMaster(schools)
	await Promise.all( schools.map( createOrUpdate ) )
	
	//await createOrUpdate(school, index) // get working for one

	writeFile()
	return schools
}

module.exports = {
	userPassSheet,
	scoreSheet,
	buildFull
}
