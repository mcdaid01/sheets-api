
const [faker, _ ] = [ require('faker'), require('lodash')]

const sheets = require('../sheets/sheets')
const { spreadsheetId } = require('../../config/config.js')
let sheetInfo
sheets.ready().then(() => {
	console.log('ready motherfucker')
	sheets.getInfo()
	
})  

const totalSchools = 12
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
	const id =  first.charAt(0)+last + '_' +schoolId
	
	return { first, last, id, schoolId } 
}

// important not using the one that is sent
const createSchools = (total) => _.times(totalSchools, (i) => createSchool(i) )
const createStudents = (total) => _.times(total, () => createStudent() )

// will take out most of this when finished 



// first aim will be just to get some fake data not worry too much about how to get it in the database

// apart from testing doesn't make much sense, if anything would populate the spreadsheet
// the routes would be getting data back from the spreadsheet
// that way could change the spreadsheets themselves




module.exports = { 
	async seedSchools(req, res, next){
		try{
			const schools = createSchools(req.body.total)
			const keys = Object.keys(schools[0])
			const values = schools.map( ob => Object.values(ob))
			values.unshift(keys)
			const result = await sheets.update(spreadsheetId, values )
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
			const result = await sheets.update(spreadsheetId, values )
			res.send (result)
		}
		catch (e) { next(e) }
	}
}
