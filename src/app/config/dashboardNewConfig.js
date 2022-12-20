const DASHBOARD_CONFIG = {
    DRAWER_WIDTH_COLLAPSED: "5rem",
    DRAWER_WIDTH_EXPANDED: "15rem",
    SIDEPANEL_WIDTH: "25rem",
    MENU: {
        type: "Drawer",
        initialExpanded: false,
        classes: "bg-primary",
        menuItems: [
            {id: "user", type: "UserImage", action: "navigate", actionArgs: "/:user/profile"},
            {id: "dashboard", type: "LoadableIcon", displayName: "Dashboard", action: "navigate", actionArgs: "/:user"},
            {id: "playground", type: "LoadableIcon", displayName: "Playground", action: "navigate", actionArgs: "/:user/component"},
            {id: "manage", type: "LoadableIcon", displayName: "Manage", action: "navigate", actionArgs: "/:user/manage"},
            {id: "conversations", type: "LoadableIcon", displayName: "Conversations", action: "navigate", actionArgs: "/:user/conversations"},
            {id: "logout", type: "LoadableIcon", displayName: "Logout", action: "logout"}
        ]
    },
    PROJECT_SUMMARY: {
        type: "Widget",
        location: "main",
        layout: "1.1.4"
    },
    PAGE_SUMMARY: {
        type: "Widget",
        location: "main",
        layout: "1.2.4"
    },
    COMPONENT_SUMMARY: {
        type: "Widget",
        location: "main",
        layout: "1.3.4"
    },
    RECENTS: {
        type: "Widget",
        location: "main",
        layout: "2.1.8"
    },
    ACTIONS: {
        type: "Widget",
        location: "main",
        layout: "2.2.4"
    },
    ACTIVITY: {
        type: "SidePanel",
        initialVisible: true
    }
}

export default DASHBOARD_CONFIG;