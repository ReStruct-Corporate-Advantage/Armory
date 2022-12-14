const ENDPOINTS = {
    UI: {},
    BE: {
        AUTH: {
            LOGIN: "/auth/login",
            REGISTER: "/auth/register"
        },
        CREATE_ARMAMENT: "",
        USER: {
            CURRENT: "/user/current"
        },
        ARMORY: {
            GET: "/armory",
            PUT: "/armory",
            POST: "/armory",
            POSTWITHCONTAINER: "/armory?withContainer=true"
        }
    }
}

export default ENDPOINTS;