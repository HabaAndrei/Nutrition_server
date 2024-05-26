
require('dotenv').config();
const {azi_peste_o_luna} = require('./diverse.js')
const {DBcall} = require('./route_query.js')
const {SK_TEST }= process.env;
const {client_db} = require('./configPG.js');


const produse = [{price: 7, tokens: 100},
  {price: 12, tokens: 300},
  {price: 14, tokens: 400}];



function catch_hooks(app){

  app.post('/webhook' , async (req, res) => {

    const obWithStatus = req.body;

    switch (obWithStatus.type) {
      case 'checkout.session.completed':
        const paymentIntentSucceeded = obWithStatus.data.object;
        
        const {subscription, mode, amount_total} = paymentIntentSucceeded;
        const {email} = paymentIntentSucceeded.customer_details;
        

        const tokeni = produse.find((ob)=>ob.price === amount_total / 100).tokens;
        try{
          rez = await DBcall('add_subscription', {
            email : email, 
            id_abonament : subscription,
            pret_abonament : amount_total / 100, 
            numar_tokeni : tokeni, 
            inceput_abonament : azi_peste_o_luna().azi, 
            final_abonament : azi_peste_o_luna().peste_o_luna, 
            tip : 'activ'
          });
          if(rez.error)console.log('avem o eroare la adaugare de date in DB la abonament')
        }catch (err){
          console.log(err)
        }    

        break;

      case 'customer.subscription.deleted':

        
        const {id} = obWithStatus.data.object;

        try{
          rez = await DBcall('deleteSubscription', {id});
          if(rez.error)console.log('am primit o eroare in oprirea abonamentului')
        }catch (err){
          console.log(err, 'eroare pt oprire abonament!!')
        } 
        
        // console.log(id, 's a anulat un abonament !!!!!!')

        break


      default:
      //   console.log(`Unhandled event type ${obWithStatus.type}`);
    }
    
    
    res.json({received: true});
  });
}

module.exports  = { catch_hooks}

// stripe listen --forward-to localhost:5000/webhook