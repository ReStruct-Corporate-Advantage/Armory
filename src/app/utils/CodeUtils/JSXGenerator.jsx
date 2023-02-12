import React, { createRef } from "react";
import * as components from "../../components";
import * as hocComponents from "../../HOC";
import EVENTS from "../eventHandlers";

class JSXGenerator {
    static generate(config, reactDependencies, refs) {
        if (config === undefined) {
            return null;
        }
        if (typeof config === "string") {
            return config;
        }
        if (config.items !== undefined) {
            const common = config.common || {};
            return config.items.map(item => {
                JSXGenerator.deepMerge(common, item);
                return JSXGenerator.generate(item, reactDependencies, refs)
            });
        } else {
            const children = JSXGenerator.generate(config.content, reactDependencies, refs);
            return JSXGenerator.createElement(config, children, reactDependencies, refs);
        }
    }

    static createElement(config, children, reactDependencies, refs) {
        let element = null;
        if (config.attributes && config.attributes.eventDescription) {
            const eventHandlers = EVENTS.handleEventDescription(config.attributes.eventDescription, reactDependencies);
            config.attributes = {...config.attributes, ...eventHandlers};
        }
        if (refs && config.containerRef && !(config.containerRef in refs)) {
            const ref = createRef();
            refs[config.containerRef] = ref;
            config.attributes.containerRef = ref;
        }
        if (config.type) {
            if (config.type === "react") {
                const Component = components[config.element];
                if (Component) {
                    element = children ? <Component {...config.attributes}>{children}</Component> : <Component {...config.attributes} />;
                }
            } else if (config.type === "HOC") {
                const HOCComponent = hocComponents[config.element];
                if (children && HOCComponent) {
                    element = <HOCComponent {...config.attributes}>{children}</HOCComponent>;
                }
            }
        } else if (config.element) {
            element = React.createElement(config.element, config.attributes, children);
        }
        return element;
    }

    static deepMerge(src, dest) {
        Object.keys(src).forEach(key => {
            if (!(key in dest)) {
                dest[key] = src[key];
            } else {
                if (typeof src[key] === "object") {
                    JSXGenerator.deepMerge(src[key], dest[key])
                } else if (typeof src[key] === "string") {
                    if (key === "class" || key === "className" || key === "classes") {
                        const srcParts = src[key].split(" ");
                        const destParts = dest[key].split(" ");
                        srcParts.forEach(str => destParts.indexOf(str) === -1 && destParts.push(str));
                        dest[key] = destParts.join(" ");
                    }
                    // else allow override
                }
            }
        })
    }
}

export default JSXGenerator;