export const AUTHENTICATED_CHILDREN = [
    {path: "/", class: "dashboard", element: "LoadableDashboard"},
    {path: "manage/*", element: "LoadableAuthorizer"},
    {path: "project", class: "project-creator", element: "LoadableProjectCreator"},
    {path: "page", class: "page-creator", element: "LoadablePageCreator"},
    {path: "component", class: "component-creator", element: "LoadableComponentCreator"},
    {path: "component/view", class: "component-selector", element: "LoadableComponentSelector"},
    {path: "reset", class: "forgot-password", element: "LoadableForgotPassword"},
    {path: "profile", class: "user-profile", element: "LoadableUserProfile"},
    {path: "notifications", class: "notification", element: "LoadableNotifications"},
    {path: "settings", class: "settings", element: "LoadableSettings"},
    {path: "project/:project/collaborate", class: "collaboration", element: "LoadableCollaborationBoard"}
];

const ROUTES = [
    {path: "/", element: "LoadableAuthenticator"},
    {path: "/login", class: "login", element: "LoadableLogin"},
    {path: "/join", class: "join", element: "LoadableJoin"},
    {path: "/:user/*", element: "LoadableAuthenticator", children: AUTHENTICATED_CHILDREN},
    {path: "/:user/page/live", class: "preview", element: "LoadableLivePreview"}
];

export default ROUTES;