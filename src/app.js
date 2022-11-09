import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {MongoClient} from 'mongodb';
import e from 'express';


dotenv.config();

const app = express();
app.use(cors());
app.use(json());

let userAlreadyExists;

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;


mongoClient.connect().then(() => {
	db = mongoClient.db("batepapoUOL");
});

app.get("/participants", (req, res) => {

    db.collection("participants")
    .find()
    .toArray()
    .then(response => {
       res.status(200).send(response)
    }).catch(err => res.status(500).send(err))


})


app.post("/participants", (req, res) => {
    const {name} = req.body;

    if (!name) {
        res.status(422).send("Coloque um nome");
        return;
    }


    db.collection("participants")
    .find()
    .toArray()
    .then(response => {
        userAlreadyExists = response.find((item) => item.name === name);
    }).catch(err => res.status(500).send(err))

    if (userAlreadyExists) {
        res.status(409).send("Usuario já existe");
        return
    }

    db.collection("participants").insertOne(
        {
            name,
            lastStatus: Date.now()
        }
    ).then(() =>  res.status(201).send("Participante cadastrado"))
    .catch((err) => res.status(500).send(err))
})


app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});