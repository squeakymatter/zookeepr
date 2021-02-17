//fs is required to write new animal data to animals.json:
const fs = require('fs')
//path - built in node module for working with file and directly paths.
const path = require('path')

const express = require('express')

const PORT = process.env.PORT || 3001
// 1. instantiate the server
const app = express()
//10. tell express.js app to intercept POST request before it gets to callback function. data will be run through function to take raw data transfered over HTTP and convert it to JSON object:
//parse incoming string or array data:
app.use(express.urlencoded({ extended: true }))
//parse incoming JSOn data:
app.use(express.json())

//express.urlencoded = method that takes incoming POt data and converts to key value pairs accessible by `req.body` object
//extended: true = tells server to look for sub-array data in the POST to amke sure it all gets parsed correctly.
//`express.json()` method takes incoming POSt data in JSON form and parses it into `req.body` JavasScript object. Both express.urlencoded() and express.json() are middleware functions that need to be set up every time you create a server taht's looking to accept POST data.

// 3. create route that front-end can request data from
const { animals } = require('./data/animals')
// 3-1. To add to the route:
// `get()` method requires two arguments: 1) string that describes route the client will fetch from 2) callback function that will execute every time route is accessed with a GET request

//4. instead of handling filter functilnaity inside the get() callback, make it its own function. This keeps code maintainable and clean:
function filterByQuery(query, animalsArray) {
  //6. handling queries for one vs multiple personality traits. querying multiple traits returns an array vs. a string, so we need to handle both cases
  let personalityTraitsArray = []
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits]
    } else {
      personalityTraitsArray = query.personalityTraits
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach((trait) => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      )
    })
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    )
  }
  if (query.species) {
    filteredResults = filteredResults.filter(
      (animal) => animal.species === query.species
    )
  }
  if (query.name) {
    filteredResults = filteredResults.filter(
      (animal) => animal.name === query.name
    )
  }
  // return the filtered results:
  return filteredResults
}

// 8/ add function called findById() that takes in the id and array of animals and returns a single animal object:

function findById(id, animalsArray) {
  const result = animalsArray.filter((animal) => animal.id === id)[0] //i don't understand this syntax... why is [0] outside?
  return result
}

app.get('/api/animals', (req, res) => {
  //?? `send()` method from response `res` parameter to send string to client
  //   res.send('Hello!')
  // 3-2. update res.send() to res.json() to send JSON. send() is fine for short messages but not for sending JSON
  // 3-3. use `filterByQuery() to handle queries. This way we don't return the entire JSON data
  let results = animals
  //5. call filterByQuery() in app.get() call back:
  if (req.query) {
    results = filterByQuery(req.query, results)
  }
  res.json(results)
})

//set up route on server that accepts data to be used or stored server-side:
app.post('/api/animals', (req, res) => {
  //12. set id based on what the next index of the array will be
  req.body.id = animals.length.toString()
  //16. if any data in req.body is incorrect, send 400 error back:
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.')
  } else {
    //13. add animal to json file and animals array in this function:
    const animal = createNewAnimal(req.body, animals)
    res.json(animal)
  }
})

// 7. unlike the query object, the param object needs to be defined in the route path, with route/:<parameterName>. create a new GET route for animals, this time adding :id to the end of the route. This will give us multiple routes.
app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals)
  //9. if no record exists, send a 404 error.
  if (result) {
    res.json(result)
  } else {
    res.send(404)
  }
})

//11. create separate function to handle taking data from `req.body` and adding it to animals.json file (this adds new animals to the catalog!):
function createNewAnimal(body, animalsArray) {
  //13. when we POST a new animal, add it to the imported `animals` array from the `animals.json` file.
  const animal = body
  animalsArray.push(animal)
  console.log(body)

  //14. use fs writeFileSync method, which is synchronous version of fs.writeFile() and doesn't require a callback function. If writing to lager data set, async would work better. This writes our animals.json file in the data subdirectory so we use the mehod path.join() to join the value of the directory name of the file we execute the code in (current directory, most likely) with the path to the animals.json file.
  //save JS array data as JSON using JSON.stringify() to convert it. `null` and `2` keep data formatted: null means if we don't want to edit existing data. 2 means we want to create whitespace between our values to make it more readable. Otherwise, the json file would be had to read.
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({ animals: animalsArray }, null, 2)
  )

  //return finished code to post route for response
  return animal
}
//createNewAnimal() acepts teh POST route's req-body value and the array we want to add data to--`animalsArray`.

//15. add validation that takes new animal data from `req.body` and check if each key not only exists but that it's the right type of data:
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return true
  }
}

//2. tell server to listen for requests:
app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`)
})
