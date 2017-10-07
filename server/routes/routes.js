const mc =  require('../controllers/main_controller')


module.exports = (app) => {
	
	// seed the schools sheet
	app.post('/api/seed-schools', mc.seedSchools)
	app.post('/api/seed-students', mc.seedStudents)
	app.post('/api/full-set-up', mc.fullSetUp)
	//app.post('/api/setup-sheets', mc.setupSheets)

	app.get('/api/sheet-info', mc.sheetInfo)

	// eventually will have route /api/full-setup   -- which would seed schools, students, format the sheets etc

}
