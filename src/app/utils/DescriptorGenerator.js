import * as $ from "jquery";
import DOMHelper from "./DOMHelper";

class DescriptorGenerator {
    static generate (codeString) {
        try {
            const element = $(codeString)
            const domHelper = new DOMHelper();
            var jsonOutput = domHelper.toJSON(element.get(0), {
                attributes: ["id"],
                domProperties: {
                    exclude: true,
                    values: ["clientHeight", "clientWidth", "enctype", "encoding", "noValidate", "formNoValidate", "defaultChecked", "formAction", "indeterminate", "hidden", "draggable", "autofocus", "isConnected", "contentEditable", "isContentEditable", "baseURI", "namespaceURI", "localName",
                        "nodeName", "spellcheck", "translate", "host", "hostname", "pathname", "port", "protocol", "origin", "clientLeft", "clientTop", "offsetWidth", "offsetHeight", "offsetLeft",
                        "offsetTop", "offsetWidth", "scrollHeight", "scrollLeft", "scrollTop", "scrollWidth", "willValidate", "webkitdirectory", "incremental", "webkitEntries"]
                },
                deep: 5,
                // stringify: true
                });
            console.log(jsonOutput);
            return jsonOutput
        } catch (e) {
            console.log(e);
            return e.toString();
        }
    }
}

export default DescriptorGenerator;