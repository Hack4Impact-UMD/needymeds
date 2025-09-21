interface Advice {
    slip:{
        id: number;
        advice: string;
    }
}

export default async function fetchAdvice(){
    const response = await fetch ('https://api.adviceslip.com/advice');
    const data = await response.json(); 
    return [data.slip];

    //console.log(data.slip); 
}