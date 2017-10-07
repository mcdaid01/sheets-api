// rather than use the web server have to deal with browser quicker to build routes using this helper

const google = require('googleapis')
const authentication = require('../server/sheets/authentication')
const main = require('../server/controllers/main_controller')

main.sheets.ready().then(() => {
	console.log('sheets ready!')

	main.fullSetUp()
})

console.log('ok')
