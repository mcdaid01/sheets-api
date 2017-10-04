const mc =  require('../controllers/main_controller')


module.exports = (app) => {
	
	// seed the schools sheet
	app.post('/api/seed-schools',mc.seedSchools)
}
