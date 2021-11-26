import Layout from "../entities/Layout";
import DOMHelper from "./DOMHelper";

export default class Helper {
    static isMobile() {
        var check = false;
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    static merge(arr1, arr2) {
        if (!arr1 && !arr2) return [];
        if (!arr1 || arr1.length === 0) return arr2
        if (!arr2 || arr2.length === 0) return arr1;

        arr2.forEach(item => arr1.push(item));
        return arr1;
    }

    static getCookie(cookieName) {
        return document.cookie.match("(^|;)\\s*" + cookieName + "\\s*=\\s*([^;]+)")?.pop() || "";
    }

    static setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";Path=/";
    }

    static removeCookie(cname) {
        document.cookie = cname + "=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/";
    }

    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static getItemStateInViewport(element) {
        if (!element) {
            return { leftOut: false, rightOut: false, topOut: false, bottomOut: false }
        }
        const { top, left, bottom, right } = element.getBoundingClientRect();
        const { wHeight, wWidth } = {
            wWidth: window.innerWidth || document.documentElement.clientWidth,
            wHeight: window.innerHeight || document.documentElement.clientHeight
        }
        return { leftOut: left < 0, rightOut: right > wWidth, topOut: top < 0, bottomOut: bottom > wHeight };
    }

    static calculateLayout(layoutOrder, previousLayout) {
        previousLayout = previousLayout || 30;
        const previousLayoutIndex = Layout.LAYOUT_VALS.findIndex(val => val === previousLayout);
        let layoutValue;
        if (layoutOrder === Layout.SHRINK) {
            layoutValue = Layout.LAYOUT_VALS[previousLayoutIndex === 0 ? previousLayoutIndex : previousLayoutIndex - 1];
        } else if (layoutOrder === Layout.EXPAND) {
            layoutValue = Layout.LAYOUT_VALS[previousLayoutIndex === Layout.LAYOUT_VALS.length - 1 ? previousLayoutIndex : previousLayoutIndex + 1];
        }
        return layoutValue;
    }

    static getItemPositionRespectiveToParent(tooltip, itemRect) {
        if (!tooltip) {
            return { leftOut: false, rightOut: false, topOut: false, bottomOut: false }
        }
        const { top: parentTop, left: parentLeft, bottom: parentBottom, right: parentRight, height: parentHeight,
            width: parentWidth } = itemRect;
        const {height: itemHeight, width: itemWidth} = tooltip.getBoundingClientRect();
        const { wHeight, wWidth } = {
            wWidth: window.innerWidth || document.documentElement.clientWidth,
            wHeight: window.innerHeight || document.documentElement.clientHeight
        }
        const maxLeft = parentLeft - itemWidth;
        const maxRight = parentRight + itemWidth;
        const maxTop = parentTop - itemHeight;
        const maxBottom = parentBottom + itemHeight;
        return { maxLeft, maxRight, maxTop, maxBottom, parentTop, parentRight, parentBottom, parentLeft, parentHeight,
            parentWidth, itemHeight, itemWidth, leftOut: maxLeft < 0, rightOut: maxRight > wWidth, topOut: maxTop < 0,
            bottomOut: maxBottom > wHeight };
    }
    
    static getItemPosition(tooltip, itemRect, prefer) {
        if (itemRect) {
            const { parentTop, parentRight, parentBottom, parentLeft, parentHeight, parentWidth, itemHeight,
                itemWidth, leftOut, topOut, rightOut, bottomOut } = Helper.getItemPositionRespectiveToParent(tooltip, itemRect);
            // leftOut: maxLeft < 0, rightOut: maxRight > wWidth, topOut: maxTop < 0, bottomOut: maxBottom > wHeight
            const meta = { parentTop, parentRight, parentBottom, parentLeft, parentHeight, parentWidth, itemHeight, itemWidth, rightOut, bottomOut, leftOut, topOut};
                // marginLeft = rightOut ? "-10rem" : 0;
            const styles = {};
            if (!leftOut) {
                styles.left = parentLeft;
                if (!bottomOut) {
                    styles.top = parentTop;
                } else {
                    styles.top = parentTop - itemHeight;
                }
            } else {
                styles.left = parentLeft - itemWidth;
                if (!bottomOut) {
                    styles.top = parentTop;
                } else {
                    styles.top = parentTop - itemHeight;
                }
            }
            return { styles, meta };
        }
    }

    static extend (target) {
        if (!arguments.length) {
            return arguments[0] || {};
        }
        for (var p in arguments[1]) {
            target[p] = arguments[1][p];
        }
        if (arguments.length > 2) {
            var moreArgs = [ target ].concat(Array.prototype.slice.call(arguments, 2));
            return Helper.extend.apply(null, moreArgs);
        } else {
            return target;
        }
    }

    static unique () {
        if (!arguments.length) {
            return [];
        }
        var all = Array.prototype.concat.apply([], arguments);
        for (var a = 0; a < all.length; a++) {
            if (all.indexOf(all[a]) < a) {
                all.splice(a, 1);
                a--;
            }
        }
        return all;
    }

