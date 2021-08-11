const DB_CONFIG = {
    PROD: {
        host: "mohiit1502:astalavista2402@armory.ergdp.mongodb.net",
        port: 27017,
        database: "Armory",
        options: "retryWrites=true&w=majority",
        connection_string: "mongodb+srv://mohiit1502:astalavista2402@armory.ergdp.mongodb.net/Armory?retryWrites=true&w=majority"
    }
}

export default DB_CONFIG;