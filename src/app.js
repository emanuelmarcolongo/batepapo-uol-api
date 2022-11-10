import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {MongoClient} from 'mongodb';


dotenv.config();

const app = express();
app.use(cors());
app.use(json());

let userAlreadyExists;
let messageTo;

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;


mongoClient.connect().then(() => {
	db = mongoClient.db("batepapoUOL");
});

app.get("/participants", async (req, res) => {


    try {
    const participants = await db.collection("participants")
    .find()
    .toArray()
    
    res.status(200).send(participants);
    } catch (err) {
        res.status(500).send(err);
    }
})


app.post("/participants", async (req, res) => {
    const {name} = req.body;

    if (!name) {
        res.status(422).send("Coloque um nome");
        return;
    }

    try {
        const participants = await db.collection("participants")
        .find()
        .toArray()
        console.log(participants);

        userAlreadyExists = participants.find((item) => item.name === name);
        if (userAlreadyExists) {
            res.status(409).send("Usuário já cadastrado");
            return;
        }

        db.collection("participants").insertOne({
            name,
            lastStatus: Date.now()
        })
        res.status(201).send("Created")
    } catch (err){
        res.send(err);
    }
})


// app.post("/messages", (req, res) => {
//     const {to, text, type} = req.body;
//     const {user} = req.headers;


//     if (!to || !text) {
//         res.status(422).send("Não deixe campos vazios");
//         return;
//     }

   

//     if (type !== "message" && type !== "private_message"){
//         res.status(422).send("Tipo da mensagem incorreto");
//         return;
//     }

//     db.collection("participants").findOne()
//     .then(response => {
//         messageTo = response.name;
//         console.log(messageTo)
//     })

//     if(!messageTo) {
//         res.status(404);
//         return
//     }

//     res.status(201)

//     // db.collection("messages").insertOne(
//     //     {
//     //         to,
//     //         text,
//     //         type
//     //     }
//     // ).then(() =>  res.status(201).send("Mensagem enviada"))
//     // .catch((err) => res.status(500).send(err))

// })



app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});