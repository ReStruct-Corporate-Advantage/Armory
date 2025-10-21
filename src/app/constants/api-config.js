const API_CONFIG = {
    CREATE_ARMAMENT: {
        name: "<class>.<api-name>",
        preHook: "<class>.<pre-hook-name>",
        postHook: "<class>.<post-hook-name>"
    },
    "HOST": {
        "development": "http://localhost:5000/api",
        "production": "https://api.armco.dev"
    },
    "STATIC_HOST": {
        "development": "http://localhost:5001/api",
        "production": "https://static.armco.dev"
    }
}

export default API_CONFIG;
