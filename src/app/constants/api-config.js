const API_CONFIG = {
    CREATE_ARMAMENT: {
        name: "<class>.<api-name>",
        preHook: "<class>.<pre-hook-name>",
        postHook: "<class>.<post-hook-name>"
    },
    "HOST": {
        "development": "http://127.0.0.1:5001/armory-server/us-central1/armoryServerApp",
        "production": "https://us-central1-armory-server.cloudfunctions.net/armoryServerApp"
    },
    "STATIC_HOST": {
        "development": "http://localhost:8080",
        "production": "https://armory-static.herokuapp.com"
    }
}

export default API_CONFIG;