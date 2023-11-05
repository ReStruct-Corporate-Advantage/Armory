const API_CONFIG = {
    CREATE_ARMAMENT: {
        name: "<class>.<api-name>",
        preHook: "<class>.<pre-hook-name>",
        postHook: "<class>.<post-hook-name>"
    },
    "HOST": {
        // "development": "http://127.0.0.1:5001/armory-server/us-central1/armoryServerApp",
        "development": "http://localhost:8082/api",
        // "production": "https://us-central1-armory-server.cloudfunctions.net/armoryServerApp"
        "production": "https://armco.tech/api"
    },
    "STATIC_HOST": {
        // "development": "http://127.0.0.1:5002/armory-server/us-central1/armoryStaticApp",
        "development": "http://localhost:5001/api",
        // "production": "https://us-central1-armory-server.cloudfunctions.net/armoryStaticApp"
        "production": "https://armco.tech/api"
    }
}

export default API_CONFIG;