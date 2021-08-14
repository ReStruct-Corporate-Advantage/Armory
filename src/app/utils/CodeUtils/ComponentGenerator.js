import React from "react";
import ReactDOM from "react-dom";
import { withResizeDetector } from "react-resize-detector";
import {ArmamentWrapper} from "./../../components";

class ComponentGenerator {
    constructor () {
        this.defaultComponentDescriptor = {
            "elemType": "div",
            "defaultWidth": "2rem",
            "defaultHeight": "4rem",
            "handlers": {},
            "classes": "bg-grey text-center",
            "styles": {},
            "innerText": "Descriptor not added!"
        };
        this.defaultElementDescriptor = {
            "elemType": "div",
            "handlers": {},
            "classes": "bg-grey text-center",
            "styles": {},
            "innerText": "Descriptor not added!"
        };
        this.baseRepository = {};
        this.boardRepository = {};
    }

    // ====================================================== GENERATE FORKED COMPONENTS AND DRAG PREVIEW OF FORKED COMPONENTS ====================================================== //
    iterateAndGenerateWithConfig (root, selectedComponent, setSelectedComponent, comContainerRef) {
        if (!comContainerRef) {
            debugger;
        }
        const components = root && root.length ? root.map(node => this.generateComponentWithConfig(node, selectedComponent, setSelectedComponent, comContainerRef)) : [];
        return components;
    }

    // Main Function for generating a component on the fly
    generateComponentWithConfig (node, selectedComponent, setSelectedComponent, comContainerRef) {
        if (!node.items) {
            return this.decideTypeAndGenerateWithConfig(node, !!node.componentName, selectedComponent, setSelectedComponent, comContainerRef);
        } else {
            return this.iterateAndGenerateWithConfig(node.items, selectedComponent, setSelectedComponent, comContainerRef);
        }
    }

    decideTypeAndGenerateWithConfig(node, isComponentNode, selectedComponent, setSelectedComponent, comContainerRef) { // componentNode: React Component, not an HTML element
        if (node.isFunctional) {
            return this.generateFunctionalComponentWithConfig(node, isComponentNode, selectedComponent, setSelectedComponent, comContainerRef)
        } else {
            return this.generateClassComponentWithConfig(node, isComponentNode, selectedComponent, setSelectedComponent, comContainerRef);
        }
    }

