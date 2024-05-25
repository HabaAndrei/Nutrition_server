
function azi_peste_o_luna(){

    let ob = {};

    const azi = new Date();
    const zi = azi.getDate();
    const luna = azi.getMonth();
    const an = azi.getFullYear();

    let lunaViitoare = luna + 1;
    let anulViitor = an;
    if(lunaViitoare === 12){
        lunaViitoare = 0;
        anulViitor += 1;
    }

    ob.azi = new Date(`${luna}-${zi}-${an}`).getTime();
    ob.peste_o_luna = new Date(`${lunaViitoare}-${zi}-${anulViitor}`).getTime();

    return ob;

}

module.exports={azi_peste_o_luna}