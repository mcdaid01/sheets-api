// note might be worth using https://www.npmjs.com/package/google-spreadsheet
// but while learning would prefer to try and use the proper api
const _ = require('lodash')
const express = require('express')
const routes =require('./routes/routes')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const path = require('path')
const gstore = require('gstore-node')

const app = express()
//app.enable('trust proxy')

const publicPath = path.join(__dirname, '../public')

app.use(bodyParser.json())
app.use(express.static(publicPath))
routes(app)

app.use((err,req,res,next)=>{
	console.log('error =',err.message)
	res.status(422).send(err.message)
	next()
})


const server = app.listen(8080, () => {
	const host = server.address().address
	const port = server.address().port

	console.log(`host=${host} port=${port}`)

	console.log(`sheets-api listening at http://${host}:${port}`)
 
})

module.exports = app
