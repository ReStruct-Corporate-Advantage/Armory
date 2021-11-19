const API_CONFIG = {
    CREATE_ARMAMENT: {
        name: "<class>.<api-name>",
        preHook: "<class>.<pre-hook-name>",
        postHook: "<class>.<post-hook-name>"
    },
    "HOST": {
        "development": "http://localhost:3002",
        "production": "https://armory-service.herokuapp.com"
    },
    "STATIC_HOST": {
        "development": "http://localhost:8080",
        "production": "https://armory-static.herokuapp.com"
    }
}

export default API_CONFIG;