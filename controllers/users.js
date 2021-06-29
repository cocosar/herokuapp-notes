const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

/* Get all users */
usersRouter.get('/', async (request, response) => {
    const users = await User
        // Para rellenar users con las notes de cada uno y filtrar los params de notes
        .find({}).populate('notes', { content: 1, date: 1 })
    response.json(users)
})
/* Create a new user */
usersRouter.post('/', async (request, response) => {
    const body = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
})

module.exports = usersRouter