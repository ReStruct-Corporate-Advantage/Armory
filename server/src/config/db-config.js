const DB_CONFIG = {
    production: {
        host: "mohiit1502:astalavista2402@armory.ergdp.mongodb.net",
        port: 27017,
        database: "Armory",
        options: "retryWrites=true&w=majority",
        connection_string: "mongodb+srv://mohiit1502:astalavista2402@armory.ergdp.mongodb.net/Armory?retryWrites=true&w=majority",
        protocol: "mongodb+srv"
    },
    development: {
        host: "localhost:27017",
        port: 27017,
        database: "armory",
        options: "retryWrites=true&w=majority",
        connection_string: "mongodb://localhost:27017/armory?retryWrites=true&w=majority",
        protocol: "mongodb"
    }
}

export default DB_CONFIG;