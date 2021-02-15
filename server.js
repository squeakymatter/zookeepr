const express = require('express')
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

app.get('/api/animals', (req, res) => {
  // `send()` method from response `res` parameter to send string to client
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

//2. tell server to listen for requests:
app.listen(3001, () => {
  console.log(`API server now on port 3001!`)
})
