'use strict'

class App {
	constructor(url) {
		this.url = url

		//$.getJSON( url+'/api/data', data => this.buildList(data) )
		this.buildList()
	}

	post(url, data){
		return new Promise( (resolve, reject) => {
			
			if (data.hasOwnProperty('fun'))
				data = this.functions(data.fun)()

			console.log(data)


			$.ajax({
				type: 'POST',
				url,
				data:JSON.stringify(data),
				success: (data) => resolve(data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				error:(xhr, ajaxOptions, thrownError) => reject(xhr, ajaxOptions, thrownError)
			  })
		})
	}

	functions(name){
		console.log(name)

		return {
			time:() => new Object({timestamp:Date.now(), animal:_.sample(['dog', 'cat', 'bunny', 'snake'])})
		}[name]
	}

	buildLink(desc, path, title, data){
		console.log(path)
		const $li = $('<li>').appendTo($('#actions'))
		const $a= $('<a>')
			.attr({
				href:this.url+'/api/'+path,
				title 
			}).html(desc).appendTo($li)

		const overide = () => {
			$a.data(data).on('click', (evt) => {
				const $this = $(evt.target)
				evt.preventDefault()
				this.post($this.attr('href'), $this.data())
					.then(data => {
						console.log(data)
						window.data = data
					})
					.catch((e) => console.log(e))
			})
		}

		data ? overide(data) : ''
	}

	buildList(data){

		if (true){
			// note totals hard coded
			this.buildLink('POST /seed-schools', 'seed-schools', 'will update first sheet with new schools', {total:5}) 
			this.buildLink('POST /seed-students', 'seed-students', 'will update second sheet with new students', {total:5})


			this.buildLink('POST /full-set-up', 'full-set-up', 'create new populated spreadsheet', 
				{title:'full-school', schoolsTotal:2, studentsTotal:20})
			
			

			this.buildLink('GET /sheet-info', 'sheet-info', 'view the information object for sheet')
		
			//this.buildLink('GET /timestamps','timestamps','get items that have been stored')
			//this.buildLink('POST /storeitem','storeitem','send a timestamp that will be stored on server',{fun:'time'})

			
		}
		else{
			window.data=data
			const school = data[0]

			const student1 = data[1].students[0]
			const {password, id} = student1
		
			this.buildLink('GET /data', 'data', 'view the sample data')
			this.buildLink('GET /datalists', 'datalists', 'view lists of schools teachers and students')
			this.buildLink('GET /school/:id', `school/${school._id}`, 'get school based on its objectId')
			this.buildLink('GET /students/:id', `students/${school._id}`, 'list students from a school based on school objectId')
			this.buildLink('GET /schoolId/:id', `schoolid/${school.id}`, 'get school from it schoolId ')

			// get working without password first, need user
			this.buildLink('POST /student', 'student', 'get a user back based on schoolId studentId. fake login!',
				{'schoolId':data[1].id, id, password})

			this.buildLink('POST /students', 'students', 'simulate adding student', {
				_id:school._id, students : this.seedStudents()
			})
		}

		// realise this one not making a lot of sense, would be better to do username,schoolId,password
		// would be sent as json anyway, so just concentrate on routes that make sense
		// this.buildLink('GET /api/student/:schoolId/:studentId',`student/${data[1]._id}/${data[1].students[0]._id}`)
		 
	}

	seedStudents(total = 3){
		
		const createStudent= () => {
			const [first, last]=[faker.name.firstName(), faker.name.lastName()]
			// const schoolId =  _.sample(schoolIds)
			// const id =  first.charAt(0)+last // might be done on the server
			
			return {
				name : `${first} ${last}`
			}
		}
		
		return _.times(total, () => createStudent()) 
	}
}

console.log($)

const app = new App('')
//app.addListeners()
