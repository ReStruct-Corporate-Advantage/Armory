import React from "react";
import { withResizeDetector } from "react-resize-detector";
import {ArmamentWrapper, StaticArmamentWrapper} from "./../../components";

class ComponentGenerator {
    constructor () {
        this.defaultComponentDescriptor = {
            "elemType": "div",
            "defaultWidth": "2rem",
            "defaultHeight": "4rem",
            "defaultTop": "16px",
            "defaultLeft": "16px",
            "handlers": {},
            "classes": "bg-grey text-center border-red",
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
    iterateAndGenerateWithConfig (root, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket) {
        return root && root.length ? root.map((node, key) => this.generateComponentWithConfig(node, comContainerRef, context,
            selectedComponent, dispatchSelectedComponent, socket, key)) : [];
    }

    // Main Function for generating a component on the fly
    generateComponentWithConfig (node, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket, key) {
        if (!node.items) {
            return this.decideTypeAndGenerateWithConfig(node, !!node.componentName, comContainerRef, context, selectedComponent,
                dispatchSelectedComponent, socket, key);
        } else {
            return this.iterateAndGenerateWithConfig(node.items, comContainerRef, context, selectedComponent,
                dispatchSelectedComponent, socket, key);
        }
    }

    decideTypeAndGenerateWithConfig(node, isComponentNode, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket, key) { // componentNode: React Component, not an HTML element
        if (node.isFunctional) {
            return this.generateFunctionalComponentWithConfig(node, isComponentNode, comContainerRef, context, selectedComponent,
                dispatchSelectedComponent, socket, key);
        } else {
            return this.generateClassComponentWithConfig(node, isComponentNode, comContainerRef, context, selectedComponent,
                dispatchSelectedComponent, socket, key);
        }
    }

    generateClassComponentWithConfig(node, isComponentNode, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket, key) {
        const componentName = node && (node.name || node.componentName); // name is specific to componentsConfig and doesn't always exist in database
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? {...descriptor.styles} : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        (props.style.top || descriptor.defaultTop) && (node.top = props.style.top ? props.style.top : descriptor.defaultTop);
        (props.style.left || descriptor.defaultLeft) && (node.left = props.style.left ? props.style.left : descriptor.defaultLeft);
        let childrenConfig = descriptor.children ? descriptor.children : [];
        const self = this;

        let c;
        if (isComponentNode) {
            c = class extends React.PureComponent {

                componentDidCatch(error, errorInfo) {
                    console.log(error);
                    console.log(errorInfo);
                }

                render() {
                    // TODO snap resize to grid and push snapped position to componentConfig
                    let style = {...props.style};
                    const descriptor = this.props.descriptor;
                    const attributes = descriptor ? descriptor.attributes : {};
                    style = descriptor && descriptor.styles ? {...style, ...descriptor.styles} : style;
                    childrenConfig = [...childrenConfig];
                    let dynamicSetOfChildren = descriptor && descriptor.children;
                    dynamicSetOfChildren && dynamicSetOfChildren.forEach(dynamicChild => {
                        if ((dynamicChild.uuid && childrenConfig.findIndex(child => dynamicChild.uuid === child.uuid) < 0)
                            || (!dynamicChild.uuid && childrenConfig.findIndex(child => !child.uuid) < 0)) {
                            childrenConfig.push(dynamicChild);
                        }
                    })
                    let childRenders = childrenConfig
                        ? self.iterateAndGenerateWithConfig(childrenConfig, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket) : [];
                    childRenders = childRenders.map(child => child.item)
                    innerText && childRenders.push(innerText);
                    // this.props.allowChildren && (style.overflow = "auto");
                    // childRenders = childrenFromSource ? [...childRenders, ...childrenFromSource] : childRenders
                    return childRenders && childRenders.length > 0
                        ? React.createElement(elemType, {style, className: props.className, ...attributes}, childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className, ...attributes});
                }
            }
            Object.defineProperty(c, 'name', {value: componentName});
            c = descriptor.classes && descriptor.classes.indexOf("toggle-resizable") > -1 ? withResizeDetector(c) : c;
            c = context === "editor"
                ? <StaticArmamentWrapper componentConfig={node} key={key}>{c}</StaticArmamentWrapper>
                : <ArmamentWrapper  key={key} componentConfig={node} selectedComponent={selectedComponent} dispatchSelectedComponent={dispatchSelectedComponent}
                comContainerRef={comContainerRef} socket={socket}>{c}</ArmamentWrapper>
            this.boardRepository[node.uuid] = c;
        } else {
            c = childrenConfig && childrenConfig.length > 0 ? React.createElement(elemType, {style: props.style, className: props.className},
                self.iterateAndGenerateWithConfig(childrenConfig, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: c, isChildComponentNode: isComponentNode};
    }

    generateFunctionalComponentWithConfig(node, isComponentNode, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket) {
        const componentName = node && node.componentName;
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? descriptor.styles : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        (props.style.top || descriptor.defaultTop) && (node.top = props.style.top ? props.style.top : descriptor.defaultTop);
        (props.style.left || descriptor.defaultLeft) && (node.left = props.style.left ? props.style.left : descriptor.defaultLeft);
        props.style.border = "1px solid black";
        props.style.borderRadius = "5px";
        let childrenConfig = descriptor.children ? descriptor.children : [];
        const self = this;

        let f;
        if (isComponentNode) {
            f = function (_props_) {
                const childrenFromSource = this.props.childItems;
                childrenConfig = [...childrenConfig];
                let childRenders = childrenConfig ? self.iterateAndGenerateWithConfig(childrenConfig, comContainerRef, context, selectedComponent,
                    dispatchSelectedComponent, socket) : [];
                childRenders = childRenders.map(child => {
                    const Component = child.item;
                    return child.isChildComponentNode ? <Component /> : child.item
                })
                childRenders = childrenFromSource ? [...childRenders, ...childrenFromSource] : childRenders
                innerText && childRenders.push(innerText);
                return childRenders && childRenders.length > 0
                        ? React.createElement(elemType, {style: props.style, className: props.className},childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className});
            }
            Object.defineProperty(f, 'name', {value: componentName});
            f = context === "editor"
                ? <StaticArmamentWrapper componentConfig={node}>{f}</StaticArmamentWrapper>
                : <ArmamentWrapper componentConfig={node} selectedComponent={selectedComponent} dispatchSelectedComponent={dispatchSelectedComponent}
                comContainerRef={comContainerRef} socket={socket}>{f}</ArmamentWrapper>
            !this.boardRepository[node.uuid] && (this.boardRepository[node.uuid] = f);
        } else {
            f = childrenConfig
                ? React.createElement(elemType, {style: props.style, className: props.className},
                    self.iterateAndGenerateWithConfig(childrenConfig, comContainerRef, context, selectedComponent, dispatchSelectedComponent, socket))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: f, isChildComponentNode: isComponentNode};
    }

    // ====================================================== GENERATE COMPONENT REPOSITORY - ONLY FOR DRAG PREVIEW OF NEW COMPONENTS====================================================== //
    generateClassComponent(node, isComponentNode, key) {
        const componentName = node && (node.name || node.componentName); // name is specific to componentsConfig and doesn't always exist in database
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? {...descriptor.styles} : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        (props.style.top || descriptor.defaultTop) && (node.top = props.style.top ? props.style.top : descriptor.defaultTop);
        (props.style.left || descriptor.defaultLeft) && (node.left = props.style.left ? props.style.left : descriptor.defaultLeft);
        let childrenConfig = descriptor.children;
        const self = this;

        let c;
        if (isComponentNode) {
            c = class extends React.PureComponent {
                render() {
                    // TODO snap resize to grid and push snapped position to componentConfig
                    let style = {...props.style};
                    // Merge styles and classes from DB by styles and classes sent in props from calling component below
                    const descriptor = this.props.descriptor;
                    style = descriptor && descriptor.styles ? {...style, ...descriptor.styles} : style;
                    const dbClasses = props.className ? props.className.split(" ") : [];
                    const propClasses = descriptor && descriptor.classes ? descriptor.classes.split(" ") : [];
                    propClasses.forEach(cls => dbClasses.indexOf(cls) < 0 && dbClasses.push(cls));
                    props.className = dbClasses.join(" ");
                    let childRenders = childrenConfig ? self.iterateAndGenerate(childrenConfig) : [];
                    childRenders = childRenders.map(child => {
                        const Component = child.item;
                        return child.isChildComponentNode ? <Component /> : child.item
                    })
                    this.props.allowChildren && (style.overflow = "auto");
                    innerText && childRenders.push(innerText);
                    return childRenders && childRenders.length > 0 ? React.createElement(elemType, {key, style, className: props.className}, childRenders)
                    : React.createElement(elemType, {key, style: props.style, className: props.className});
                }
            }
            Object.defineProperty(c, 'name', {value: componentName});
            c = descriptor.classes && descriptor.classes.indexOf("toggle-resizable") > -1 ? withResizeDetector(c) : c;
            this.baseRepository[componentName] = c;
        } else {
            c = childrenConfig ? React.createElement(elemType, {key, style: props.style, className: props.className}, self.iterateAndGenerate(childrenConfig))
                : React.createElement(elemType, {key, style: props.style, className: props.className});
        }
        return {item: c, isChildComponentNode: isComponentNode};
    }

    generateFunctionalComponent(node, isComponentNode, key) {
        const componentName = node && node.componentName;
        const descriptor = node.descriptor || (isComponentNode ? this.defaultComponentDescriptor : this.defaultElementDescriptor);
        const elemType = descriptor.elemType;
        const innerText = descriptor.innerText;
        const props = descriptor.props ? descriptor.props : {};
        props.className = descriptor.classes;
        props.style = descriptor.styles ? descriptor.styles : {};
        (props.style.height || descriptor.defaultHeight) && (props.style.height = props.style.height ? props.style.height : descriptor.defaultHeight);
        (props.style.width || descriptor.defaultWidth) && (props.style.width = props.style.width ? props.style.width : descriptor.defaultWidth);
        (props.style.top || descriptor.defaultTop) && (node.top = props.style.top ? props.style.top : descriptor.defaultTop);
        (props.style.left || descriptor.defaultLeft) && (node.left = props.style.left ? props.style.left : descriptor.defaultLeft);
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
                return childRenders && childRenders.length > 0 ? React.createElement(elemType, {key, style: props.style, className: props.className}, childRenders)
                        : React.createElement(elemType, {key, style: props.style, className: props.className});
            }
            Object.defineProperty(f, 'name', {value: componentName});
            this.baseRepository[componentName] = f;
        } else {
            f = childrenConfig ? React.createElement(elemType, {key, style: props.style, className: props.className}, self.iterateAndGenerate(childrenConfig))
                : React.createElement(elemType, {key, style: props.style, className: props.className});
        }
        return {item: f, isChildComponentNode: isComponentNode};
    }

    decideTypeAndGenerate(node, isComponentNode, key) { // componentNode: React Component, not an HTML element
        if (node.isFunctional) {
            return this.generateFunctionalComponent(node, isComponentNode, key)
        } else {
            return this.generateClassComponent(node, isComponentNode, key);
        }
    }

    iterateAndGenerate(root, key) {
        return root && root.length ? root.map((node, keyInner) => {
            if (!node.items) {
                return this.decideTypeAndGenerate(node, !!node.componentName, `${key}-${keyInner}`);
            } else {
                return this.iterateAndGenerate(node.items, `${key}-${keyInner}`);
            }
        }) : [];
    }
}

const compGen = new ComponentGenerator()
const repository = compGen.baseRepository;
const forkedRepository = compGen.boardRepository;

export {ComponentGenerator, compGen, forkedRepository, repository};