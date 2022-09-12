const express = require('express')
const app =  express()
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')


const jwtSecret = "aliyhd45672fj674ndt674jf74dsewy3087"

app.use(cors())
// iniciando body-parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json()) // converter o corpo da requisição para json

// middleware e um função que e executada antes da sua requisição ser executada
function auth(req, res, next) {

    // na hora que o usuario manda a req , pega dado que esta num header dentro do authorization
    const authToken = req.headers['authorization']
    
    if (authToken != undefined) { 

        const bearer = authToken.split(' ')
        let token = bearer[1]

        jwt.verify(token, jwtSecret,(err, data) => {
            if(err) {
                res.status(401)
                res.json({err: "Token inválido"})
            } else {
                // console.log(data)
                req.token = token
                req.loggedUser = {id: data.id, email: data.email}
                next()
            }
        })

    } else {
        res.status(401)
        res.json({err: "Token inválido"})
    }
    
}

// BD False
let DB = {

    games: [

        {
            id: 23,
            title: 'Call of duty MW',
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: 'Sea of thieves',
            year: 2018,
            price: 40  
        },
        {
            id: 2,
            title: 'Minecraft',
            year: 2012,
            price: 20
        },
        
    ],
    users: [
        {
            id: 1,
            name:'Vitor lima',
            email: 'victorlima@gmail.com',
            password: 'nodejs123'
        },
        {
            id: 2,
            name: 'Marcos Eduardo',
            email: 'marcoseduardo@gmail',
            password: 'js123'
        }
    ]

}

// Endpoint
    // Listagem de todos os games que existem no sistema
    app.get('/games', auth, (req, res) => {
        res.statusCode = 200
        res.json(DB.games)
    })
    // Listando pelo id
    app.get('/game/:id', (req, res) => {

        let id = req.params.id
        
        if(isNaN(id)) {
            res.sendStatus(400)
        } else {

            let intId = parseInt(id)

            // busca no banco o id igual o passado no parâmetro e salva na variavel
            let game = DB.games.find(game => game.id == intId)

            if(game != undefined) {
                res.json(game)
            } else {
                res.sendStatus(404)
            }
        }
        
    })
    // cadastrando um game
    app.post('/game', auth, (req ,res) => {
        
        // destruturação
        let {title, price, year} = req.body;

        let erros = []

        if(title.length === 0 || price.length === 0 || year.length === 0) {
            erros.push('Campo vazio')
        }

        if(!isNaN(title) || isNaN(price || year)) {
            erros.push('titulo não pode seu um numero ou preço e ano não pode ser letras')
        }

        if(erros.length > 0) {
            res.sendStatus(400)
        } else {

            DB.games.push({
                id: 2323,
                title,
                price,
                year
            })

            res.sendStatus(200)
        }
    })
    // deletando um game
    app.delete('/game/:id', auth, (req, res) => {
        
        let id = req.params.id
        
        if(isNaN(id)) {
            res.sendStatus(400)
        } else {

            let intId = parseInt(id)

            // achar o indice de um game que tenha o id igual ao id passado via paramentro
            let index = DB.games.findIndex(game => game.id == intId)

            if(index == -1) {
                res.statusCode(404)
            } else {
                // delatando o index e deletando apenas um elemento a partir deste index
                DB.games.splice(index, 1)
                res.sendStatus
            }

        }
        
    })
    // Atualizar
    app.put('/game/:id', auth, (req, res) => {

        let id = req.params.id
        
        if(isNaN(id)) {
            res.sendStatus(400)
        } else {

            let intId = parseInt(id)

            // busca no banco o id igual o passado no parâmetro e salva na variavel
            let game = DB.games.find(game => game.id == intId)

            if(game != undefined) {
                
                // buscando os dados que vem do corpo da requisição
                let {title, price, year} = req.body;

                if(title != undefined) {
                    game.title = title
                }

                if(price != undefined) {
                    game.price = price
                }

                if(year != undefined) {
                    game.year = year
                }

                res.sendStatus(200)
                
            } else {
                res.sendStatus(404)
            }
        }

    })

app.post('/auth', (req, res) => {

    let {email, password} = req.body

    if(email != undefined) {
        
        let user = DB.users.find(user => user.email == email)

        if(user != undefined) {

            if(user.password == password) {
                // quais informações quero carregar
                jwt.sign({id: user.id, email: user.email}, jwtSecret,{expiresIn: '48h'}, (err, token) => {
                    if(err) {
                        res.status(400)
                        res.json({err: 'Falha interna'})
                    } else {
                        res.status(200)
                        res.json({token: token})
                    }
                }) 

            } else {
                res.status(401)
                res.json({err: "Credenciais inválidas"})
            }

        } else {
            res.status(400)
            res.json({err: "O E-mail enviado não existe na base de dados"})
        }

    } else {
        res.status(400)
        res.json({err: "O E-mail enviado é inválido"})
    }

})

app.listen(6061, () => {
    console.log('API STARTED!')
})