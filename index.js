import {
    h,
    app
} from 'hyperapp'

let _id = 0;
const //
    sheet = document.head.appendChild(document.createElement("style")).sheet,
    wrap = (stringToWrap, wrapper) => wrapper + "{" + stringToWrap + "}",
    hyphenate = str => str.replace(/[A-Z]/g, "-$&").toLowerCase(),
    insert = rule => sheet.insertRule(rule, sheet.cssRules.length),
    parse = (obj, classname, isInsideObj) => {
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
    },
    createStyle = obj => {
        var id = "P" + _id++
            if (Array.isArray(obj)) {
                let // 
                    css = obj[0],
                    wrapper = "." + id,
                    selectors = /[^;]*{/g;
                if (!selectors.test(css))
                    insert(wrap(obj, wrapper));
                else {
                    let // 
                        arr = [],
                        rules = [],
                        i = 0,
                        endline = /;|}|{/g,
                        lines = css.replace(/\s+/g, ' ').replace(endline, m => m + '|').split('|'),
                        isProp = str => /.*:.*;/.test(str),
                        isSelector = str => /^(:|>|\.|\*)/.test(str),
                        isClosingBracket = str => str == '}',
                        isMediaQuery = str => /^@/.test(str);
                    lines.map(line => {
                        line = line.trim();
                        if (isProp(line)) {
                            arr.push(i++ == 0 ? wrapper + '{' + line : line);
                        } else if (isSelector(line)) {
                            arr.push('}' + wrapper + line.replace(/&/g, wrapper));
                        } else if (isClosingBracket(line)) {
                            i = 0;
                            arr.push(line);
                        } else if (isMediaQuery(line)) {
                            arr.push(line);
                        }
                    });
                    rules = arr.join('').split('}');
                    rules.pop();
                    rules.map(rule => insert(rule + '}'));
                }
            } else {
                parse(obj, "." + id).forEach(insert)
            }
        return id
    },
    picostyle = nodeName => {
        var cache = {}
        return (decls) => {
            decls = typeof decls == 'string' ? [decls] : decls
            return (attributes, children) => {
                attributes = attributes || {}
                children = attributes.children || children
                var nodeDecls = typeof decls == "function" ? decls(attributes) : decls
                var key = JSON.stringify(nodeDecls)
                cache[key] || (cache[key] = createStyle(nodeDecls))
                attributes.class = [attributes.class, cache[key]]
                    .filter(Boolean)
                    .join(" ")
                return h(nodeName, attributes, children)
            }
        }
    };

export default new Proxy(picostyle, {
    get: (target, key) => target(key)
});

export function keyframes(obj) {
    var id = "p" + _id++
        insert(wrap(parse(obj, id, 1).join(""), "@keyframes " + id))
    return id
}

export {
    h,
    app
};
