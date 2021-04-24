const TOOLS_CONFIG = {
    CODE_VIEWER_TOOLS: {
        leftSnapped: true,
        tools: [
            {name: "FileViewer", btnClasses: "btn", btnText: "", visibility: "visible", order: 0, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "left", leftSnapped: true},
            {name: "ResizeCode", btnClasses: "btn", btnText: "", visibility: "visible", order: 1, icon: "fi.FiMaximize", toggleIcon: "fi.FiMinimize", placement: "right"},
            {name: "EditCode", btnClasses: "btn btn-edit", btnText: "Edit", visibility: "visible", order: 2, icon: "ai.AiOutlineEdit", placement: "right"},
            {name: "SaveCode", btnClasses: "btn btn-save", btnText: "Save", visibility: "visible", order: 3, icon: "ai.AiOutlineSave", placement: "right", disabled: true},
            {name: "ToggleExpandCode", btnClasses: "btn btn-toggle-expand", btnText: "", visibility: "contained", order: 4, icon: "bs.BsChevronBarRight", toggleIcon: "bs.BsChevronBarDown", placement: "right"},
            {name: "UndoCode", btnClasses: "btn", btnText: "", visibility: "contained", order: 5, icon: "ai.AiOutlineUndo", placement: "right", disabled: true},
            {name: "RedoCode", btnClasses: "btn", btnText: "", visibility: "contained", order: 6, icon: "ai.AiOutlineRedo", placement: "right", disabled: true},
            {name: "Export", btnClasses: "btn", btnText: "", visibility: "contained", order: 7, icon: "ai.AiOutlineExport", placement: "right"}
        ]
    },
    CODE_PROPERTIES_TOOLS: {
        tools: [
            {name: "ResizeProperties", btnClasses: "btn", btnText: "", visibility: "visible", order: 1, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "right"},
            {name: "EditProperties", btnClasses: "btn btn-edit", btnText: "Edit", visibility: "visible", order: 2, icon: "ai.AiFillEdit", toggleIcon: "fc.FcOpenedFolder", placement: "right"},
            {name: "SaveProperties", btnClasses: "btn btn-save", btnText: "Save", visibility: "visible", order: 3, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "right", disabled: true},
            {name: "UndoProperties", btnClasses: "btn", btnText: "", visibility: "contained", order: 5, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "right"},
            {name: "RedoProperties", btnClasses: "btn", btnText: "", visibility: "contained", order: 6, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "right"}
        ]
    },
    SEARCH_BAR_TOOLS: {
        classes: "backgroundNone",
        tools: [
            {name: "Search", btnClasses: "btn", btnText: "", visibility: "visible", order: 1, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "right"},
            {name: "DisplayConversation", btnClasses: "btn", btnText: "", visibility: "visible", order: 2, icon: "ai.AiFillEdit", toggleIcon: "fc.FcOpenedFolder", placement: "right"},
            {name: "Speak", btnClasses: "btn", btnText: "", visibility: "visible", order: 3, icon: "fc.FcFolder", toggleIcon: "fc.FcOpenedFolder", placement: "right", disabled: true}
        ]
    },
    PAGE_TOOLS: {
        classes: "ml-auto backgroundNone pr-4 borderRight",
        size: "1.4rem",
        tools: [
            {name: "AddPage", btnClasses: "btn hoverBackgroundNone", btnText: "", visibility: "visible", order: 1, icon: "ai.AiOutlineFileAdd", placement: "right"},
            {name: "CreateComponent", btnClasses: "btn hoverBackgroundNone", btnText: "", visibility: "visible", order: 2, icon: "hi.HiOutlineViewGridAdd", placement: "right"}
        ]
    },
    ARMAMENT_TOOLS: {
        classes: "ml-auto backgroundNone position-absolute right-0 top-0",
        tools: [
            {name: "ViewArmament", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 1, icon: "ai.AiFillEye", placement: "right"},
            {name: "EditArmament", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 2, icon: "ai.AiFillEdit", placement: "right"},
            {name: "ShareArmament", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 3, icon: "fa.FaShareAlt", placement: "right"},
            {name: "AddToProject", btnClasses: "btn backgroundNone", btnText: "", visibility: "visible", order: 3, icon: "md.MdAddToPhotos", placement: "right"}
        ]
    },
    GLOBAL_TOOLS: {
        classes: "backgroundNone pl-4",
        size: "1.7rem",
        tools: [
            {name: "Toggles", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "mr-2 h-25", btnText: "", visibility: "visible", order: 1, icon: "gi.GiToggles", placement: "right"},
            {name: "Help", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "mr-2 h-25", btnText: "", visibility: "visible", order: 2, icon: "io.IoMdHelpCircle", placement: "right"},
            {name: "Notifications", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "mr-2 h-25", btnText: "", visibility: "visible", order: 3, icon: "ai.AiFillNotification", placement: "right"},
            {name: "Profile", btnClasses: "btn extra-radial hoverBackgroundNone", layoutClasses: "h-25", btnText: "", visibility: "visible", order: 4, icon: "fa.FaUserCircle", placement: "right"},
        ]
    }
}

export default TOOLS_CONFIG;