    static copy (item) {
        if (item instanceof Array) {
            return item.slice();
        } else {
            var output = {};
            for (var i in item) {
                output[i] = item[i];
            }
            return output;
        }
    }

    static copyJSON (node, opts) {
        var copy = {};
        for (var n in node) {
            if (typeof node[n] !== "undefined" && typeof node[n] !== "function" && n.charAt(0).toLowerCase() === n.charAt(0)) {
                if (typeof node[n] !== "object" || node[n] instanceof Array) {
                    if (opts.cull) {
                        if (node[n] || node[n] === 0 || node[n] === false) {
                            copy[n] = node[n];
                        }
                    } else {
                        copy[n] = node[n];
                    }
                }
            }
        }
        copy = DOMHelper.boolFilter(copy, opts.domProperties);
        return copy;
    };

    static recurse (recursivepatharr, key, value, tree, parent, j, searchIndex) {
        let returnVal;
        if (tree) {
            if (tree.length) {  // List of components
                const list = tree;
                for (let i = 0; i < list.length; i++) {
                    let currentNode = list[i];  // Root Component first
                    returnVal = Helper.recurse(recursivepatharr, key, value, currentNode, list, j, searchIndex);
                    if (returnVal) {
                        return returnVal;
                    }
                }
            } else {
                if ((searchIndex && j === searchIndex) || (j === 0 || j === recursivepatharr.length)) {
                    if (value) {
                        if (tree[key] && (tree[key] === value)) {
                            return {selectedComponentConfig: tree, parent};
                        }
                    } else {
                        if (tree[key]) {
                            return {selectedComponentConfig: tree[key], parent};
                        }
                    }
                }
                j = j === recursivepatharr.length ? 0 : j;
                const nextnode = tree[recursivepatharr[j]]
                return Helper.recurse(recursivepatharr, key, value, nextnode, tree, j + 1, searchIndex);
            }
        }
        return returnVal;
    }

    static searchInTree (key, value, tree, rootpath, recursivepath, searchIndex) {
        if (!key || !tree) return {};
        let returnVal;
        let hasMore = false, parent = tree;
        try {
            const rootpatharr = rootpath && rootpath.split(".");
            const recursivepatharr = recursivepath && recursivepath.split(".");
            if (rootpatharr) {
                for (let i = 0; i < rootpatharr.length; i++) {
                    const pathStop = rootpatharr[i];
                    if (i < rootpatharr.length || recursivepath) {
                        hasMore = true;
                    }
                    if (tree.length) {
                        for (let i = 0; i < tree.length; i++) {
                            const node = tree[i];
                            let currentNode = node[pathStop];
                            if (currentNode) {
                                if (!hasMore) {
                                    if (value) {
                                        if (currentNode[key] === value) {
                                            returnVal = currentNode;
                                        }
                                    } else {
                                        if (currentNode[key]) {
                                            returnVal = currentNode[key];
                                        }
                                    }
                                } else {
                                    currentNode = currentNode[pathStop];
                                }
                            }
                        }
                    } else {
                        if (!hasMore) {
                            if (tree[key]) {
                                returnVal = tree[key];
                            }
                        } else {
                            tree = tree[pathStop];
                        }
                    }
                }
            }
            if (recursivepatharr) {
                returnVal = Helper.recurse(recursivepatharr, key, value, tree, parent, 0, searchIndex)
            }
        } catch (e) {
            console.log(e);
        }
        
        return returnVal;
    }

    static filterEach(arr, filterKeys) {
        if (!arr || arr.length === 0 || !filterKeys || filterKeys.length === 0) return arr;
        return arr.map(item => {
            item.items && (item.items = Helper.filterEach(item.items, filterKeys));
            return Helper.filterObject(item, filterKeys)
        });
    }

    static filterObject(obj, removeArr, disableArr) {
        if (!obj || ((!removeArr || removeArr.length === 0) && (!disableArr || disableArr.length === 0)))
            return obj;
        const objClone = {...obj};
        removeArr && removeArr.forEach(key => delete objClone[key]);
        disableArr && disableArr.forEach(key => obj[key] && typeof obj[key] === "object" && (obj[key].alwaysDisabled = true));
        return objClone;
    }

    static findMaxHyphenBased(obj, incoming) {
        const maxInstance = Object.keys(obj).reduce((accInstance, currentInstance) => {
            if (currentInstance.indexOf(incoming) > -1) {
                const index = currentInstance.substring(currentInstance.indexOf("-") + 1);
                return index > accInstance ? index : accInstance;
            }
            return accInstance;
        }, -1)
        return maxInstance;
    }

    static getDefaultKey(key) {
        return key && `default${key.length === 1 ? key.toUpperCase() : key.substring(0, 1).toUpperCase() + key.substring(1)}`;
    }
}