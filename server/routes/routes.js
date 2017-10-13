const mc =  require('../controllers/main_controller')


module.exports = (app) => {
	
	// some of these routes are not needed anymore, as goal is to seed from the client
	app.post('/api/seed-schools', mc.seedSchools)
	app.post('/api/seed-students', mc.seedStudents)
	app.post('/api/full-set-up', mc.fullSetUp)
	//app.post('/api/setup-sheets', mc.setupSheets)


	// ROUTES IN USE
	
	// get the spreadsheet object back to examine in the browser 
	app.get('/api/spreadsheet', mc.spreadsheet)

	// going to replace with a better name
	app.post('/api/seed-school', mc.seedSchool )
	app.post('/api/seed-full', mc.seedFull )
	

	// want to figure out the 'The request is missing a valid API key.'
	// just use for doing stuff quick
	app.post('/api/debug', mc.debug) 

}