    generateClassComponentWithConfig(node, isComponentNode, selectedComponent, setSelectedComponent, comContainerRef) {
        const componentName = node && (node.name || node.componentName); // name is specific to componentsConfig and doesn't always exist in database
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? {...descriptor.styles} : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        let childrenConfig = descriptor.children ? descriptor.children : [];
        const self = this;

        let c;
        if (isComponentNode) {
            c = class extends React.PureComponent {

                render() {
                    // TODO snap resize to grid and push snapped position to componentConfig
                    let style = {...props.style};
                    const descriptor = this.props.descriptor;
                    const attributes = descriptor ? descriptor.attributes : {};
                    style = descriptor && descriptor.styles ? {...style, ...descriptor.styles} : style;
                    childrenConfig = [...childrenConfig];
                    let dynamicSetOfChildren = descriptor && descriptor.children;
                    // if (childrenConfig && childrenConfig.) {
                    //     console.log(node.getBoundingClientRect());
                    // }
                    // const childrenFromSource = this.props.childItems;
                    dynamicSetOfChildren && dynamicSetOfChildren.forEach(dynamicChild => {
                        if ((dynamicChild.uuid && childrenConfig.findIndex(child => dynamicChild.uuid === child.uuid) < 0) || (!dynamicChild.uuid && childrenConfig.findIndex(child => !child.uuid) < 0)) {
                            childrenConfig.push(dynamicChild);
                        }
                    })
                    let childRenders = childrenConfig ? self.iterateAndGenerateWithConfig(childrenConfig, selectedComponent, setSelectedComponent, comContainerRef) : [];
//                     childRenders = childRenders.map(child => {
//                         const Component = child.item;
//                         return child.isChildComponentNode ? <Component /> : child.item
//                     })
                    childRenders = childRenders.map(child => child.item)
                    innerText && childRenders.push(innerText);
                    this.props.allowChildren && (style.overflow = "auto");
                    // childRenders = childrenFromSource ? [...childRenders, ...childrenFromSource] : childRenders
                    return childRenders && childRenders.length > 0 ? React.createElement(elemType, {style, className: props.className, ...attributes}, childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className, ...attributes});
                }
            }
            Object.defineProperty(c, 'name', {value: componentName});
            c = descriptor.classes && descriptor.classes.indexOf("toggle-resizable") > -1 ? withResizeDetector(c) : c;
            c = <ArmamentWrapper componentConfig={node} selectedComponent={selectedComponent} setSelectedComponent={setSelectedComponent} comContainerRef={comContainerRef}>{c}</ArmamentWrapper>
            this.boardRepository[node.uuid] = c;
        } else {
            c = childrenConfig && childrenConfig.length > 0 ? React.createElement(elemType, {style: props.style, className: props.className}, self.iterateAndGenerateWithConfig(childrenConfig, selectedComponent, setSelectedComponent, comContainerRef))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: c, isChildComponentNode: isComponentNode};
    }

    generateFunctionalComponentWithConfig(node, isComponentNode, selectedComponent, setSelectedComponent, comContainerRef) {
        const componentName = node && node.componentName;
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? descriptor.styles : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        props.style.border = "1px solid black";
        props.style.borderRadius = "5px";
        let childrenConfig = descriptor.children ? descriptor.children : [];
        const self = this;

        let f;
        if (isComponentNode) {
            f = function (_props_) {
                const childrenFromSource = this.props.childItems;
                childrenConfig = [...childrenConfig];
                let childRenders = childrenConfig ? self.iterateAndGenerateWithConfig(childrenConfig) : [];
                childRenders = childRenders.map(child => {
                    const Component = child.item;
                    return child.isChildComponentNode ? <Component /> : child.item
                })
                childRenders = childrenFromSource ? [...childRenders, ...childrenFromSource] : childRenders
                innerText && childRenders.push(innerText);
                return childRenders && childRenders.length > 0 ? React.createElement(elemType, {style: props.style, className: props.className}, childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className});
            }
            Object.defineProperty(f, 'name', {value: componentName});
            f = <ArmamentWrapper componentConfig={node} selectedComponent={selectedComponent} setSelectedComponent={setSelectedComponent} comContainerRef={comContainerRef}>{f}</ArmamentWrapper>
            !this.boardRepository[node.uuid] && (this.boardRepository[node.uuid] = f);
        } else {
            f = childrenConfig ? React.createElement(elemType, {style: props.style, className: props.className}, self.iterateAndGenerateWithConfig(childrenConfig, selectedComponent, setSelectedComponent, comContainerRef))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: f, isChildComponentNode: isComponentNode};
    }

    // ====================================================== GENERATE COMPONENT REPOSITORY - ONLY FOR DRAG PREVIEW OF NEW COMPONENTS====================================================== //
    generateClassComponent(node, isComponentNode) {
        const componentName = node && (node.name || node.componentName); // name is specific to componentsConfig and doesn't always exist in database
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? {...descriptor.styles} : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        let childrenConfig = descriptor.children;
        const self = this;

        let c;
        if (isComponentNode) {
            c = class extends React.PureComponent {
                render() {
                    // TODO snap resize to grid and push snapped position to componentConfig
                    const style = {...props.style};
                    let childRenders = childrenConfig ? self.iterateAndGenerate(childrenConfig) : [];
                    childRenders = childRenders.map(child => {
                        const Component = child.item;
                        return child.isChildComponentNode ? <Component /> : child.item
                    })
                    this.props.allowChildren && (style.overflow = "auto");
                    innerText && childRenders.push(innerText);
                    return childRenders && childRenders.length > 0 ? React.createElement(elemType, {style, className: props.className}, childRenders)
                    : React.createElement(elemType, {style: props.style, className: props.className});
                }
            }
            Object.defineProperty(c, 'name', {value: componentName});
            c = descriptor.classes && descriptor.classes.indexOf("toggle-resizable") > -1 ? withResizeDetector(c) : c;
            this.baseRepository[componentName] = c;
        } else {
            c = childrenConfig ? React.createElement(elemType, {style: props.style, className: props.className}, self.iterateAndGenerate(childrenConfig))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: c, isChildComponentNode: isComponentNode};
    }

    generateFunctionalComponent(node, isComponentNode) {
        const componentName = node && node.componentName;
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? descriptor.styles : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        props.style.border = "1px solid black";
        props.style.borderRadius = "5px";
        const childrenConfig = descriptor.children ? descriptor.children : [];
        const self = this;

        let f;
        if (isComponentNode) {
            f = function (_props_) {
                let childRenders = childrenConfig ? self.iterateAndGenerate(childrenConfig) : [];
                childRenders = childRenders.map(child => {
                    const Component = child.item;
                    return child.isChildComponentNode ? <Component /> : child.item
                })
                innerText && childRenders.push(innerText);
                return childRenders && childRenders.length > 0 ? React.createElement(elemType, {style: props.style, className: props.className}, childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className});
            }
            Object.defineProperty(f, 'name', {value: componentName});
            this.baseRepository[componentName] = f;
        } else {
            f = childrenConfig ? React.createElement(elemType, {style: props.style, className: props.className}, self.iterateAndGenerate(childrenConfig))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: f, isChildComponentNode: isComponentNode};
    }

    decideTypeAndGenerate(node, isComponentNode) { // componentNode: React Component, not an HTML element
        if (node.isFunctional) {
            return this.generateFunctionalComponent(node, isComponentNode)
        } else {
            return this.generateClassComponent(node, isComponentNode);
        }
    }

    iterateAndGenerate(root) {
        return root && root.length ? root.map(node => {
            if (!node.items) {
                return this.decideTypeAndGenerate(node, !!node.componentName);
            } else {
                return this.iterateAndGenerate(node.items);
            }
        }) : [];
    }
}

const compGen = new ComponentGenerator()
const repository = compGen.baseRepository;
const forkedRepository = compGen.boardRepository;

export {ComponentGenerator, compGen, forkedRepository, repository};