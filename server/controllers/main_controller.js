
const [faker, _ ] = [ require('faker'), require('lodash')]

const sheets = require('../sheets/sheets')
const { spreadsheetId } = require('../../config/config.js')
let sheetInfo

sheets.ready().then(() => {
	console.log('sheets ready')
		
	sheets.getInfo(spreadsheetId).then(info => {
		sheetInfo = info
	})

	// comeback make sure understand ranges

	// easier to get working here
	if (false) 
		sheets.batch(spreadsheetId, [ 
			['title', {title : 'sheets-api'}],
			['sheetTitle', {title : 'Sheet 1', sheetId: 0}],
			['freeze', {rowCount : 1, sheetId:0 }],
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


const getSheetTitle = (index) => sheetInfo.sheets[index].properties.title

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
	const id =  first.charAt(0)+last // + '_' +schoolId // this would be done in datastore
	
	return { first, last, id, schoolId } 
}

// important not using the one that is sent
const createSchools = (total) => _.times(totalSchools, (i) => createSchool(i) )
const createStudents = (total) => _.times(totalStudents, () => createStudent() )

// will take out most of this when finished 



// first aim will be just to get some fake data not worry too much about how to get it in the database

// apart from testing doesn't make much sense, if anything would populate the spreadsheet
// the routes would be getting data back from the spreadsheet
// that way could change the spreadsheets themselves




module.exports = { 
	sheets, // used by quick.js
	async seedSchools(req, res, next){
		try{
			const schools = createSchools(req.body.total)
			const keys = Object.keys(schools[0])
			const values = schools.map( ob => Object.values(ob))
			const range = `${getSheetTitle(0)}!A1`
			values.unshift(keys)
			const result = await sheets.update(spreadsheetId, values, range )
			res.send (result)
		}
		catch (e) { next(e) }
	},
	async seedStudents(req, res, next){
		try{
			const students = createStudents(req.body.total)
			const keys = Object.keys(students[0])
			const values = students.map( ob => Object.values(ob))
			values.unshift(keys)
			const range = `${getSheetTitle(1)}!A1`
			const result = await sheets.update(spreadsheetId, values, range )
			
			res.send (result)
		}
		catch (e) { next(e) }
	},
	async fullSetUp(req, res, next){ // this one will create a completely new spreadsheet and populate it
		try{
			// const spread = await sheets.newSpreadSheet('bSpreadsheet')
			
			//console.log('spread created\n\n', spread)

			//console.log('sheets \n\n', spread.sheets)

			const spreadsheetId = '1Wqb5pemSWD5JCKqFXR7-PdCjFg3z5Cvxtys6h9zNWmU'
			const sheetId = 0
			const info = await sheets.getInfo(spreadsheetId)
			console.log(info.sheets.length)

			console.log(info.sheets[1])

			await sheets.batch(spreadsheetId, [ 
				['sheetTitle', {title:'Schools', sheetId: info.sheets[0].sheetId} ], 
				['title', {title : 'sheets-api'}]])
				
			
			//const result = await sheets.batch(spreadsheetId, [ ['title', {title:'Schools'} ] ])
			//const result = await sheets.batch(spreadsheetId, [ ['sheetTitle', {title:'Schools', sheetId} ] ])
			//console.log(result)
			
		}
		catch (e) { 
			console.log(e)
		 }
	},
	async sheetInfo(req, res, next){
		try{
			const info = await sheets.getInfo(spreadsheetId)
			res.send (info)
		}
		catch(e){ next(e) }
	}
}


