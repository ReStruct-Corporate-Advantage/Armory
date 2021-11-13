const COMPONENTS = {
    schemas: {
        Armory: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Armory identification number",
                        example: "ytyVgh"
                    },
                    title: {
                        type: "string",
                        description: "Todo's title",
                        example: "Coding in JavaScript"
                    }
                }
            }
        },
        Error: {
            type: "object",
            properties: {
                message: {
                    type: "string"
                },
                internal_code: {
                    type: "string"
                }
            }
        }
    },
    parameters: {
        accessToken: {
            name: "x-access-token",
            in: "header",
            required: true,
            schema: {
                type: "string",
            },
            description: "Authentication header" 
        }
    }
}

export default COMPONENTS;