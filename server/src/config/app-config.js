const APP_CONFIG = {    
    default_stuff:  [],
    username: process.env.ADMIN_USER || "username",
    password: process.env.ADMIN_PASSWORD || "password",
    web: {
        port: process.env.WEB_PORT || 3002
    }
}

export default APP_CONFIG;