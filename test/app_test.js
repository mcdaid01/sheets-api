/* really going to use as a way to fireoff requests without having to use browser so is quicker */

const assert = require('assert')
const request = require('supertest')
const main = require('../server/controllers/main_controller')
const app = require('../server/server')

describe('The express app', () => {
	it ('handles a GET request to /', done => {
		request(app)
			.get('/')
			.end((err, res) => {
				//console.log(res.body, res.status, res)
				assert(res.status === 200)
				assert(res.header['content-type']==='text/html; charset=UTF-8')
				done()
			})
	})

	// sometimes getting an authentication error, changed package.json so it just runs mocha without
	// min flag and it has worked. So might be something to do with everything not quite ready
	// it does not seem to be a real auth message
	it ('handles a GET request to /api/sheet-info', done => {
		request(app)
			.get('/api/sheet-info')
			.end((err, res) => {
				console.log( res.body )
				assert(res.status === 200)
				//assert(res.header['content-type']==='text/html; charset=UTF-8')
				done()
			})
	})

	it ('handles a POST request to /api/debug', done => {
		request(app)
			.post('/api/debug')
			.end((err, res) => {
				console.log( res.body )
				assert(res.status === 200)
				//assert(res.header['content-type']==='text/html; charset=UTF-8')
				done()
			})
	})

	// can't really run this as it needs to send seeded data currently genertate on client
	// it ('handles a POST request to /api/seed-individual-school', done => {
	// 	
	// 	request(app)
	// 		.post('/api/seed-individual-school')
	// 		.send({'test' : 'works'})
	// 		.end((err, res) => {
	// 			console.log(res.body)
	// 			assert(res.status === 200)
	// 			done()
	// 		})
	// })

})
