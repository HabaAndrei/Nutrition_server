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
        // console.log(ob_verif)
        if(!ob_verif.status){
            throw new Error(`${func_str}: Missing parameter: ${ob_verif.params?.join(', ')}`);

        }
 
        let rezult = await route_query[func_str].func(params);
        res = {error:false, res: rezult};
    }catch(err){
        res = {error: true};
    }
    return res;
}

module.exports = {DBcall};