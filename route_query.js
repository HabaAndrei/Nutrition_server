// const {client_db} = require('./configPG.js')

///
const  {returnClientDB} = require('./client_db.js');


let client_db ;
async function getClient(){
    client_db = await returnClientDB();
} 
getClient()

///

const route_query = {
    verify_free_credit : {
        func : async (oo)=>{
            const {ip_address} = oo; 
            const query = {
                text : 'SELECT update_mesaje_trimise_gratis($1) AS result;',
                values: [ip_address]
            }
            return await client_db.query(query);
        },
        require_params : ['ip_address']
    },
    delete_user : {
        func : async(oo)=>{
            const {uid, email} = oo;
            const query = {
                text: `
                BEGIN;
                delete from useri where uid = '${uid}'; 
                delete from mesaje where uid = '${uid}';
                update date_abonament set tip = 'inactiv' where email = '${email}' and tip = 'activ' and id_abonament != 'gratis';
                COMMIT;
                `,
                values: []
            }
            return await client_db.query(query);
        },
        require_params : ['uid', 'email']

    },
    store_messages: {
        func : async (oo)=>{
            const {arMes} = oo;
            const query = {
                text:  `
                INSERT INTO mesaje (mesaj, tip_mesaj, data, id_conversatie, conversatie, uid)
                SELECT (json_data->>'mesaj')::text, (json_data->>'tip_mesaj')::text, (json_data->>'data')::numeric,
                (json_data->>'id_conversatie')::text,  (json_data->>'conversatie')::text, (json_data->>'uid')::text
                FROM json_array_elements($1::json) AS json_data`,
                values : [JSON.stringify(arMes)]
            }
            return await client_db.query(query);
        },
        require_params : []
    },
    getConvWithId:{
        func: async(oo)=>{
            const {id_conversatie} = oo;
            const query = {
                text: `
                select mesaj, tip_mesaj from mesaje where id_conversatie = $1 order by id
                `,
                values: [id_conversatie]
            }
            return await client_db.query(query);

        },
        require_params: ['id_conversatie']
    },
    insert_date_u : {
        func : async(oo)=>{
            const {uid, email, name, milisec, metoda_creare} = oo;
            const query = {
                text : `
                DO $$ 
                DECLARE 
                nr integer;
                rezultat record;
                BEGIN 

                SELECT count(*) INTO nr FROM useri WHERE uid = '${uid}';

                IF nr < 1 THEN
                    INSERT INTO useri (email, nume, uid, ora_creare, metoda_creare) VALUES ('${email}', '${name}', '${uid}', ${milisec}, '${metoda_creare}');
                    insert into date_abonament (email, id_abonament, pret_abonament, numar_tokeni , inceput_abonament, final_abonament, tip )
                    values ( '${email}', 'gratis', 0, 10, 0, 0, 'activ' );
                END IF;

                RAISE NOTICE '%', rezultat;
                END $$;
                `, 
                values : []
            };
            return await client_db.query(query);
        },
        require_params: ['uid', 'email', 'name', 'milisec', 'metoda_creare']
    }, 
    getConvFromDB: {
        func: async(oo)=>{
            const {conversatie, uid} = oo;
            const query = {
                text: `
                select  mes_2.mesaj, mes_2.id_conversatie,  mes_2.tip_mesaj from mesaje mes_2
                join (select min(id) from mesaje where conversatie = $1 and uid = $2
                group by id_conversatie) mes_1 on mes_1.min = mes_2.id
                `,
                values: [conversatie, uid]
            }
            return await client_db.query(query);

        },
        require_params: ['conversatie', 'uid']
    },

    deleteConv: {
        func: async(oo)=>{
            const {id_conversatie} = oo;
            const query = {
                text: `
                delete from mesaje where id_conversatie = $1;
                `,
                values: [id_conversatie]
            }
            return await client_db.query(query);

        },
        require_params: ['id_conversatie']
    },
    add_subscription: {
        func: async(oo)=>{
            const {email, id_abonament, pret_abonament, numar_tokeni, inceput_abonament, final_abonament, tip} = oo;
            const query = {
                text: `
                DO $$
                DECLARE 
                  nr integer;
                BEGIN 
                  SELECT count(*) INTO nr 
                  FROM date_abonament 
                  WHERE id_abonament = '${id_abonament}' AND email = '${email}';
      
                  IF nr > 0 THEN
                    -- Aici voi insera prelungirea de abonament 
                    UPDATE date_abonament 
                    SET final_abonament = '${final_abonament}', tip = '${tip}', 
                        numar_tokeni = ${numar_tokeni}
                    WHERE id_abonament = '${id_abonament}' AND email = '${email}';
                  ELSE 
                    -- Aici voi insera noul abonament 
                    INSERT INTO date_abonament (email, id_abonament, pret_abonament, numar_tokeni, 
                            inceput_abonament, final_abonament, tip) 
                    VALUES ('${email}', '${id_abonament}', ${pret_abonament}, ${numar_tokeni},
                            '${inceput_abonament}', '${final_abonament}', '${tip}');
                  END IF;
                END $$;
                `,
                values: []
            }
            return await client_db.query(query);

        },
        require_params: [],
    },
    getDataUser_abonamente: {
        func: async(oo)=>{
            const {email} = oo;
            const query = {
                text: `
                
                select inceput_abonament, final_abonament, id_abonament, pret_abonament, numar_tokeni 
                from date_abonament where email = $1 and tip = 'activ' order by id;        
                `,
                values: [email]
            }
            return await client_db.query(query);

        },
        require_params: ['email']
    },
    deleteSubscription: {
        func: async(oo)=>{
            const {id} = oo;
            const query = {
                text: `
                
                update date_abonament set tip = 'inactiv'
                where id_abonament = $1;       
                `,
                values: [id]
            }
            return await client_db.query(query);

        },
        require_params: ['id']
    },
    dropTokens : {
        func: async(oo)=>{
            const {numar_tokeni, id_abonament, uid} = oo;
            const query = {
                text: `
                
                BEGIN;
                update date_abonament set numar_tokeni = ${numar_tokeni } where id_abonament = '${id_abonament}';    
                insert into istoric_tokeni (uid, tokens) values ('${uid}', -1);
                COMMIT;
                `,
                values: []
            }
            return await client_db.query(query);

        },
        require_params: ['numar_tokeni', 'id_abonament', 'uid']
    }
}

function check_required_params(paramsIn, paramsReq){
    let rez ;
    const keys= Object.keys(paramsIn);
    const missing_req_params = paramsReq?.filter((req_pa)=> !keys.includes(req_pa));
    if(missing_req_params?.length){
        rez = {status: false, params: missing_req_params}
    }else{
        rez = {status: true}
    }
    return rez;
}

async function DBcall (func_str, params={}){
    let res;



    try{
        if(typeof route_query[func_str].func != 'function')return console.error(`Function ${func_str} does not exist in route_query `);
        const pa_rams = route_query[func_str].require_params;

        // console.log({pa_rams, params})
        const ob_verif = check_required_params(params, pa_rams);
        if(!ob_verif.status){
            throw new Error(`${func_str}: Missing parameter: ${ob_verif.params?.join(', ')}`);

        }
 
        let rezult = await route_query[func_str].func(params);
        // console.log(rezult, '\n', '\n')
        res = {error:false, res: rezult};
    }catch(err){
        console.log(err, '-------------------------')
        res = {error: true};
    }
    return res;
}

module.exports = {DBcall};