import React from "react";
import { withResizeDetector } from "react-resize-detector";
import Helper from "../Helper";

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
        this.baseRepository = {};
        this.boardRepository = {};
    }
    
    generateClassComponent(node, isComponentNode, isForked) {
        const componentName = node && (node.name || node.componentName); // name is specific to componentsConfig and doesn't always exist in database
        const descriptor = node.descriptor || this.defaultComponentDescriptor;
        const elemType = descriptor.elemType;
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
                    const descriptor = this.props.descriptor;
                    childrenConfig = [...childrenConfig];
                    let dynamicSetOfChildren = descriptor && descriptor.children;
                    // const childrenFromSource = this.props.childItems;
                    dynamicSetOfChildren && dynamicSetOfChildren.forEach(dynamicChild => {
                        if (dynamicChild.uuid || childrenConfig.findIndex(child => !child.uuid) < 0) {
                            childrenConfig.push(dynamicChild);
                        }
                    })
                    let childRenders = childrenConfig ? self.populateComponentRepository(childrenConfig) : [];
                    childRenders = childRenders.map(child => {
                        const Component = child.item;
                        return child.isChildComponentNode ? <Component /> : child.item
                    })
                    this.props.allowChildren && (style.overflow = "auto");
                    // childRenders = childrenFromSource ? [...childRenders, ...childrenFromSource] : childRenders
                    return childRenders && childRenders.length > 0 ? React.createElement(elemType, {style, className: props.className}, childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className});
                }
            }
            Object.defineProperty(c, 'name', {value: componentName});
            c = descriptor.classes && descriptor.classes.indexOf("toggle-resizable") > -1 ? withResizeDetector(c) : c;
            isForked ? this.boardRepository[componentName] = c : this.baseRepository[componentName] = c;
        } else {
            c = childrenConfig ? React.createElement(elemType, {style: props.style, className: props.className}, self.populateComponentRepository(childrenConfig))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: c, isChildComponentNode: isComponentNode};
    }

    generateFunctionalComponent(node, isComponentNode, isForked) {
        const componentName = node && node.componentName;
        const descriptor = node.descriptor || this.defaultComponentDescriptor;
        const elemType = descriptor.elemType;
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
                const childrenFromSource = this.props.childItems;
                let childRenders = childrenConfig ? self.populateComponentRepository(childrenConfig) : [];
                childRenders = childRenders.map(child => {
                    const Component = child.item;
                    return child.isChildComponentNode ? <Component /> : child.item
                })
                childRenders = childrenFromSource ? [...childRenders, ...childrenFromSource] : childRenders
                return childRenders && childRenders.length > 0 ? React.createElement(elemType, {style: props.style, className: props.className}, childRenders)
                        : React.createElement(elemType, {style: props.style, className: props.className});
            }
            Object.defineProperty(f, 'name', {value: componentName});
            isForked ? this.boardRepository[componentName] = f : this.baseRepository[componentName] = f;
        } else {
            f = childrenConfig ? React.createElement(elemType, {style: props.style, className: props.className}, self.populateComponentRepository(childrenConfig))
                : React.createElement(elemType, {style: props.style, className: props.className});
        }
        return {item: f, isChildComponentNode: isComponentNode};
    }

    generate(node, isComponentNode, isForked) { // componentNode: React Component, not an HTML element
        if (node.isFunctional) {
            return this.generateFunctionalComponent(node, isComponentNode, isForked)
        } else {
            return this.generateClassComponent(node, isComponentNode, isForked);
        }
    }

    populateComponentRepository(root) {
        return root && root.length ? root.map(node => {
            if (!node.items) {
                return this.generate(node, !!node.componentName);
            } else {
                return this.populateComponentRepository(node.items);
            }
        }) : [];
    }
}

const compGen = new ComponentGenerator()
const repository = compGen.baseRepository;
const forkedRepository = compGen.boardRepository;

export {ComponentGenerator, compGen, forkedRepository, repository};