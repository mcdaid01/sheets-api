const mc =  require('../controllers/main_controller')


module.exports = (app) => {
	
	// seed the schools sheet
	app.post('/api/seed-schools', mc.seedSchools)
	app.post('/api/seed-students', mc.seedStudents)
	app.post('/api/full-set-up', mc.fullSetUp)
	//app.post('/api/setup-sheets', mc.setupSheets)

	app.get('/api/sheet-info', mc.sheetInfo)

	app.post('/api/seed-individual-school', mc.sheetIndividualSchool )

	// want to figure out the 'The request is missing a valid API key.'
	// just use for doing stuff quick
	app.post('/api/debug', mc.debug) 

}
