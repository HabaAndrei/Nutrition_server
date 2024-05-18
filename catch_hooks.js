
require('dotenv').config();
const {SK_TEST }= process.env;


function catch_hooks(app){
    console.log('am importat o cu succes!!!!!!!!!')
    app.post('/webhook' , (req, res) => {

        // const sig = request.headers['stripe-signature'];

        console.log('------- am primes un wehhook!!!!!')
        const obWithStatus = req.body;


        switch (obWithStatus.type) {
            case 'checkout.session.async_payment_succeeded':
              const paymentIntentSucceeded = obWithStatus.data.object;
              console.log('am primti aici confirmarea ca plata s a intamplat!!!!!!')
              // Then define and call a function to handle the event payment_intent.succeeded
              break;
            // ... handle other event types
            default:
            //   console.log(`Unhandled event type ${obWithStatus.type}`);
          }
        
        // trebuie sa fac cod pt atunci cand primesc mesaj ca s-a facut plata pt reainoirea de abonament 
        // sau poate ca este tot acesta bun 
        res.json({received: true});
    });
}

module.exports  = { catch_hooks}

// stripe listen --forward-to localhost:5000/webhook