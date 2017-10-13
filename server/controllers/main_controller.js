const [faker, _ ] = [ require('faker'), require('lodash') ]

const sheetHelper = require('../sheets/sheet-helper')
const buildSchool = require('../sheets/build-school')

const { spreadsheetId } = require('../../config/config.js')

let spreadsheet

sheetHelper.ready().then(() => {
	console.log('sheets ready!!')
		
	sheetHelper.getSpreadsheet(spreadsheetId).then(spreadsheet => {
		spreadsheet = spreadsheet
		//console.log(spreadsheet.sheets)
	})

	// at some point should move this stuff into playground
	if (false)
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

	// easier to get working here, just a bunch of batch operations
	if (false) 
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
})

// note if change stuff like a tab name then spreadsheet will be out of date so won't get correct title back
const getSheetTitle = (index) => spreadsheet.sheets[index].properties.title
const getSheetId = (index) => spreadsheet.sheets[index].properties.sheetId

const totalSchools = 5
const totalStudents = totalSchools*5 // no point in making massive yet

const schoolIds = []
_.times(totalSchools, (i) => schoolIds.push('sch-'+ _.padStart(i, 3, '0')) )

const createSchool = index => {
	
	const lastWord = () => _.sample(['Secondary School', 'High School', 'Academy', 'Middle School']) 
	
	const schoolProps = {
		name: `St ${faker.name.firstName()} ${lastWord()}`,
		id: schoolIds[index], // faked for now see json/countries.json

		// note joining it here for the sake of spreadsheet
		address:[faker.address.streetAddress(), faker.address.county(), faker.address.state()].join(','), // state easy query
		zipcode:faker.address.zipCode(),
		active:Math.random()>0.2
	}
		
	return schoolProps
}

const createStudent = () => {
	
	const [first, last]=[faker.name.firstName(), faker.name.lastName()]
	const schoolId = _.sample(schoolIds)
	const id =  first.charAt(0) + last // + '_' +schoolId // this would be done in datastore
	
	return { first, last, id, schoolId } 
}

// important not using the one that is sent
const createSchools = (total) => _.times(total, (i) => createSchool(i) )
const createStudents = (total) => _.times(total, () => createStudent() )

// will take out most of this when finished 



// first aim will be just to get some fake data not worry too much about how to get it in the database

// apart from testing doesn't make much sense, if anything would populate the spreadsheet
// the routes would be getting data back from the spreadsheet
// that way could change the spreadsheets themselves

const toTable = arr => {
	const keys = Object.keys(arr[0])
	const values = arr.map( ob => Object.values(ob))
	values.unshift(keys)
	return values
}


module.exports = { 
	sheetHelper, // used by quick.js
	async seedSchools(req, res, next){
		try{
			const schools = createSchools(req.body.total)
			const values = toTable(schools)
			const range = `${getSheetTitle(0)}!A1`
			const result = await sheetHelper.update(spreadsheetId, values, range )
			res.send (result)
		}
		catch (e) { next(e) }
	},
	async seedStudents(req, res, next){
		try{
			const students = createStudents(req.body.total)
			const values = toTable(students)
			const range = `${getSheetTitle(1)}!A1`
			const result = await sheetHelper.update(spreadsheetId, values, range )
			
			res.send (result)
		}
		catch (e) { next(e) }
	},
	async fullSetUp(req, res, next){
		
		// does not create a completely new spreadsheet
		const schoolsCount = 5
		const studentsCount = schoolsCount * 30

		const styleHeaders = (spreadsheetId, index) => {
			
			return sheetHelper.batch(spreadsheetId, [
				['userEnteredFormat', { 
					range:{ sheetId:getSheetId(index), startRowIndex:0, endRowIndex:1  }, //   
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
				}]])
		}

		const populate = (spreadsheetId, index, values) => {
			let range = `${getSheetTitle(index)}!A1`
			return sheetHelper.update(spreadsheetId, values, range )
		}
		
		try{
			
			const spreadsheet = await sheetHelper.getSpreadsheet(spreadsheetId)
			
			const arr = [ 
				['title', {title : 'sheets-api'}],
				['sheetTitle', {title:'Schools', sheetId: getSheetId(0) } ],
			]

			if (spreadsheet.sheets.length === 1)
				arr.push(['addSheet', { title:'Students', 'rowCount':studentsCount, 'columnCount': 5 }])
			
			await sheetHelper.batch(spreadsheetId, arr )

			await Promise.all(_.times(2, i => {
				styleHeaders(spreadsheetId, i)
				return sheetHelper.clear(spreadsheetId, `${getSheetTitle(i)}!A1:XX`)
			}))
			
			
			const schools = createSchools(schoolsCount)
			let values = toTable(schools)
			await populate(spreadsheetId, 0, values)
			
			const students = createStudents(studentsCount)
			values = toTable(students)
			await populate(spreadsheetId, 1, values)

			res.send ('setup complete')
		}
		catch (e) { next(e) }
	},
	async spreadsheet(req, res, next){
		console.log(req)
		try{
			const spreadsheetId = req.params.id
			const spreadsheet = await sheetHelper.getSpreadsheet(spreadsheetId)
			res.send (spreadsheet)
		}
		catch(e){ next(e) }
	},
	async seedSchool(req, res, next){ // from client data
		try{
			//if (true)
			//	return res.send(req.body)
			
			const spreadsheet = await sheetHelper.getSpreadsheet('1RvUHgJvTgyHEQbD52o-9vj4s-vspdjUBYsQG7TSPAe0')
				
			const values = await buildSchool.userPassSheet(req.body, spreadsheet)
			await buildSchool.scoreSheet(values, spreadsheet, 'multiply')
			res.send (values)
		}
		catch(e){ next(e) }
	},
	async seedFull(req, res, next){ // from client data do a complete set up of many schools
		try{						// then can be downloaded to use in databases
			//if (true)
			//	return res.send(req.body)
				
			const values = await buildSchool.buildFull(req.body)
			res.send (values)
		}
		catch(e){ next(e) }
	},
	async debug (req, res, next){
		try{
			sheetHelper.batch('17c85kM11wmaOpSvLrv5mNsHS2-0aOVZU3D0esJfXmKQ', [['freeze', {rowCount : 1, sheetId:0 }]] )
			res.send({debug:'you'})		
		}
		catch(e) { next(e) }
		
	}
}


