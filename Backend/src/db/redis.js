import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
let client = null;
const url = process.env.REDIS_URL;
export function connectRedis(){
    if(client){
        console.log("Reusing existing client connection")
        return client;
    }

    client = new Redis(url);

    client.on("connect",()=>{
        console.log(`redis connected`)
    })

    client.on("error",(err)=>{
        console.log(`redis error ${err}`)
    })

    return client;
}

export async function disconnectRedis() {
    if (client) {
      await client.quit();
      console.log("🔌 Redis connection closed");
      client = null;
    }
}
