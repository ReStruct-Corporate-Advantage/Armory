import { CodeCollapsable, CodeComment, CodeLine, CodeFragment } from "../../components";
import {FRAGMENT_TYPE} from "../../constants/types";

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
        };
        this.indentCounter = 0;
        this.lineCounter = 1;
    }

    static generate (root, dispatchSelectedComponent) {
        try {
            const component = root[0];
            component.uuid = component.descriptor.id;
            const childrenMeta = component.descriptor.children;
            const generator = new CodeGenerator();
            this.indentCounter = 0;
            const children = <>
                {generator.generateStartingTag(component)}
                {childrenMeta && childrenMeta.length > 0 ? generator.generateChildren(component, ++this.indentCounter, dispatchSelectedComponent) : <CodeComment indent={1} comment = "Add components from the left panel to view them here!" />}
                {generator.generateClosingTag(component)}
            </>
            return <CodeCollapsable id="arm-root" dispatchSelectedComponent={dispatchSelectedComponent} name="Root" indent={0}>{children}</CodeCollapsable>;
        } catch (e) {
            console.log(e);
        }
        return <CodeCollapsable id="arm-root" dispatchSelectedComponent={dispatchSelectedComponent} name="Root" indent={0}><CodeComment comment = {"Couldn\"t generate code for requested component!"} /></CodeCollapsable>;
    }

    generateChildren (component, counter, dispatchSelectedComponent) {
        const descriptor = component.descriptor || this.defaultComponentDescriptor;
        const children = descriptor.children ? [...descriptor.children] : [];
        const text = descriptor.innerText;
        text && children.push({
            name: "TextComponent",
            innerText: text,
            order: 0
        });
        return children.map((component, key) => {
            if (component.name === "TextComponent") {
                return <CodeLine key={key} indent={counter} ><CodeFragment type={FRAGMENT_TYPE.TEXT} value={component.innerText} /></CodeLine>
            } else {
                return this.processDescriptor(component, counter, key, dispatchSelectedComponent);
            }
        })
    }

    processDescriptor (component, counter, key, dispatchSelectedComponent) {
        const descriptor = component.descriptor || this.defaultComponentDescriptor;
        // descriptor.uuid = component.uuid;
        const children = <>
            {this.generateStartingTag(component)}
            {this.generateChildren(component, descriptor.children && descriptor.children.length > 0 ? counter + 1 : counter, dispatchSelectedComponent)}
            {!component.selfClosing && this.generateClosingTag(component)}
        </>
        return <CodeCollapsable id={component.uuid} dispatchSelectedComponent={dispatchSelectedComponent} key={key} name={component.name || "No Name!"} indent={counter}>{children}</CodeCollapsable>;
    }

    generateStartingTag (component) {
        const descriptor = component.descriptor || this.defaultComponentDescriptor;
        const fragments = []
        const tag = descriptor.elemType;
        const id = component.uuid;
        const width = descriptor.defaultWidth ? descriptor.defaultWidth : "2rem";
        const height = descriptor.defaultWidth ? descriptor.defaultWidth : "2rem"
        const classes = descriptor.classes;
        const styles = descriptor.styles ? descriptor.styles : "";
        const handlers = descriptor.handlers ? descriptor.handlers : {}
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ENCLOSER} left={true} initial={true} key={id + "-" + 1} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.TAG} value={tag} key={id + "-" + 2} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.SPACER} key={id + "-" + 3} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ATTRIBUTE} attrKey="id" value={id} key={id + "-" + 4} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.SPACER} key={id + "-" + 5} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ATTRIBUTE} attrKey="style" value={{...styles, width, height}} key={id + "-" + 6} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.SPACER} key={id + "-" + 7} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ATTRIBUTE} attrKey="className" value={classes ? classes + " " : ""} key={id + "-" + 8} />)
        Object.keys(handlers).forEach((handler, key) => fragments.push(<CodeFragment type={FRAGMENT_TYPE.HANDLER} attrKey={handler} value={handlers[handler]} key={id + "-" + key + "-" + 1} />))
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ENCLOSER} left={false} key={id + "-" + 9} />)
        return <CodeLine>{fragments}</CodeLine>;
    }

    generateClosingTag (component) {
        const descriptor = component.descriptor || this.defaultComponentDescriptor;
        const id = component.uuid;
        const tag = descriptor.elemType;
        const fragments = []
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ENCLOSER} left={true} initial={false} key={id + "-" + 1} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.TAG} value={tag} key={id + "-" + 2} />)
        fragments.push(<CodeFragment type={FRAGMENT_TYPE.ENCLOSER} left={false} key={id + "-" + 3} />)
        return <CodeLine>{fragments}</CodeLine>;
    }

    processHandlers (handlers) {
        return handlers && Object.keys(handlers) > 0 ? Object.keys(handlers).reduce((acc, key) => {
            const handler = handlers[key];
            return acc + `${key}=${handler} `;
        }, ""): ""
    }
}

export default CodeGenerator;