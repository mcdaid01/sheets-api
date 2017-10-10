
// at the moment just useful as getting the same variables in multiple files. Small muck up 
// and it gets the wrong permissions etc
module.exports = {
	tokenFile : 'sheets-api.json', // stored in users/mike/.credentials
	SCOPES : ['https://www.googleapis.com/auth/spreadsheets'], // if change delete the tokenFile so it can be created again
	spreadsheetId : '1Wqb5pemSWD5JCKqFXR7-PdCjFg3z5Cvxtys6h9zNWmU'
}
