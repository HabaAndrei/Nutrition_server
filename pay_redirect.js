
require('dotenv').config();
const {YOUR_DOMAIN, SK_TEST }= process.env;
const stripe = require('stripe')(SK_TEST);


const produse = [{  id:'1', id_produs: 'price_1PIyZULpkRDhf4wTvsNxPRM3'},
  { id:'2', id_produs: 'price_1PIyamLpkRDhf4wTrlVItWrW' },
  {id:'3', id_produs: 'price_1PIybLLpkRDhf4wT2RhIULsj' }]



function pay_product_redirect(app){

  app.post('/create-checkout-session', async (req, res) => {

    const {id} = req.query;
    const produsulCuId = produse.find((ob)=>ob.id === id);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: produsulCuId.id_produs,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}&pay_finsh=true`,
      cancel_url: `${YOUR_DOMAIN}&pay_finsh=false`,
    });
  
    res.redirect(303, session.url);

  })
}

module.exports = {pay_product_redirect}