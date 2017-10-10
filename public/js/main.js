const words = [ 'mass', 'bang', 'near', 'bear', 'beam', 'game', 'mars', 'tame', 'mate', 'free', 'reef',
	'date', 'Fred', 'grit', 'tied', 'tide', 'diet', 'hide', 'hear', 'here', 'hope', 'read', 'echo', 'cool', 
	'hole', 'cold', 'cafe', 'fire', 'quit', 'exit', 'from', 'move', 'rice', 'teen', 'four', 'two', 'one', 
	'zero', 'five', 'six', 'nine', 'ten', 'come', 'came', 'live', 'life', 'good', 'stay', 'goes',
	'frog', 'huge', 'hell', 'have', 'home', 'door', 'reed', 'need', 'feed', 'roof', 'fame', 'lame', 
	'kill', 'keep', 'leek', 'tree', 'race', 'face', 'maze', 'lace', 'all', 'and', 'any', 'are', 'bad', 'bet',
	'big', 'box', 'boy', 'bye', 'can', 'car', 'cat', 'cup', 'cut', 'day', 'did', 'dog', 'dry',
	'eat', 'eve', 'fly', 'for', 'get', 'had', 'has', 'her', 'him', 'his', 'hot', 'how', 
	'huh', 'hum', 'let', 'lot', 'man', 'may', 'mom', 'new', 'not', 'off', 'old', 'our', 'out', 'pet', 'put',
	'red', 'run', 'saw', 'say', 'see', 'she', 'sit', 'some', 'the', 'too', 'top', 'try', 'use', 'was', 'way', 
	'who', 'why', 'yes', 'yet', 'you']

const joins = '0,1,2,3,4,5,6,7,8,9,_,+,-'.split(',')


class Util{

	// returns a generator that spits out every combination
	// potentially could add a third argument so stops when
	// it has run out of combinations
	combinations(arr1, arr2) { 
		function* combo(arr1, arr2){
			let counter1 = 0
			let counter2 = 0
	
			const getIndex1 = () => ++ counter1 % arr1.length
			const getIndex2 = (index) => (index === 0 ? counter2 ++ : counter2) % arr2.length 
		
			while (true){
				const index1 = getIndex1()
				const index2 = getIndex2(index1)
				// console.log(index1,index2,counter1,counter2)
	
				yield [ arr1[index1], arr2[index2]  ]
			} 
		}
		return combo(arr1, arr2)  
	}
	genPassword(totalWords){
		const getWord = () => _.sample(words)
		const getJoin = () => _.sample(joins)
		const arr = _.flatMap( _.times(totalWords, () => [getJoin(), getWord()] ) ) 
	 
	   _.random() === 0 ? arr[arr.length-1] = arr.shift() : '' // sends the first join to back 50% of time
	 
	   return arr.join('')
	}
	getUserName(first, last){
		return first.charAt(0)+last
	}
	genSchool(info) {
		const headers = ['first', 'last', 'year', 'form', 'user', 'password']
		const genFormYear = this.combinations(info.forms, info.years)
		const genStudent = (gen) => {
			
			const [form, year] = gen.next().value
			const [first, last] = [faker.name.firstName(), faker.name.lastName()]
		
			return [first, last, year, form, this.getUserName(first, last), this.genPassword(2) ]
		}
		
		const students = _.times(info.total, () => genStudent(genFormYear)  )
		return { headers, students }
	}
}

class App {
	constructor(url) {
		this.url = url
		this.util = new Util()

		//$.getJSON( url+'/api/data', data => this.buildList(data) )
		this.buildList()
	}

	post(url, data){
		return new Promise( (resolve, reject) => {
			
			if (data.hasOwnProperty('fun'))
				data = this.functions(data.fun)()

			console.log('sending = ', data)


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
		console.log(`fun name=${name}`)

		return {
			time:() => new Object({timestamp:Date.now(), animal:_.sample(['dog', 'cat', 'bunny', 'snake'])}),
			seedIndividualSchool: () => {
				const schoolInfo = {
					forms : ['Manor', 'Grange', 'Park'],
					years : [7, 8, 9],
					total : 30
				}

				return this.util.genSchool(schoolInfo)
			}
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

		
		// note totals hard coded
		this.buildLink('POST /seed-schools', 'seed-schools', 'will update first sheet with new schools', {total:5}) 
		this.buildLink('POST /seed-students', 'seed-students', 'will update second sheet with new students', {total:5})

		// again don't think what gets sent matters
		this.buildLink('POST /full-set-up', 'full-set-up', 'create new populated spreadsheet', 
			{title:'full-school', schoolsTotal:2, studentsTotal:20})
			
		this.buildLink('POST /api/seed-individual-school', 'seed-individual-school', 'create data for a typical school', 
			{fun: 'seedIndividualSchool'})
				
		this.buildLink('GET /sheet-info', 'sheet-info', 'view the information object for sheet')
		
		//this.buildLink('GET /timestamps','timestamps','get items that have been stored')
		//this.buildLink('POST /storeitem','storeitem','send a timestamp that will be stored on server',{fun:'time'}) 
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

const app = new App('')


