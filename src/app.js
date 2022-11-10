import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {MongoClient} from 'mongodb';
import dayjs from "dayjs"

dotenv.config();

const app = express();
app.use(cors());
app.use(json());


let userAlreadyExists;
let messageFrom;

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


app.post("/messages", async (req, res) => {
    const {to, text, type} = req.body;
    const {user} = req.headers;

    if (!to || !text) {
        res.status(422).send("Não deixe campos vazios");
        return;
    }

    if (type !== "message" && type !== "private_message"){
        res.status(422).send("Tipo da mensagem incorreto");
        return;
    }

    try {
        messageFrom = await db.collection("participants").findOne({name: user});

        if (!messageFrom) {
            res.status(400).send("Remetente inválido");
            return;
        }

        db.collection("messages").insertOne(
            {
                to,
                text,
                type,
                time: dayjs().format("HH-mm-ss")
            }
        )
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err);
    }
    

    // db.collection("messages").insertOne(
    //     {
    //         to,
    //         text,
    //         type
    //     }
    // ).then(() =>  res.status(201).send("Mensagem enviada"))
    // .catch((err) => res.status(500).send(err))

})



app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});