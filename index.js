// const express = require('express');
// const cors = require('cors');
const axios = require("axios");

const {arAlimente} = require('./arAlim.js');
const {client_db} = require('./configPG.js')
// const app = express();
// app.use(cors());


// let str  = 'Vitamin';
// console.log(str.replace(/ /g, '_').toLocaleLowerCase())
// console.log('merge?')

// return ;

const ingrediente = `ingredients=100g+napkin,100g+nectar,100g+nectarine,100g+nibble,100g+noodles,100g+nosh,100g+nourish,100g+nourishment,100g+nut,100g+nutmeg,100g+nutrient,100g+nutrition,100g+nutritious,100g+oatmeal,100g+oats,100g+oil,100g+okra,100g+oleo,100g+olive,100g+omelet,100g+omnivore,100g+onion,100g+orange,100g+order,100g+oregano,100g+oven,100g+oyster`;
axios.get(`https://api.apileague.com/compute-nutrition?api-key=1a94415d6e774882b2fd62156e01d674&${ingrediente}`)
.then((data)=>{

    // const arCuObDeNutrienti = data.data.ingredient_breakdown[0].nutrients;
    // const arCuObNou = [];
    // for(let ob of arCuObDeNutrienti){
    //     let ob_nou = {};
    //     ob_nou.unitate_de_masura = ob.name.replace(/ /g, '_').toLocaleLowerCase();
    //     ob_nou.nutrient  = ob.unit;
    //     arCuObNou.push(ob_nou);
    // }
    // const query = `insert into unitatidemasura (unitate_de_masura, nutrient)
    // select (json_data->>'unitate_de_masura')::text, (json_data->>'nutrient')::text  
    // FROM json_array_elements($1::json) AS json_data`;
    // client_db.query(query, [JSON.stringify(arCuObNou)], (err, data)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         console.log(data.data);
    //     }
    // })  
    //////////////////////////////////

    // { unitate_de_masura: 'sodium', nutrient: 'mg' },
    // { unitate_de_masura: 'zinc', nutrient: 'mg' },
    // { unitate_de_masura: 'vitamin_b12', nutrient: 'µg' },
    // { unitate_de_masura: 'protein', nutrient: 'g' },
    // { unitate_de_masura: 'potassium', nutrient: 'mg' },
    // { unitate_de_masura: 'carbohydrates', nutrient: 'g' },
    // { unitate_de_masura: 'phosphorus', nutrient: 'mg' },
    // { unitate_de_masura: 'manganese', nutrient: 'mg' },
    // { unitate_de_masura: 'selenium', nutrient: 'µg' },
    // { unitate_de_masura: 'calcium', nutrient: 'mg' }
    //////////////////////////////////
    //nume_aliment, folic_acid, cholesterol, zinc, vitamin_e, vitamin_b6, vitamin_b2, caffeine, potassium, vitamin_b12, folate, saturated_fat, net_carbohydrates, phosphorus, manganese, vitamin_d, fat, alcohol, vitamin_b5, lycopene, vitamin_k, protein, vitamin_b1, copper, carbohydrates, sodium, poly_unsaturated_fat, vitamin_c, calories, mono_unsaturated_fat, choline, vitamin_b3, iron, magnesium, selenium, calcium, vitamin_a, sugar, fiber
    //////////////////////////////////

    const arrayCuObDeAlimente = data.data.ingredient_breakdown;

    let i = 0;

    function adaugamDateRecursiv(){
        let arCuObNou = [];
        let obNou  = {};

        if(i>= arrayCuObDeAlimente.length)return ;
        let obiect = arrayCuObDeAlimente[i];
        //////// =>>>>>>
        const numeAliment = obiect['name'].replace(/ /g, '_').toLocaleLowerCase();
        const arrayCuObDeNutrienti = obiect['nutrients'];

        obNou.nume_aliment =  numeAliment;
        for(let ob of arrayCuObDeNutrienti){
            let n = ob.name.replace(/ /g, '_').toLocaleLowerCase();
            obNou[n] = ob.amount;

       
        }
        arCuObNou.push(obNou);
        //////////////////////////
        //nume_aliment , folic_acid, cholesterol, zinc, vitamin_e, vitamin_b6, vitamin_b2, caffeine, potassium, vitamin_b12, folate, saturated_fat, net_carbohydrates, phosphorus, manganese, vitamin_d, fat, alcohol, vitamin_b5, lycopene, vitamin_k, protein, vitamin_b1, copper, carbohydrates, sodium, poly_unsaturated_fat, vitamin_c, calories, mono_unsaturated_fat, choline, vitamin_b3, iron, magnesium, selenium, calcium, vitamin_a, sugar, fiber
        //////////////////////////
        console.log(arCuObNou);

        const query = `
        INSERT INTO valori_nutritionale (
            caffeine, 
            calories, 
            carbohydrates, 
            calcium, 
            cholesterol, 
            choline, 
            copper, 
            fat, 
            fiber, 
            folate, 
            iron, 
            lycopene, 
            magnesium, 
            manganese, 
            mono_unsaturated_fat, 
            net_carbohydrates, 
            nume_aliment, 
            phosphorus, 
            poly_unsaturated_fat, 
            potassium, 
            protein, 
            saturated_fat, 
            selenium, 
            sodium, 
            sugar, 
            vitamin_a, 
            vitamin_b1, 
            vitamin_b12, 
            vitamin_b2, 
            vitamin_b3, 
            vitamin_b5, 
            vitamin_b6, 
            vitamin_c, 
            vitamin_d, 
            vitamin_e, 
            vitamin_k, 
            zinc
        )
        SELECT 
            (json_data->>'caffeine')::numeric,
            (json_data->>'calories')::numeric,
            (json_data->>'carbohydrates')::numeric,
            (json_data->>'calcium')::numeric,
            (json_data->>'cholesterol')::numeric,
            (json_data->>'choline')::numeric,
            (json_data->>'copper')::numeric,
            (json_data->>'fat')::numeric,
            (json_data->>'fiber')::numeric,
            (json_data->>'folate')::numeric,
            (json_data->>'iron')::numeric,
            (json_data->>'lycopene')::numeric,
            (json_data->>'magnesium')::numeric,
            (json_data->>'manganese')::numeric,
            (json_data->>'mono_unsaturated_fat')::numeric,
            (json_data->>'net_carbohydrates')::numeric,
            (json_data->>'nume_aliment')::text, 
            (json_data->>'phosphorus')::numeric,
            (json_data->>'poly_unsaturated_fat')::numeric,
            (json_data->>'potassium')::numeric,
            (json_data->>'protein')::numeric,
            (json_data->>'saturated_fat')::numeric,
            (json_data->>'selenium')::numeric,
            (json_data->>'sodium')::numeric,
            (json_data->>'sugar')::numeric,
            (json_data->>'vitamin_a')::numeric,
            (json_data->>'vitamin_b1')::numeric,
            (json_data->>'vitamin_b12')::numeric,
            (json_data->>'vitamin_b2')::numeric,
            (json_data->>'vitamin_b3')::numeric,
            (json_data->>'vitamin_b5')::numeric,
            (json_data->>'vitamin_b6')::numeric,
            (json_data->>'vitamin_c')::numeric,
            (json_data->>'vitamin_d')::numeric,
            (json_data->>'vitamin_e')::numeric,
            (json_data->>'vitamin_k')::numeric,
            (json_data->>'zinc')::numeric
             FROM json_array_elements($1::json) AS json_data;
            `;

        client_db.query(query, [JSON.stringify(arCuObNou)], (err, data)=>{
            console.log('a intrat la inserare!');
            if(err){
                console.log(err, 'aroare din inserare')
            }else{
                // console.log(data , 'raspunsul d ela inserare');
                console.log('totul a mers foarte bine la inserare!');
            }

            // daca totul este bine merg mai departe 
            i +=1;
            adaugamDateRecursiv();
        })  
        //////////////////////////
        //////////////////////////

    }
    adaugamDateRecursiv();
   

        /*
        nume de nutrienti: 
        Folic Acid, 
        Cholesterol
        Zinc
        Vitamin E
        Vitamin B6
        Vitamin B2
        Caffeine
        Potassium
        Vitamin B12
        Folate
        Saturated Fat
        Net Carbohydrates
        Phosphorus
        Manganese
        Vitamin D
        Fat
        Alcohol
        Vitamin B5
        Lycopene
        Vitamin K
        Protein
        Vitamin B1
        Copper
        Carbohydrates
        Sodium
        Poly Unsaturated Fat
        Vitamin C
        Calories
        Mono Unsaturated Fat
        Choline
        Vitamin B3
        Iron
        Magnesium
        Selenium
        Calcium
        Vitamin A
        Sugar
        Fiber
        */
    
})
// const PORT = 5000;
// app.listen(PORT, ()=>{
//     console.log('Ascultam pe portul', PORT)
// })