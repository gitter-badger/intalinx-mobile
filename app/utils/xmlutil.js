export class XmlUtil {
    constructor() {

    }
    static normalize(value, options) {
        if (!!options.normalize) {
            return (value || '').trim();
        }
        return value;
    }

    static parseXML(data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null;
        }
        try {
            if (window.DOMParser) { // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, "text/xml");
            } else { // IE
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = "false";
                xml.loadXML(data);
            }
        } catch (e) {
            xml = undefined;
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
            throw new Error("Invalid XML: " + data);
        }
        return xml;
    }

    static xml2json(xml, options) {
        // default options based on https://github.com/Leonidas-from-XIV/node-xml2js
        var defaultOptions = {
            attrkey: '$',
            charkey: '_',
            normalize: false,
            explicitArray: false
        };

        var n;

        if (!xml) {
            return xml;
        }

        options = options || {};

        for (n in defaultOptions) {
            if (defaultOptions.hasOwnProperty(n) && options[n] === undefined) {
                options[n] = defaultOptions[n];
            }
        }

        if (typeof xml === 'string') {
            xml = XmlUtil.parseXML(xml).documentElement;
        }

        var root = {};
        if (typeof xml.attributes === 'undefined' || xml.attributes === null) {
            root[xml.nodeName] = XmlUtil.xml2jsonImpl(xml, options);
        } else if (xml.attributes && xml.attributes.length === 0 && xml.childElementCount === 0) {
            root[xml.nodeName] = XmlUtil.normalize(xml.textContent, options);
        } else {
            root[xml.nodeName] = XmlUtil.xml2jsonImpl(xml, options);
        }

        return root;
    }

    static xml2jsonImpl(xml, options) {
        var i, result = {}, attrs = {}, node, child, name;
        result[options.attrkey] = attrs;

        if (xml.attributes && xml.attributes.length > 0) {
            for (i = 0; i < xml.attributes.length; i++) {
                var item = xml.attributes.item(i);
                attrs[item.nodeName] = item.value;
            }
        }

        // element content
        if (xml.childElementCount === 0) {
            result[options.charkey] = XmlUtil.normalize(xml.textContent, options);
        }

        for (i = 0; i < xml.childNodes.length; i++) {
            node = xml.childNodes[i];
            if (node.nodeType === 1) {

                if (node.attributes.length === 0 && node.childElementCount === 0) {
                    child = XmlUtil.normalize(node.textContent, options);
                } else {
                    child = XmlUtil.xml2jsonImpl(node, options);
                }

                name = node.nodeName;
                if (result.hasOwnProperty(name)) {
                    // For repeating elements, cast/promote the node to array
                    var val = result[name];
                    if (!Array.isArray(val)) {
                        val = [val];
                        result[name] = val;
                    }
                    val.push(child);
                } else if (options.explicitArray === true) {
                    result[name] = [child];
                } else {
                    result[name] = child;
                }
            }
        }

        return result;
    }

}
