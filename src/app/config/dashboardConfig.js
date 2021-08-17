const DASHBOARD_CONFIG = {
    ADMIN_ACTIONS: {
        containerClasses: "col-7 mx-auto mb-5",
        sectionClasses: "c-Dashboard__main__admin glass-panel mx-auto",
        protected: true,
        parts: [
            {name: "AdminHeader", type: "header", classes: "section-header w-100 mb-0", text: "Armory Management"},
            {
                name: "ManageCompoents", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-4", text: "Manage Components", visibility: "visible",
                order: 0, icon: "fc.FcFolder", leftSnapped: true, tooltip: "Manage Components",
                action: (history, userDetails) => history.push(`/${userDetails.username}/manage/component`)
            },
            {
                name: "ManagePages", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-4", text: "Manage Pages", visibility: "visible",
                order: 1, icon: "fi.FiMaximize", tooltip: "Manage Pages",
                action: (history, userDetails) => history.push(`/${userDetails.username}/manage/page`)
            },
            {
                name: "ManageProjects", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-4 mb-3", text: "Manage Projects", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "Manage Projects",
                action: (history, userDetails) => history.push(`/${userDetails.username}/manage/project`)
            }
        ]
    },
    RESUMPTION_ACTIONS: {
        containerClasses: "col-6",
        sectionClasses: "c-Dashboard__main__resume glass-panel mx-auto",
        parts: [
            {name: "ResumptionHeader", type: "header", classes: "section-header w-100 mb-0", text: "Let's resume where your left..."},
            {
                name: "MyCompoents", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-4", text: "My Components", visibility: "visible",
                order: 0, icon: "fc.FcFolder", leftSnapped: true, tooltip: "My Components",
                action: (history, userDetails) => history.push(`/${userDetails.username}/manage/component`)
            },
            {
                name: "MyPages", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-4", text: "My Pages", visibility: "visible",
                order: 1, icon: "fi.FiMaximize", tooltip: "My Pages",
                action: (history, userDetails) => history.push(`/${userDetails.username}/manage/page`)
            },
            {
                name: "MyProjects", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-4 mb-3", text: "My Projects", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "My Projects",
                action: (history, userDetails) => history.push(`/${userDetails.username}/manage/project`)
            }
        ]
    },
    NEW_ACTIONS: {
        containerClasses: "col-6",
        sectionClasses: "c-Dashboard__main__buttons glass-panel mx-auto",
        parts: [
            {name: "ResumptionHeader", type: "header", classes: "section-header w-100 mb-0", text: "...Or select one of the options below"},
            {
                name: "CreateProject", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5 mt-4", text: "Create a Project", visibility: "visible",
                order: 0, icon: "fc.FcFolder", leftSnapped: true, tooltip: "Create a Project",
                action: (history, userDetails) => history.push(`/${userDetails.username}/project`)
            },
            {
                name: "CreatePage", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5", text: "Create a Page Template", visibility: "visible",
                order: 1, icon: "fi.FiMaximize", tooltip: "Create a Page Template",
                action: (history, userDetails) => history.push(`/${userDetails.username}/page`)
            },
            {
                name: "CreateComponent", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5", text: "Create a Rich Component", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "Create a Rich Component",
                action: (history, userDetails) => history.push(`/${userDetails.username}/component`)
            },
            {name: "OptionSeparator", type: "p", classes: "option-separator col-6 mx-auto mb-5", text: "Or"},
            {
                name: "ExistingTemplate", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5", text: "Use an existing template", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "Use an existing template",
                action: (history, userDetails) => history.push(`/${userDetails.username}/template`)
            }
        ]
    }
}

export default DASHBOARD_CONFIG;