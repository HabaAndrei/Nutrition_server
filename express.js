const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const requestIp = require('request-ip')
const fs = require("fs");
const fileUpload = require("express-fileupload");
const {pay_product_redirect} = require('./pay_redirect.js');
const {catch_hooks} = require('./catch_hooks.js');
const {client_db} = require('./configPG.js');
const {SK_TEST }= process.env;
const stripe = require('stripe')(SK_TEST);




const app = express();
app.use(fileUpload());
app.use(express.static("./poze"));
const {DBcall} = require('./route_query.js');
app.use(cors());
app.use(bodyParser.json());

catch_hooks(app);
pay_product_redirect(app)

///////////////

app.post('/insertDateU_google', async (req, res)=>{
    // uid: user.uid, email:user.email, name: user.displayName, milisec,  metoda_creare: 'google'
    const {uid, email, name, milisec, metoda_creare} = req.body;
    try{
        let rez = await DBcall('insert_date_u', {uid, email, name, milisec, metoda_creare});
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send;
    }
    res.send();
})


app.post('/stergemUtilizatorul', async (req, res)=>{
    const {uid} = req.body;
    try{
        let rez = await DBcall('delete_user', {uid});
        if(rez.error)res.status(404).send();
        try{
            fs.unlinkSync(`./poze/${uid}.jpg`);
        }catch(err){
            console.log(err, 'eroarea mica!!!')
        }
    }catch (err){
        res.status(500).send;
    }
    res.send();
    
})

app.post('/stocamMesajele', async (req, res)=>{


    const {arMes, id_conversatie, data, uid, conversatie} = req.body;
    let ar = []

    for(obiect of arMes){
        obiect.id_conversatie = id_conversatie;
        obiect.data = data;
        obiect.conversatie = conversatie;
        obiect.uid = uid;
        ar.push(obiect);
    }
    
    try{
        let rez = await DBcall('store_messages', {arMes : ar});
        if(rez.error)res.status(404).send();
    }catch(err){
        res.status(500).send;
    }
    res.send();
})


app.post('/verificamCrediteGratis', async (req, res)=>{
    const ip_address = requestIp.getClientIp(req)

    let rez ;
    try{
        rez = await DBcall('verify_free_credit', {ip_address});
        if(!rez.error)res.send(rez.res.rows)
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send();
    }    
})

app.post('/getConvWithId', async(req, res)=>{
    const {id_conversatie} = req.body;
    let rez ;
    try{
        rez = await DBcall('getConvWithId', {id_conversatie});
        if(!rez.error)res.send(rez.res.rows)
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send();
    }  
})

app.post('/getConvFromDB', async (req, res)=>{
    const {conversatie, uid} = req.body;
    try{
        rez = await DBcall('getConvFromDB', {conversatie, uid});
        if(!rez.error)res.send(rez.res.rows)
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send();
    } 

})


app.post('/deleteConv', async(req, res)=>{
    const {id_conversatie} = req.body;
    try{
        rez = await DBcall('deleteConv', {id_conversatie});
        if(!rez.error)res.send(rez.res.rows)
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send();
    } 
})


app.post('/uploadImg', (req, res)=>{
    let uid = req.query.uid;

    
    fs.writeFile(
        `./poze/${uid}.jpg`,
        req.files.image.data,
        (err) => {
          if (err) {
            console.log(err);
            return res.send("eroare");
          } else {
            return res.send(`ok`);
          }
        }
    );
    
})



app.post('/getDataUser_abonamente', async (req, res)=>{
    const {email} = req.body;
    try{
        rez = await DBcall('getDataUser_abonamente', {email});
        
        if(!rez.error)res.send(rez.res.rows)
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send();
    } 
})

app.post(`/deleteSubscription`, async (req, res)=>{
    const {id} = req.body;

    const subscription = await stripe.subscriptions.cancel(id)
    if(subscription.status != 'canceled'){res.status(500).send(); return};

    res.send('');

})

app.post('/dropTokens', async (req, res)=>{

    const {numar_tokeni, id_abonament} = req.body.ob_abonament;
    const {uid} = req.body;


    try{
        rez = await DBcall('dropTokens', {numar_tokeni, id_abonament, uid});
        
        if(!rez.error)res.send(rez.res.rows)
        if(rez.error)res.status(404).send();
    }catch (err){
        res.status(500).send();
    } 

})
///////////////

const PORT = 5000;
app.listen(PORT, ()=>{
    console.log('Ascultam pe portul', PORT)
})