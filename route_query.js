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
        required_params : ['ip_address']
    },
    delete_user : {
        func : async(oo)=>{
            const {uid} = oo;
            const query = {
                text: 'delete from useri where uid = $1;',
                values: [uid]
            }
            return await client_db.query(query);

        }
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
        }
    }
}

function DBcall(func_str, params){
    let res;

    try{
        res = route_query[func_str].func(params)
    }catch(err){
        res = {error: true};
    }
    return res;
}

module.exports = {DBcall};