const google = require('googleapis')


const authentication = require('../sheets/authentication')
const sheetHelper = require('../sheets/sheet-helper')
const buildSchool = require('../sheets/build-school')

//const { spreadsheetId } = require('../../config/config.js')


sheetHelper.ready().then(() => {
	console.log('sheets ready!!') 	
})

const getData = (auth, range, spreadsheetId) => {
	const sheets = google.sheets('v4')
	const toJson = (rows) => {
		const headers = rows.shift().map(txt => txt.toLowerCase())
		const json = rows.map(row => {
			const ob = {}
			headers.forEach( (key, index) => ob[key] = row[index] )
			return ob
		})

		return json
	}

	return new Promise((resolve, reject) => {

		sheets.spreadsheets.values.get({ auth, range, spreadsheetId }, (err, response) => {
			const rows = response.values
			err ? reject(err) : rows.length===0 ? reject('no data') : resolve(toJson(rows))
		})
	})
}

const getSchools = () => {
	return new Promise((resolve, reject) => {
		authentication.authenticate().then(auth => {
			const range = 'schools!A1:E'
			const spreadsheetId = '17c85kM11wmaOpSvLrv5mNsHS2-0aOVZU3D0esJfXmKQ'
			getData(auth, range, spreadsheetId)
				.then( json => resolve(json))
				.catch( err => reject(err))
		})
	})
}

const getSchool = spreadsheetId => {
	return new Promise((resolve, reject) => {
		authentication.authenticate().then(auth => {
			const range = 'Students!A1:F'
			getData(auth, range, spreadsheetId)
				.then( json => resolve(json))
				.catch( err => reject(err))
		})
	})
}


module.exports = { 
	sheetHelper, // used by quick.js
	
	async spreadsheet(req, res, next){
		
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
				
			const values = await buildSchool.buildFull(req.body)
			res.send ({complete:values.length})
		}
		catch(e){ next(e) }
	},
	async schools(req, res, next){ // essentially returns json version of schools-master spreadsheet
		try{						
			const schools = await getSchools()
			res.send (schools)
		}
		catch(e){ next(e) }
	},
	async school(req, res, next){ // essentially returns json version of schools-master spreadsheet
		try{						
			const id = req.params.id
			const school = await getSchool(id)
			res.send (school)
		}
		catch(e){ next(e) }
	},
	async debug (req, res, next){
		try{
			// change to its own route but convenient to do here
			const sheetids = require('../sheetids.json')

			res.send(sheetids)		
		}
		catch(e) { next(e) }
	}
}
