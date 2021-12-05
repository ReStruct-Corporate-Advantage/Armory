import { Component } from "../entities";
import {helper} from "../utils/CodeUtils/ComponentConfigHelper";

const DASHBOARD_CONFIG = {
    ADMIN_ACTIONS: {
        containerClasses: "col mx-auto mb-5",
        sectionClasses: "c-Dashboard__main__admin mx-auto",
        protected: true,
        parts: [
            {name: "AdminHeader", type: "header", classes: "section-header w-100 mb-0", text: "Armory Management"},
            {
                name: "ManageComponents", type: "button", classes: "c-Dashboard__btn raised-effect mx-auto col-7 mt-5 mb-4", text: "Manage Components", visibility: "visible",
                order: 0, icon: "fc.FcFolder", leftSnapped: true, tooltip: "Manage Components",
                subOptions: [
                    {
                        name: "AddCoreComponent", type: "button", classes: "c-Dashboard__btn col-12 my-3 raised-effect font-size-12", text: "Add a Core Component", visibility: "hidden",
                        action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/manage/component/add`)
                    },
                    {
                        name: "UpdateCoreComponent", type: "button", classes: "c-Dashboard__btn col-12 mb-3 raised-effect font-size-12", text: "Update a Core Component", visibility: "hidden",
                        action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/manage/component/update`)
                    }
                ],
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/manage/component`)
            },
            {
                name: "ManagePages", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-5 mb-4", text: "Manage Pages", visibility: "visible",
                order: 1, icon: "fi.FiMaximize", tooltip: "Manage Pages",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/manage/page`)
            },
            {
                name: "ManageProjects", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-5 mb-4", text: "Manage Projects", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "Manage Projects",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/manage/project`)
            }
        ]
    },
    RESUMPTION_ACTIONS: {
        containerClasses: "col",
        sectionClasses: "c-Dashboard__main__resume mx-auto",
        parts: [
            {name: "ResumptionHeader", type: "header", classes: "section-header w-100 mb-0", text: "Let's resume where your left..."},
            {
                name: "MyComponents", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-5 mb-4", text: "My Components", visibility: "visible",
                order: 0, icon: "fc.FcFolder", leftSnapped: true, tooltip: "My Components",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/component`)
            },
            {
                name: "MyPages", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-5 mb-4", text: "My Pages", visibility: "visible",
                order: 1, icon: "fi.FiMaximize", tooltip: "My Pages",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/page`)
            },
            {
                name: "MyProjects", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mt-5 mb-4", text: "My Projects", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "My Projects",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/project`)
            }
        ]
    },
    NEW_ACTIONS: {
        containerClasses: "col",
        sectionClasses: "c-Dashboard__main__buttons mx-auto",
        parts: [
            {name: "ResumptionHeader", type: "header", classes: "section-header w-100 mb-0", text: "...Or select one of the options below"},
            {
                name: "CreateProject", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5 mt-4", text: "Create a Project", visibility: "visible",
                order: 0, icon: "fc.FcFolder", leftSnapped: true, tooltip: "Create a Project",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/project`)
            },
            {
                name: "CreatePage", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5", text: "Create a Page Template", visibility: "visible",
                order: 1, icon: "fi.FiMaximize", tooltip: "Create a Page Template",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/page`)
            },
            {
                name: "CreateComponent", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5", text: "Create a Rich Component", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "Create a Rich Component",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => {
                    const component = new Component();
                    component.createContainer(userDetails)
                        .then(res => {
                            helper.generateContainer({componentsConfig, config: res.body.record, userDetails, dispatchComponentsConfig, dispatchSelectedComponent, dispatchLevels});
                            history.push(`/${userDetails.username}/component`)
                        });
                }
            },
            {name: "OptionSeparator", type: "p", classes: "option-separator col-6 mx-auto mb-5", text: "Or"},
            {
                name: "ExistingTemplate", type: "button", classes: "c-Dashboard__btn col-7 raised-effect mx-auto mb-5", text: "Use an existing template", visibility: "visible",
                order: 2, icon: "ai.AiOutlineEdit", tooltip: "Use an existing template",
                action: (componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails) => history.push(`/${userDetails.username}/template`)
            }
        ]
    }
}

export default DASHBOARD_CONFIG;