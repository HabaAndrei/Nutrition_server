const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip')




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
app.post('/getMesFromDB', async(req, res)=>{
    const {id_conversatie} = req.body;
    try{
        rez = await DBcall('getMesFromDB', {id_conversatie});
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

///////////////

const PORT = 5000;
app.listen(PORT, ()=>{
    console.log('Ascultam pe portul', PORT)
})