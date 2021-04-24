import { renderToString } from "react-dom/server";

class ComponentBuilder {
    constructor (str) {
        this.str = str ? str : "";
    }

    build (incoming) {
        incoming = incoming ? incoming : ""; 
        this.str = this.str + incoming;
        return this;
    }

    toString () {
        return this.str;
    }
}

export default ComponentBuilder;