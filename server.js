const fs = require('fs')
const http = require('http')
const crypto = require('crypto')
const mongodb = require('mongodb')
const querystring = require('querystring')
require('dotenv').config()
const MongoClient = new mongodb.MongoClient(process.env.MONGO_URI)
async function createBytes(){
    const db4 = MongoClient.db("URLs")
    const ab2 = db4.collection("URLs")
    while(true){
        let bytesURL = '/'+crypto.randomBytes(6).toString('hex')
        let dbRecord = await ab2.findOne({idVal: bytesURL})
        if(dbRecord){
            continue
        }
        else{
            return bytesURL
        }
    }
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
        // create the Analytics db and the collection
        const db3 = MongoClient.db("Analytics")
        const ab = db3.collection("Analytics")
        //check whether the parameters exist else create
        let param1 = await ab.findOne({param: "genCount"})
        let param2 = await ab.findOne({param: "accessCount"})
        // Create the TTL index
        await ub.createIndex({expiresAt: 1},{expireAfterSeconds: 0})
        
        // Create the HTTP Server
        http.createServer(async (req,res)=>{
            const method = req.method
            const url = req.url
            // Check for the presence of the URL
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
                    let indexVal = await createBytes()
                    await ub.insertOne({
                        realURL: realURL,
                        expireSeconds: ttl,
                        expiresAt: expiresAt,
                        idVal: indexVal,
                        clickCount: 0
                    })
                    // Update anaytics genCount : Increment by +1
                    await ab.updateOne({param:"genCount"},{$inc: {count: 1}},{upsert: true})
                    let result = process.env.FINAL_URL_TEMPLATE+indexVal
                    res.writeHead(200, {'Content-Type':'text/plain'})
                    res.end(result)
                })
                
            }
            else{
                // if user accesses the url then do redirection else Page Not Found
                let dbRecord = await ub.findOne({idVal: url})
                if(dbRecord){
                    // Update anaytics accessCount : Increment by +1
                    await ab.updateOne({param:"accessCount"},{$inc: {count: 1}},{upsert: true})
                    await ub.updateOne({idVal:url},{$inc: {clickCount: 1}})
                    res.statusCode = 302
                    res.setHeader('Location',dbRecord.realURL)
                    return res.end()
                }
                else{
                    res.writeHead(404, {'Content-Type':'text/html'})
                    fs.createReadStream('pageNotFound.html').pipe(res)
                }
                
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