const express = require('express')

const PORT = process.env.PORT || 3001
// 1. instantiate the server
const app = express()
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

//2. tell server to listen for requests:
app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`)
})
