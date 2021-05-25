import Helper from "./Helper";

class DOMHelper {

    constructor () {
        this.domJSON = {};
        this.metadata = {
            href: window.location.href || null,
            userAgent: window.navigator && window.navigator.userAgent ? window.navigator.userAgent : null
        };
        this.defaultsForToJSON = {
            absolutePaths: [ "action", "data", "href", "src" ],
            attributes: true,
            computedStyle: false,
            cull: true,
            deep: true,
            domProperties: true,
            filter: false,
            htmlOnly: false,
            metadata: false,
            serialProperties: false,
            stringify: false
        };
        this.banned = [ "link", "script" ];
        this.required = [ "nodeType", "nodeValue", "tagName" ];
        this.ignored = [ "attributes", "childNodes", "children", "classList", "dataset", "style" ];
        this.serials = [ "innerHTML", "innerText", "outerHTML", "outerText", "prefix", "text", "textContent", "wholeText" ];
    }

    static process(str) {
        var div = document.createElement('div');
        div.innerHTML = str.trim();
      
        return DOMHelper.format(div, 0).innerHTML;
      }
      
      static format(node, level) {
        var indentBefore = new Array(level++ + 1).join('  '),
          indentAfter = new Array(level - 1).join('  '),
          textNode;
      
        for (var i = 0; i < node.children.length; i++) {
          textNode = document.createTextNode('\n' + indentBefore);
          node.insertBefore(textNode, node.children[i]);
      
          DOMHelper.format(node.children[i], level);
      
          if (node.lastElementChild === node.children[i]) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode);
          }
        }
      
        return node;
      }
      

    toJSON(node, opts) {
        var copy, options = {}, output = {};
        var timer = new Date().getTime();
        var requiring = this.required.slice();
        var ignoring = this.ignored.slice();
        options = Helper.extend({}, this.defaultsForToJSON, opts);
        options.absolutePaths = DOMHelper.toShorthand(options.absolutePaths);
        options.attributes = DOMHelper.toShorthand(options.attributes);
        options.computedStyle = DOMHelper.toShorthand(options.computedStyle);
        options.domProperties = DOMHelper.toShorthand(options.domProperties);
        options.serialProperties = DOMHelper.toShorthand(options.serialProperties);
        options.absoluteBase = window.location.origin + "/";
        if (options.serialProperties !== true) {
            if (options.serialProperties instanceof Array && options.serialProperties.length) {
                if (options.serialProperties[0] === true) {
                    ignoring = ignoring.concat(DOMHelper.boolDiff(this.serials, options.serialProperties));
                } else {
                    ignoring = ignoring.concat(DOMHelper.boolInter(this.serials, options.serialProperties));
                }
            } else {
                ignoring = ignoring.concat(this.serials);
            }
        }
        if (options.domProperties instanceof Array) {
            if (options.domProperties[0] === true) {
                options.domProperties = DOMHelper.boolDiff(Helper.unique(options.domProperties, ignoring), requiring);
            } else {
                options.domProperties = DOMHelper.boolDiff(Helper.unique(options.domProperties, requiring), ignoring);
            }
        } else {
            if (options.domProperties === false) {
                options.domProperties = requiring;
            } else {
                options.domProperties = [ true ].concat(ignoring);
            }
        }
        copy = this.toJSONCollect(node, options, 0);
        if (options.metadata) {
            output.meta = Helper.extend({}, this.metadata, {
                clock: new Date().getTime() - timer,
                date: new Date().toISOString(),
                dimensions: {
                    inner: {
                        x: window.innerWidth,
                        y: window.innerHeight
                    },
                    outer: {
                        x: window.outerWidth,
                        y: window.outerHeight
                    }
                },
                options: options
            });
            output.node = copy;
        } else {
            output = copy;
        }
        if (options.stringify) {
            return JSON.stringify(output);
        }
        return output;
    }

    toJSONCollect (node, opts, depth) {
        var style, kids, kidCount, thisChild, children, copy = Helper.copyJSON(node, opts);
        if (node.nodeType === 1) {
            for (var b in this.banned) {
                if (node.tagName.toLowerCase() === this.banned[b]) {
                    return null;
                }
            }
        } else if (node.nodeType === 3 && !node.nodeValue.trim()) {
            return null;
        }
        if (opts.attributes && node.attributes) {
            copy.attributes = DOMHelper.attrJSON(node, opts);
        }
        if (opts.computedStyle && (style = DOMHelper.styleJSON(node, opts))) {
            copy.style = style;
        }
        if ((opts.deep === true || typeof opts.deep === "number") && opts.deep > depth) {
            children = [];
            kids = opts.htmlOnly ? node.children : node.childNodes;
            kidCount = kids.length;
            for (var c = 0; c < kidCount; c++) {
                thisChild = this.toJSONCollect(kids[c], opts, depth + 1);
                if (thisChild) {
                    children.push(thisChild);
                }
            }
            copy.childNodes = children;
        }
        return copy;
    };

    static attrJSON (node, opts) {
        let attributes = {}, absAttr;
        const attr = node.attributes;
        const length = attr.length;
        for (let i = 0; i < length; i++) {
            attributes[attr[i].name] = attr[i].value;
        }
        attributes = opts.attributes ? DOMHelper.boolFilter(attributes, opts.attributes) : null;
        absAttr = DOMHelper.boolFilter(attributes, opts.absolutePaths);
        for (const i in absAttr) {
            attributes[i] = DOMHelper.toAbsolute(absAttr[i], opts.absoluteBase);
        }
        return attributes;
    };

    static styleJSON (node, opts) {
        var style, css = {};
        if (opts.computedStyle && node.style instanceof CSSStyleDeclaration) {
            style = window.getComputedStyle(node);
        } else {
            return null;
        }
        for (var k in style) {
            if (k !== "cssText" && !k.match(/\d/) && typeof style[k] === "string" && style[k].length) {
                css[k] = style[k];
            }
        }
        return opts.computedStyle instanceof Array ? DOMHelper.boolFilter(css, opts.computedStyle) : css;
    };

    static boolInter (item, filter) {
        var output;
        if (item instanceof Array) {
            output = Helper.unique(item.filter(function(val) {
                return filter.indexOf(val) > -1;
            }));
        } else {
            output = {};
            for (var f in filter) {
                if (item.hasOwnProperty(filter[f])) {
                    output[filter[f]] = item[filter[f]];
                }
            }
        }
        return output;
    }

    static boolDiff (item, filter) {
        var output;
        if (item instanceof Array) {
            output = Helper.unique(item.filter(function(val) {
                return filter.indexOf(val) === -1;
            }));
        } else {
            output = {};
            for (var i in item) {
                output[i] = item[i];
            }
            for (var f in filter) {
                if (output.hasOwnProperty(filter[f])) {
                    delete output[filter[f]];
                }
            }
        }
        return output;
    }

    static boolFilter (item, filter) {
        if (filter === false) {
            return item instanceof Array ? [] : {};
        }
        if (filter instanceof Array && filter.length) {
            if (typeof filter[0] === "boolean") {
                if (filter.length === 1 && typeof filter[0] === "boolean") {
                    if (filter[0] === true) {
                        return Helper.copy(item);
                    } else {
                        return item instanceof Array ? [] : {};
                    }
                } else {
                    if (filter[0] === true) {
                        return DOMHelper.boolDiff(item, filter.slice(1));
                    } else {
                        return DOMHelper.boolInter(item, filter.slice(1));
                    }
                }
            } else {
                return DOMHelper.boolInter(item, filter);
            }
        } else {
            return Helper.copy(item);
        }
    }

    static toShorthand (filterList) {
        var outputArray;
        if (typeof filterList === "boolean") {
            return filterList;
        } else if (typeof filterList === "object" && filterList !== null) {
            if (filterList instanceof Array) {
                return filterList.filter(function(v, i) {
                    return (typeof v === "string" || i === 0) && v === true ? true : false;
                });
            } else {
                if (!(filterList.values instanceof Array)) {
                    return false;
                }
                outputArray = filterList.values.filter(function(v) {
                    return typeof v === "string" ? true : false;
                });
                if (!outputArray.length) {
                    return false;
                }
                if (filterList.exclude) {
                    outputArray.unshift(filterList.exclude);
                }
                return outputArray;
            }
        } else if (filterList) {
            return true;
        }
        return false;
    }

    static toAbsolute (value, origin) {
        var protocol, stack, parts;
        if (value.match(/(?:^data:|^[\w\-+.]*?:\/\/|^\/\/)/i)) {
            return value;
        }
        if (value.charAt(0) === "/") {
            return origin + value.substr(1);
        }
        protocol = origin.indexOf("://") > -1 ? origin.substring(0, origin.indexOf("://") + 3) : "";
        stack = (protocol.length ? origin.substring(protocol.length) : origin).split("/");
        parts = value.split("/");
        stack.pop();
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === ".") {
                continue;
            }
            if (parts[i] === "..") {
                if (stack.length > 1) {
                    stack.pop();
                }
            } else {
                stack.push(parts[i]);
            }
        }
        return protocol + stack.join("/");
    }


    ////////////////////////////////// JSON to DOM ////////////////////////////////////
    toDOMCollect (obj, parent, doc) {
        let node;
        if (obj.nodeType) {
            node = DOMHelper.createNode(obj.nodeType, doc, obj);
            parent.appendChild(node);
        } else {
            return false;
        }
        for (const x in obj) {
            if (typeof obj[x] !== "object" && x !== "isContentEditable" && x !== "childNodes") {
                try {
                    node[x] = obj[x];
                } catch (e) {
                    continue;
                }
            }
        }
        if (obj.nodeType === 1 && obj.tagName) {
            if (obj.attributes) {
                for (const a in obj.attributes) {
                    node.setAttribute(a, obj.attributes[a]);
                }
            }
        }
        if (obj.childNodes && obj.childNodes.length) {
            for (const c in obj.childNodes) {
                this.toDOMCollect(obj.childNodes[c], node, doc);
            }
        }
    };

    toDOM (obj, opts) {
        var options, node;
        if (typeof obj === "string") {
            obj = JSON.parse(obj);
        }
        options = Helper.extend({}, this.defaultsForToDOM, opts);
        node = document.createDocumentFragment();
        if (options.noMeta) {
            this.toDOMCollect(obj, node, node);
        } else {
            this.toDOMCollect(obj.node, node, node);
        }
        return node;
    };

    static createNode (type, doc, data) {
        if (doc instanceof DocumentFragment) {
            doc = doc.ownerDocument;
        }
        switch (type) {
          case 1:
            if (typeof data.tagName === "string") {
                return doc.createElement(data.tagName);
            }
            return false;

          case 3:
            if (typeof data.nodeValue === "string" && data.nodeValue.length) {
                return doc.createTextNode(data.nodeValue);
            }
            return doc.createTextNode("");

          case 7:
            if (data.hasOwnProperty("target") && data.hasOwnProperty("data")) {
                return doc.createProcessingInstruction(data.target, data.data);
            }
            return false;

          case 8:
            if (typeof data.nodeValue === "string") {
                return doc.createComment(data.nodeValue);
            }
            return doc.createComment("");

          case 9:
            return doc.implementation.createHTMLDocument(data);

          case 11:
            return doc;

          default:
            return false;
        }
    };
}

export default DOMHelper;