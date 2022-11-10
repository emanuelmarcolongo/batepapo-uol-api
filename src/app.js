import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {MongoClient, ObjectId} from 'mongodb';
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
        userAlreadyExists = participants.find((item) => item.name === name);

        if (userAlreadyExists) {
            res.status(409).send("Usuário já cadastrado");
            return;
        }

        db.collection("participants").insertOne({
            name,
            lastStatus: Date.now()
        });

        db.collection("messages").insertOne({
                from: "xxx",
                to: "Todos",
                text: "entra na sala...",
                type: "status",
                time: dayjs().format("HH-mm-ss")
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

    if (!user) {
        res.status(422).send("headers: user não consta");
        return;
    }

    try {
        messageFrom = await db.collection("participants").findOne({name: user});

        if (!messageFrom) {
            res.status(422).send("Remetente inválido");
            return;
        }

        db.collection("messages").insertOne(
            {
                from: user,
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
})

app.get("/messages", async (req, res) => {
    const {user} = req.headers;
    const {limit} = req.query;

    if (!user) {
        res.sendStatus(401);
        return;
    }
    try {

        const allMessages = await db.collection("messages").find().toArray();
        const allowedMessages = allMessages.filter((i) => (i.from === user || i.to === user) || i.to === "Todos");

        if (limit) {
            if (limit > allowedMessages.length) {
                res.status(200).send(allowedMessages);
                return;
            }
            const limitMessages = allowedMessages.slice(allowedMessages.length - limit)
            res.status(200).send(limitMessages);
            return;
        }
        
        res.status(200).send(allowedMessages);
    } catch {
        res.status(500).send("Algo deu errado com a requisição")
    }

})

app.delete("/messages/:id", async (req, res) => {
    const {id} = req.params;
    const {user} = req.headers;

    
    try {
        await db.collection("messages").deleteOne({ _id: ObjectId(id) });
        res.status(200).send("Deleted");
    } catch (err){
        res.sendStatus(500);
    }
        
})

app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});