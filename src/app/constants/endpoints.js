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
            CURRENT: "/secure/user/current"
        },
        ARMORY: {
            root: "/current",
            GET: "/secure/armory",
            PUT: "/secure/armory",
            POST: "/secure/armory",
            POSTWITHCONTAINER: "/secure/armory?withContainer=true"
        },
        PROJECT: {
            root: "/current",
            GET: "/secure/project",
            POST: "/secure/project",
            PUT: "/secure/project"
        },
        PAGE: {
            root: "/current",
            GET: "/secure/page",
            POST: "/secure/page",
            PUT: "/secure/page"
        },
        COMPONENT: {
            root: "/current",
            GET: "/secure/component",
            POST: "/secure/component",
            PUT: "/secure/component"
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