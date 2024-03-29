const DASHBOARD_CONFIG = {
    DRAWER_WIDTH_COLLAPSED: "4.5rem",
    DRAWER_WIDTH_EXPANDED: "18rem",
    SIDEPANEL_WIDTH: "25rem",
    MENU: {
        type: "Drawer",
        initialExpanded: false,
        classes: "",
        menuItems: [
            {id: "user", type: "UserImage", props: {icon: "fa.FaUserCircle", color: "#bbb", size: "2.5rem"}, collapseSize: "2.5rem", expandSize: "13.5rem", height: "10.5rem", action: "navigate", actionArgs: {path: "/:user/profile"}, containerClasses: "mx-auto my-3 z-index-3", needsNavigate: true},
            {id: "dashboard", type: "LoadableIcon", label: "Dashboard", containerClasses: "py-3", props: {icon: "rx.RxDashboard", color: "#e83e8c", size: "2.5rem", classes: "mx-3 z-index-3"}, displayName: "Dashboard", action: "navigate", actionArgs: {path: "/:user"}, needsNavigate: true},
            {id: "playground", type: "LoadableIcon", label: "Playground", containerClasses: "py-3", props: {icon: "si.SiPlaycanvas", color: "#e83e8c", size: "2.5rem", classes: "mx-3 z-index-3"}, displayName: "Playground", action: "navigate", actionArgs: {path: "/:user/component"}, needsNavigate: true},
            {id: "manage", type: "LoadableIcon", label: "Manage", containerClasses: "py-3", props: {icon: "md.MdAdminPanelSettings", color: "#e83e8c", size: "2.5rem", classes: "mx-3 z-index-3"}, displayName: "Manage", action: "navigate", actionArgs: {path: "/:user/manage"}, needsNavigate: true},
            {id: "conversations", type: "LoadableIcon", label: "Conversations", containerClasses: "py-3", props: {icon: "bi.BiConversation", color: "#e83e8c", size: "2.5rem", classes: "mx-3 z-index-3"}, displayName: "Conversations", action: "navigate", actionArgs: {path: "/:user/conversations"}, needsNavigate: true},
            {id: "logout", type: "LoadableIcon", label: "Logout", containerClasses: "mt-auto mb-5", props: {icon: "md.MdLogout", color: "#e83e8c", size: "2.5rem", classes: "mx-3 z-index-3"}, displayName: "Logout", action: "logout"}
        ]
    },
    PROJECT_SUMMARY: {
        actions: [{
            action: "create",
            route: "/:user/project"
        }],
        header: "Project Summary",
        instance: "Project",
        component: "Summary",
        componentAction: {
            action: "navigate",
            route: "/:user/project",
            navigateArgs: {state: {context: "view"}}
        },
        type: "Widget",
        typeClasses: "bg-mild-red",
        location: "main",
        layout: "1.1.4"
    },
    PAGE_SUMMARY: {
        actions: [{
            action: "create",
            route: "/:user/page"
        }],
        header: "Page Summary",
        instance: "Page",
        component: "Summary",
        componentAction: {
            action: "navigate",
            route: "/:user/page",
            navigateArgs: {state: {context: "view"}}
        },
        type: "Widget",
        typeClasses: "bg-mild-blue",
        location: "main",
        layout: "1.2.4"
    },
    COMPONENT_SUMMARY: {
        actions: [{
            action: "create",
            route: "/:user/component"
        }],
        header: "Component Summary",
        instance: "Component",
        component: "Summary",
        componentAction: {
            action: "navigate",
            route: "/:user/component",
            navigateArgs: {state: {context: "view"}}
        },
        type: "Widget",
        typeClasses: "bg-mild-green",
        location: "main",
        layout: "1.3.4"
    },
    RECENTS: {
        header: "Recent Works",
        component: "CumulativeWorksTable",
        type: "Widget",
        location: "main",
        layout: "2.1.8"
    },
    ACTIONS: {
        header: "Get Started with...",
        component: "List",
        content: [
            "Create a new project...",
            "Use a template to start a project...",
            "Create a page...",
            "Create a rich component...",
            "Start a blog...",
            "Ask a question..."
        ],
        type: "Widget",
        listType: "link",
        location: "main",
        layout: "2.2.4"
    },
    SAMPLES: {
        header: "What others are creating...",
        component: "List",
        type: "Widget",
        content: [
            "square",
            "rectangle",
            "input",
            "Create a rich component...",
            "Start a blog...",
            "Ask a question..."
        ],
        listType: "carousel",
        location: "main",
        layout: "3.1.12"
    },
    ACTIVITY: {
        header: "User Activity",
        component: "UserActivity",
        type: "SidePanel",
        initialVisible: true
    }
}

export default DASHBOARD_CONFIG;