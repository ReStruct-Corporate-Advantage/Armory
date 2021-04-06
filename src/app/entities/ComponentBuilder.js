class ComponentBuilder {
    constructor (str) {
        this.str = str ? str : "";
    }

    build (str) {
        this.str = this.str + str;
        return this;
    }

    toString () {
        return this.str;
    }
}

export default ComponentBuilder;