import ComponentBuilder from "./../entities/ComponentBuilder";

class CodeGenerator {

    constructor () {
        this.defaultComponentDescriptor = {
            "elemType": "div",
            "defaultWidth": "2rem",
            "defaultHeight": "4rem",
            "handlers": {},
            "classes": "bg-grey text-center",
            "styles": {},
            "innerText": "Descriptor not added!"
        }
    }

    static generate (root) {
        return root && root.reduce((acc, component) => {
            const descriptor = component.definition.descriptor ? component.definition.descriptor : this.defaultComponentDescriptor;
            return acc + CodeGenerator.processDescriptor(descriptor);
        }, "")
    }

    static processDescriptor (descriptor) {
        const builder = new ComponentBuilder("");
        const tag = descriptor.elemType;
        const width = descriptor.defaultWidth ? descriptor.defaultWidth : "2rem";
        const height = descriptor.defaultWidth ? descriptor.defaultWidth : "2rem"
        const classes = descriptor.classes;
        const styles = descriptor.styles ? JSON.stringify(descriptor.styles) : "";
        const handlers = descriptor.handlers
        const text = descriptor.innerText;
        builder.build(`<${tag}`)
            .build(" ")
            .build(`style={{width: '${width}', height: '${height}'}}`)
            .build(" ")
            .build(classes ? `className="${classes}" ` : "")
            .build(`style={${styles}} `)
            .build(CodeGenerator.processHandlers(handlers))
            .build(">")
            .build(`<p>${text}</p>`)
            .build(`</${tag}`)
            ;
        return builder.toString();
    }

    static processHandlers (handlers) {
        return handlers && Object.keys(handlers) > 0 ? Object.keys(handlers).reduce((acc, key) => {
            const handler = handlers[key];
            return acc + `${key}=${handler} `;
        }, ""): ""
    }
}

export default CodeGenerator;