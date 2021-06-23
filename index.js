require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')

/* DEFINITIONS */
const app = express();
/* const PORT = process.env.PORT */


/* MIDDLEWARES */
// Configurations
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// Calls
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger);
app.use(cors())


let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2019-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2019-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2019-05-30T19:20:14.298Z",
        important: true
    }
]

/* ROUTING */

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

/* app.get('/api/notes', (request, response) => {
    response.json(notes)
}) */
app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

/* DELETE */
app.delete('/api/notes/:id', (request, response) => {
    Note.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
/* PUT - CHANGE IMPORTANCE */
app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

/* FUNCTION TO GENERATE ID's */
/* const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
} */

/* POST */
app.post('/api/notes', (request, response, next) => {
    const body = request.body
    if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    /* notes = notes.concat(note) */

    // response.json(note)

    note
        .save()
        .then(savedNote => savedNote.toJSON())
        .then(savedFormattedNote => {
            response.json(savedFormattedNote)
        })
        .catch(error => next(error))

})

app.use(unknownEndpoint)
// this has to be the last loaded middleware.
app.use(errorHandler)

/* PORT BIND AND LISTEN */

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})