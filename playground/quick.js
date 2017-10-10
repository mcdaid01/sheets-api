// rather than use the web server have to deal with browser quicker to build routes using this helper

const google = require('googleapis')
const authentication = require('../server/sheets/authentication')
const main = require('../server/controllers/main_controller')

main.sheetHelper.ready().then(() => {
	console.log('sheets ready!')
	setTimeout(() => main.fullSetUp(), 100)
	
})

console.log('ok')
