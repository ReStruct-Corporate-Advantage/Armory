import * as $ from "jquery";
import DOMHelper from "./DOMHelper";

class DescriptorGenerator {
    static generate () {
        const element = $("<div id='foo'><a href='#'>Link</a><span></span></div>")
        const domHelper = new DOMHelper();
        var jsonOutput = domHelper.toJSON(element.get(0), {
            attributes: ["id"],
            domProperties: {
                exclude: true,
                values: ["clientHeight", "clientWidth", "hidden", "draggable", "autofocus", "isConnected", "contentEditable", "isContentEditable", "baseURI", "namespaceURI", "localName",
                    "nodeName", "spellcheck", "translate", "host", "hostname", "pathname", "port", "protocol", "origin", "clientLeft", "clientTop", "offsetWidth", "offsetHeight", "offsetLeft",
                    "offsetTop", "offsetWidth", "scrollHeight", "scrollLeft", "scrollTop", "scrollWidth"]
            },
            deep: 5,
            // stringify: true
            });
        console.log(jsonOutput);
    }
}

export default DescriptorGenerator;