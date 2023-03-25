const express = require('express')
const cors = require('cors')
const multer = require('multer')
const glob = require('bcrypt')
const fs = require('node:fs/promises')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

const db = require('../db/db')

const saltRounds = 10

const user = "user"
const pass = "pass"
const passHash = "$2a$10$DscTzMhq6OBTSFDSRDg2quX.hij2x9XdpD7EBcoPmeptMXRXTwYGq"
const privateKey = "AoGALwk3aR1/Y+mnrlhrZd1Rh5jA4DwHQhrDvjS3SeCuCwqodVt8RbUL1mOhPBNr"
let tokenBlackList = []

app = express()

app.use(cors({origin: 'http://localhost:3000', credentials: true}))
app.use(cookieParser())