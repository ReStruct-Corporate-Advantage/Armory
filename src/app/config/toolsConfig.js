import EVENTS from "../utils/eventHandlers";

const TOOLS_CONFIG = {
    CODE_VIEWER_TOOLS: {
        leftSnapped: true,
        tools: [
            {name: "FileViewer", btnClasses: "btn", btnText: "", visibility: "visible", order: 0, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "left", leftSnapped: true, tooltip: "View Files"},
            {name: "ResizeCode", btnClasses: "btn", btnText: "", visibility: "visible", order: 1, icon: "fi.FiMaximize", toggleIcon: "fi.FiMinimize", placement: "right", tooltip: "Toggle Size"},
            {name: "EditCode", btnClasses: "btn btn-edit", btnText: "Edit", visibility: "visible", order: 2, icon: "ai.AiOutlineEdit", placement: "right", tooltip: "Edit"},
            {name: "SaveCode", btnClasses: "btn btn-save", btnText: "Save", visibility: "visible", order: 3, icon: "ai.AiOutlineSave", placement: "right", disabled: true, tooltip: "Save"},
            {name: "ToggleExpandCode", btnClasses: "btn btn-toggle-expand", btnText: "", visibility: "contained", order: 4, icon: "bs.BsChevronBarRight", toggleIcon: "bs.BsChevronBarDown", placement: "right", tooltip: "Toggle Expand"},
            {name: "UndoCode", btnClasses: "btn", btnText: "", visibility: "contained", order: 5, icon: "ai.AiOutlineUndo", placement: "right", disabled: true, tooltip: "Undo"},
            {name: "RedoCode", btnClasses: "btn", btnText: "", visibility: "contained", order: 6, icon: "ai.AiOutlineRedo", placement: "right", disabled: true, tooltip: "Redo"},
            {name: "ExportCode", btnClasses: "btn", btnText: "", visibility: "contained", order: 7, icon: "ai.AiOutlineExport", placement: "right", tooltip: "Export"}
        ]
    },
    CODE_VIEWER_LANGUAGE_TOOLS: {
        tools: [
            {name: "React", btnClasses: "btn", btnText: "", visibility: "visible", order: 0, icon: "di.DiReact", placement: "right", tooltip: "React"},
            {name: "Angular", btnClasses: "btn", btnText: "", visibility: "visible", order: 1, icon: "di.DiAngularSimple", placement: "right", tooltip: "Angular"},
            {name: "Vue", btnClasses: "btn btn-edit", btnText: "", visibility: "visible", order: 2, icon: "ri.RiVuejsFill", placement: "right", tooltip: "Vue"},
            {name: "Vanilla", btnClasses: "btn btn-save", btnText: "", visibility: "visible", order: 3, icon: "di.DiJavascript", placement: "right", tooltip: "Vanilla JS"}
        ]
    },
    CODE_PROPERTIES_TOOLS: {
        tools: [
            {name: "ResizeProperties", btnClasses: "btn", btnText: "", visibility: "visible", order: 1, icon: "fi.FiMaximize", toggleIcon: "fi.FiMinimize", placement: "right", tooltip: "Toggle Size"},
            {name: "EditProperties", btnClasses: "btn btn-edit", btnText: "Edit", visibility: "visible", order: 2, icon: "ai.AiFillEdit", placement: "right", onClick: "toggleEditMode", tooltip: "Edit", componentSpecific: true},
            {name: "SaveProperties", btnClasses: "btn btn-save", btnText: "Save", visibility: "visible", order: 3, icon: "ai.AiFillSave", placement: "right", disabled: true, tooltip: "Save", componentSpecific: true},
            {name: "PreviewSaveProperties", btnClasses: "btn btn-save", btnText: "Preview & Save", visibility: "visible", order: 4, icon: "bi.BiGitCompare", placement: "right", disabled: true, tooltip: "Compare", componentSpecific: true},
            {name: "UndoProperties", btnClasses: "btn", btnText: "", visibility: "contained", order: 5, icon: "ai.AiOutlineUndo", placement: "right", disabled: true, tooltip: "Undo", componentSpecific: true},
            {name: "RedoProperties", btnClasses: "btn", btnText: "", visibility: "contained", order: 6, icon: "ai.AiOutlineRedo", placement: "right", disabled: true, tooltip: "Redo", componentSpecific: true}
        ]
    },
    SEARCH_BAR_TOOLS: {
        classes: "backgroundNone ms-auto",
        size: "1.1rem",
        tools: [
            // {name: "Search", btnClasses: "btn border-14rem c-Search__search-helpers", layoutClasses: "me-1", btnText: "", visibility: "visible", order: 1, icon: "ai.AiOutlineSearch", toggleIcon: "fc.FcOpenedFolder", placement: "right", tooltip: "Search"},
            {name: "DisplayConversation", btnClasses: "btn border-14rem c-Search__search-helpers", layoutClasses: "me-1", btnText: "", visibility: "visible", order: 2, icon: "bs.BsChatQuoteFill", toggleIcon: "fc.FcOpenedFolder", placement: "right", tooltip: "Display Chat"},
            {name: "Speak", btnClasses: "btn border-14rem c-Search__search-helpers", btnText: "", visibility: "visible", order: 1, icon: "bs.BsMic", toggleIcon: "bs.BsMic", placement: "right", tooltip: "Speak"}
        ]
    },
    PAGE_TOOLS: {
        classes: "backgroundNone px-4 borderRight borderLeft",
        size: "1.2rem",
        tools: [
            {name: "AddPage", btnClasses: "btn hoverBackgroundNone", btnText: "", visibility: "visible", order: 1, icon: "ai.AiOutlineFileAdd",
                placement: "right",
                data: {modalTitle: "Add Page", headerTitle: "Please provide page details to proceed, for most cases defaults should work!"}, tooltip: "Create Page"},
            {name: "CreateComponent", btnClasses: "btn hoverBackgroundNone", btnText: "", visibility: "visible", order: 2, icon: "hi.HiOutlineViewGridAdd", placement: "right", tooltip: "Create Component"}
        ]
    },
    ARMAMENT_TOOLS: {
        classes: "ms-auto backgroundNone position-absolute right-0 top-0",
        tools: [
            {name: "ViewArmament", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 1, icon: "ai.AiFillEye", placement: "right", tooltip: "View"},
            {name: "EditArmament", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 2, icon: "ai.AiFillEdit", placement: "right", tooltip: "Edit"},
            {name: "ShareArmament", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 3, icon: "fa.FaShareAlt", placement: "right", tooltip: "Share"},
            {name: "AddToProject", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 3, icon: "md.MdAddToPhotos", placement: "right", tooltip: "Add To Project"}
        ]
    },
    GLOBAL_TOOLS: {
        classes: "backgroundNone ps-4",
        size: "1.3rem",
        tools: [
            {name: "Toggles", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "me-2 h-25", hoverClasses: "button-details", btnText: "",
                visibility: "visible", order: 1, icon: "gi.GiToggles", placement: "right",
                data: {
                    toggles: [
                        {
                            color: "#455964",
                            displayName: "Show Tooltips",
                            name: "tooltips",
                            icon: "Bs.BsToggleOn",
                            iconOff: "Bs.BsToggleOff",
                            selected: true
                        },
                        {
                            color: "#455964",
                            displayName: "Floating Layout",
                            name: "layout",
                            icon: "Bs.BsToggleOn",
                            iconOff: "Bs.BsToggleOff",
                            selected: false
                        },
                        {
                            color: "#455964",
                            displayName: "Collapse Widgets",
                            name: "collapseWidgets",
                            icon: "Bs.BsToggleOn",
                            iconOff: "Bs.BsToggleOff",
                            selected: false
                        },
                        {
                            color: "#455964",
                            displayName: "Enable Bootstrap",
                            name: "enableBootstrap",
                            icon: "Bs.BsToggleOn",
                            iconOff: "Bs.BsToggleOff",
                            selected: false
                        },
                        {
                            color: "#455964",
                            displayName: "Toggle Snap",
                            name: "toggleComponentSnap",
                            icon: "Bs.BsToggleOn",
                            iconOff: "Bs.BsToggleOff",
                            selected: true
                        },
                        {
                            color: "#455964",
                            displayName: "Developer mode",
                            name: "developerMode",
                            icon: "Bs.BsToggleOn",
                            iconOff: "Bs.BsToggleOff",
                            selected: true
                        },
                        {
                            displayName: "More Settings",
                            name: "settings",
                            generic: true,
                            icon: "fc.FcSettings"
                        }
                    ]
                },
                tooltip: "Toggles"
            },
            {name: "Help", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "me-2 h-25", hoverClasses: "button-details", btnText: "", visibility: "visible", order: 2, icon: "io.IoMdHelp", placement: "right", tooltip: "Help n FAQ"},
            {name: "Notifications", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "me-2 h-25", hoverClasses: "button-details", btnText: "", visibility: "visible", order: 3, icon: "ai.AiFillNotification", placement: "right", tooltip: "Notifications"},
            {name: "Profile", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "h-25", hoverClasses: "button-details", btnText: "",
                visibility: "visible", order: 4, icon: "bs.BsPersonFill", placement: "right",
                data: {
                    profileOptions: [
                        {
                            name: "View Profile",
                            icon: "bi.BiUser"
                        },
                        {
                            name: "My Projects",
                            icon: "ai.AiOutlineProject"
                        },
                        {
                            name: "My Pages",
                            icon: "bs.BsFileEarmarkSpreadsheet"
                        },
                        {
                            name: "My Components",
                            icon: "cg.CgComponents"
                        },
                        {
                            name: "Account Settings",
                            icon: "md.MdOutlineAccountBalance"
                        },
                        {
                            name: "Privacy Settings",
                            icon: "md.MdOutlinePrivacyTip"
                        },
                        {
                            name: "Logout",
                            icon: "md.MdLogout",
                            onClick: EVENTS.logout
                        }
                    ]
                },
                tooltip: "Manage Profile"
            },
        ]
    }
}

export default TOOLS_CONFIG;