
require('dotenv').config();
const {YOUR_DOMAIN, SK_TEST }= process.env;
const stripe = require('stripe')(SK_TEST);



function pay_product_redirect(app){

    app.post('/create-checkout-session', async (req, res) => {

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price: 'price_1OvveKLpkRDhf4wTOTyiIYzN',
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${YOUR_DOMAIN}&pay_finsh=true`,
          cancel_url: `${YOUR_DOMAIN}&pay_finsh=false`,
        });
      
        res.redirect(303, session.url);
      })
}

module.exports = {pay_product_redirect}