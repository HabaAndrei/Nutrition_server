const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');




const app = express();
const {DBcall} = require('./route_query.js');
// const {client_db} = require('./configPG.js')

app.use(cors());
app.use(bodyParser.json());


///////////////

app.post('/insertDateU_google', async (req, res)=>{
    // uid: user.uid, email:user.email, name: user.displayName, milisec,  metoda_creare: 'google'
    const {uid, email, name, milisec, metoda_creare} = req.body;
    try{
        await DBcall('delete_user', {uid, email, name, milisec, metoda_creare});
    }catch (err){
        res.status(500).send;
    }
    res.send();
})


app.post('/stergemUtilizatorul', async (req, res)=>{
    const {uid} = req.body;
    try{
        await DBcall('delete_user', {uid});
    }catch (err){
        res.status(500).send;
    }
    res.send();
    
})



app.post('/verificamCrediteGratis', async (req, res)=>{
    const {ip_address} = req.body;
    let rez ;
    try{
        rez =  await DBcall('verify_free_credit', {ip_address});
        res.send(rez.rows)
    }catch (err){
        res.status(500).send();
    }    
})


///////////////

const PORT = 5000;
app.listen(PORT, ()=>{
    console.log('Ascultam pe portul', PORT)
})