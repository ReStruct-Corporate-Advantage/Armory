const APP_CONFIG = {    
    default_stuff:  [],
    username: process.env.ADMIN_USER || "username",
    password: process.env.ADMIN_PASSWORD || "password",
    db: {
        host: "mohiit1502:astalavista2402@armory.ergdp.mongodb.net",
        port: 27017,
        database: "Armory",
        options: "retryWrites=true&w=majority"
    },
    web: {
        port: process.env.WEB_PORT || 3002
    }
}

export default APP_CONFIG;