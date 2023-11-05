export const AUTHENTICATED_CHILDREN = [
    {path: "/", class: "dashboard", element: "LoadableDashboard", menuLess: true},
    {path: "manage/*", element: "LoadableAuthorizer"},
    {path: "project", class: "project-creator", element: "LoadableProjectCreator"},
    {path: "page", class: "page-creator", element: "LoadablePageCreator"},
    {path: "component", class: "component-creator", element: "LoadableComponentCreator"},
    {path: "component/view", class: "component-selector", element: "LoadableComponentSelector"},
    {path: "profile", class: "user-profile", element: "LoadableUserProfile"},
    {path: "notifications", class: "notification", element: "LoadableNotifications"},
    {path: "settings", class: "settings", element: "LoadableSettings"},
    {path: "project/:project/collaborate", class: "collaboration", element: "LoadableCollaborationBoard"}
];

const ROUTES = [
    {path: "/", class: "landing", headerClasses: "container position-absolute l-0 r-0 bg-black", element: "LoadableLanding", menuLess: true, drawerLess: true, noTools: true, concealHeaderHeight: true},
    {path: "/playground", class: "playground", element: "LoadableComponentCreator", drawerLess: true, noTools: true},
    {path: "/login", class: "login", headerClasses: "container mx-auto my-4 py-5", element: "LoadableLogin", menuLess: true, drawerLess: true, noTools: true, noHeader: true, concealHeaderHeight: true},
    {path: "/join", class: "join", headerClasses: "container position-absolute l-0 r-0 bg-black", element: "LoadableJoin", menuLess: true, drawerLess: true, noTools: true, concealHeaderHeight: true, noSearch: true, displaySignInPrompt: true},
    {path: "/:user/*", element: "LoadableAuthenticator", children: AUTHENTICATED_CHILDREN},
    {path: "/:user/page/live", class: "preview", element: "LoadableLivePreview"},
    {path: "reset", class: "forgot-password", element: "LoadableForgotPassword"},
];

export default ROUTES;