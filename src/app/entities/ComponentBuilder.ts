import { renderToString } from "react-dom/server";

class ComponentBuilder {
    str: string = "";

    constructor (str: string) {
        this.str = str ? str : "";
    }

    build (incoming: string) {
        incoming = incoming ? incoming : ""; 
        this.str = this.str + incoming;
        return this;
    }

    toString () {
        return this.str;
    }
}

export default ComponentBuilder;