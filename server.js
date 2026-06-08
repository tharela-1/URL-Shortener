const fs = require('fs')
const http = require('http')
const crypto = require('crypto')
const mongodb = require('mongodb')
const querystring = require('querystring')
require('dotenv').config()
const MongoClient = new mongodb.MongoClient(process.env.MONGO_URI)
function createBytes(){
    return crypto.randomBytes(6).toString('hex')
}
async function connectDB(){
    try{
        await MongoClient.connect()
        console.log("Connected to MongoDB Successfully")

        // create the Feedback db and the collection
        const db = MongoClient.db("Feedback")
        const fb = db.collection("Feedback")
        // create the URL db and the collection
        const db2 = MongoClient.db("URLs")
        const ub = db2.collection("URLs")
        // Create the TTL index
        await ub.createIndex({expiresAt: 1},{expireAfterSeconds: 0})
        http.createServer((req,res)=>{
            const method = req.method
            const url = req.url

            if(url==='/'){
                res.statusCode = 301
                res.setHeader('Location','/home')
                return res.end()
            }
            else if(url==='/home'){
                res.writeHead(200, {'Content-Type':'text/html'})
                fs.createReadStream('./index.html').pipe(res)
            }
            else if(url==='/style.css'){
                res.writeHead(200, {'Content-Type':'text/css'})
                fs.createReadStream('./style.css').pipe(res)
            }
            else if(url==='/script.js'){
                res.writeHead(200, {'Content-Type':'application/javascript'})
                fs.createReadStream('./script.js').pipe(res)
            }
            else if(url==='/help'){
                res.writeHead(200, {'Content-Type':'text/html'})
                fs.createReadStream('help.html').pipe(res)
            }
            else if(method === 'POST' && url==='/sendFeedback'){
                let body = ""
                req.on('data',(chunk)=>{
                    body+=chunk.toString()
                })
                req.on("end",async()=>{
                    let data = querystring.parse(body)
                    await fb.insertOne({
                        feedback: decodeURIComponent(data.feedback)
                    })
                    res.writeHead(200,{'Content-Type':'text/plain'})
                    res.end()
                })
            }
            else if(method==="POST" && url==='/sendURL'){
                let body = ""
                req.on('data',(chunk)=>{
                    body+=chunk
                })
                req.on("end",async()=>{
                    let data = querystring.parse(body)
                    let realURL = decodeURIComponent(data.realURL)
                    let ttl = Number(data.ttl)
                    let expiresAt = new Date(Date.now()+(1000*ttl))
                    let indexVal = createBytes()
                    await ub.insertOne({
                        realURL: realURL,
                        expireSeconds: ttl,
                        expiresAt: expiresAt,
                        idVal: indexVal,
                        clickCount: 0
                    })
                    let result = process.env.FINAL_URL_TEMPLATE+indexVal
                    res.writeHead(200, {'Content-Type':'text/plain'})
                    res.end(result)
                })
                
            }
            else{
                res.writeHead(404, {'Content-Type':'text/html'})
                fs.createReadStream('pageNotFound.html').pipe(res)
            }
        }).listen(process.env.PORT, '0.0.0.0', ()=>{
                console.log("Server is listening")
        })
    }
    catch(err){
        console.log("Connection Error: "+err)
    }
}

connectDB()