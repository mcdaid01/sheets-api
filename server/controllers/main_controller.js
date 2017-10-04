
const [faker, _ ] = [ require('faker'), require('lodash')]

const createSchool = ()=>{
	
	const lastWord = () => _.sample(['Secondary School','High School','Academy','Middle School']) 
	
	const schoolProps = {
		name: `St ${faker.name.firstName()} ${lastWord()}`,
		id: faker.address.countryCode()+Math.floor(Math.random()*10000), // faked for now see json/countries.json
		address:[faker.address.streetAddress(),faker.address.county(),faker.address.state()], // state easier to query 
		zipcode:faker.address.zipCode(),
		active:Math.random()>0.2
	}
		
	return schoolProps
}

const createSchools = (total) => _.times(total , () => createSchool() )

// will take out most of this when finished 



// first aim will be just to get some fake data not worry too much about how to get it in the database

// apart from testing doesn't make much sense, if anything would populate the spreadsheet
// the routes would be getting data back from the spreadsheet
// that way could change the spreadsheets themselves
const seedSchools = (req,res,next)=>{
	try{
		const total = req.body.total

		
		res.send (createSchools(total))
	}
	catch (e) { next(e) }
}


module.exports = { seedSchools }
