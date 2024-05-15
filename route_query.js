const {client_db} = require('./configPG.js')


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
            const {uid} = oo;
            const query = {
                text: 'delete from useri where uid = $1;',
                values: [uid]
            }
            return await client_db.query(query);
        },
        require_params : ['uid']

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
    getMesFromDB: {
        func: async(oo)=>{
            const {id_conversatie} = oo;
            const query = {
                text: `
                select mesaj, tip_mesaj from mesaje where id_conversatie = $1
                `,
                values: [id_conversatie]
            }
            return await client_db.query(query);

        },
        require_params: ['id_conversatie']
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
        res = {error:false, res: rezult};
    }catch(err){
        console.log(err)
        res = {error: true};
    }
    return res;
}

module.exports = {DBcall};