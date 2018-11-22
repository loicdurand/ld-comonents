import { h, app } from 'hyperapp'

var _id = 0
var sheet = document.head.appendChild(document.createElement("style")).sheet

function hyphenate(str) {
    return str.replace(/[A-Z]/g, "-$&").toLowerCase()
}

function insert(rule) {
    sheet.insertRule(rule, sheet.cssRules.length)
}
function createStyle(obj) {
    var id = "p" + _id++
    Array.isArray(obj) ? insert(wrap(obj, '.' + id)) : parse(obj, "." + id).forEach(insert)
    return id
}
function wrap(stringToWrap, wrapper) {
    return wrapper + "{" + stringToWrap + "}"
}

function parse(obj, classname, isInsideObj) {
    var arr = [""]
    isInsideObj = isInsideObj || 0
    for (var prop in obj) {
        var value = obj[prop]
        prop = hyphenate(prop)
        // Same as typeof value === 'object', but smaller
        if (!value.sub && !Array.isArray(value)) {
            if (/^(:|>|\.|\*)/.test(prop)) {
                prop = classname + prop
            }
            // replace & in "&:hover", "p>&"
            prop = prop.replace(/&/g, classname)
            arr.push(
                wrap(parse(value, classname, 1 && !/^@/.test(prop)).join(""), prop)
            )
        } else {
            value = Array.isArray(value) ? value : [value]
            value.forEach((value) => {
                arr[0] += prop + ":" + value + ";"
            })
        }
    }
    if (!isInsideObj) {
        arr[0] = wrap(arr[0], classname)
    }
    return arr
}

const picostyle = function (nodeName) {
    var cache = {}
    return function (decls) {
        return function (attributes, children) {
            attributes = attributes || {}
            children = attributes.children || children
            var nodeDecls = typeof decls == "function" ? decls(attributes) : decls
            var key = typeof decls == 'string' ? nodeDecls : JSON.stringify(nodeDecls)
            cache[key] || (cache[key] = createStyle(nodeDecls))
            attributes.class = [attributes.class, cache[key]]
                .filter(Boolean)
                .join(" ")
            return h(nodeName, attributes, children)
        }
    }
}

const smartify = {
    get: (target, key) => target(key)
}

export default new Proxy(picostyle, smartify);

export { h, app };
