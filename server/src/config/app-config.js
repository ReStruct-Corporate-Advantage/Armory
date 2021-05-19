const APP_CONFIG = {    
    default_stuff:  [],
    username: process.env.ADMIN_USER || "username",
    password: process.env.ADMIN_PASSWORD || "password",
    db: {
        host: "localhost",
        port: 27017,
        database: "armory"
    },
    web: {
        port: process.env.WEB_PORT || 3002
    }
}

export default APP_CONFIG;