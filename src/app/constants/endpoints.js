const ENDPOINTS = {
    UI: {},
    BE: {
        AUTH: {
            BOTVALIDATE: "/auth/bot/validate",
            LOGIN: "/auth/login",
            REGISTER: "/auth/register"
        },
        CREATE_ARMAMENT: "",
        USER: {
            CURRENT: "/user/current"
        },
        ARMORY: {
            root: "/current",
            GET: "/armory",
            PUT: "/armory",
            POST: "/armory",
            POSTWITHCONTAINER: "/armory?withContainer=true"
        },
        PROJECT: {
            root: "/current",
            GET: "/project",
            POST: "/project",
            PUT: "/project"
        },
        PAGE: {
            root: "/current",
            GET: "/page",
            POST: "/page",
            PUT: "/page"
        },
        COMPONENT: {
            root: "/current",
            GET: "/component",
            POST: "/component",
            PUT: "/component"
        },
        ADMIN: {
            USER: {
                GETALL: "/all",
                GETBYNAME: "/user?name=:name"
            },
            ARMORY: {
                GET: "/armory",
                PUT: "/armory",
                POST: "/armory",
            },
            PROJECT: {
                GET: "/project",
                POST: "/project",
                PUT: "/project"
            },
            PAGE: {
                GET: "/page",
                POST: "/page",
                PUT: "/page"
            },
            COMPONENT: {
                GET: "/component",
                POST: "/component",
                PUT: "/component"
            },
        }
    }
}

export default ENDPOINTS;