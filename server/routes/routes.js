const mc =  require('../controllers/main_controller')


module.exports = (app) => {
	
	
	// ROUTES IN USE
	
	// get the spreadsheet object back to examine in the browser 
	app.get('/api/spreadsheet/:id', mc.spreadsheet)
	app.get('/api/schools/', mc.schools) 
	app.get('/api/schools/:id', mc.school)
	

	// going to replace with a better name
	app.post('/api/seed-school', mc.seedSchool )
	app.post('/api/seed-full', mc.seedFull )
	

	// want to figure out the 'The request is missing a valid API key.'
	// just use for doing stuff quick
	app.post('/api/debug', mc.debug) 

}
