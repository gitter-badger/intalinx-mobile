export class XmlUtil {
    constructor() {

    }
    
    static getBrowser() {
        var ua = window.navigator.userAgent.toLowerCase();
        var ver = window.navigator.appVersion.toLowerCase();
        var name = 'unknown';

        if (ua.indexOf("msie") != -1) {
            if (ver.indexOf("msie 6.") != -1) {
                name = 'ie6';
            } else if (ver.indexOf("msie 7.") != -1) {
                name = 'ie7';
            } else if (ver.indexOf("msie 8.") != -1) {
                name = 'ie8';
            } else if (ver.indexOf("msie 9.") != -1) {
                name = 'ie9';
            } else if (ver.indexOf("msie 10.") != -1) {
                name = 'ie10';
            } else {
                name = 'ie';
            }
        } else if (ua.indexOf('trident/7') != -1) {
            name = 'ie11';
        } else if (ua.indexOf('chrome') != -1) {
            name = 'chrome';
        } else if (ua.indexOf('safari') != -1) {
            name = 'safari';
        } else if (ua.indexOf('opera') != -1) {
            name = 'opera';
        } else if (ua.indexOf('firefox') != -1) {
            name = 'firefox';
        }
        return name;
    }
    
    static isIE() {
        return XmlUtil.getBrowser().indexOf("ie") >= 0;
    }
    
    static isWebKit() {
        var ua = window.navigator.userAgent;
        return ua.indexOf("AppleWebKit") >= 0;
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
    
    static xml2string(xml) {
        return new XMLSerializer().serializeToString(xml);
    }
    
    static createNSResolver(xmlDocument) {
		if (xmlDocument.__namespaces) {
			return function(prefix) {
				return xmlDocument.__namespaces[prefix] || null;
			}
		}
		return null;
	}
    
	static createElementNS(xmlDocument, namespaceURI, qualifiedName) {
		if (XmlUtil.isIE()) {
			return xmlDocument.createNode(1, qualifiedName, namespaceURI); //NOMBV
		} else if (XmlUtil.isWebKit()) {
			var elementNode = xmlDocument.createElementNS(namespaceURI, qualifiedName);
			// There is a bug in webkit, that after createElementNS is done with xmlns="", then 
			// the xmlns attribute is not visible anymore while doing cordys.getXML.
			// See http://code.google.com/p/chromium/issues/detail?id=27598 for more details.
			if (!namespaceURI) {
				var namespaceAttr = xmlDocument.createAttribute("xmlns");
				namespaceAttr.value = "";
				elementNode.attributes.setNamedItem(namespaceAttr);
			}
			return elementNode;
		} else {
			return xmlDocument.createElementNS(namespaceURI, qualifiedName);
		}
	}
    
	static getNodeText(node, xpath, defaultValue, namespaces) {
		if (node && (node = XmlUtil.selectXMLNode(node, xpath, namespaces))) {
			return (XmlUtil.getTextContent(node) || defaultValue);
		}
		return defaultValue;
	}
    
	static setNodeText(node, xpath, value, namespaces) {
		if (node && (node = XmlUtil.selectXMLNode(node, xpath, namespaces))) {
			XmlUtil.setTextContent(node, value);
			return true;
		}
		return false;
	}
    
	static setTextContent(node, textContent) {
		if (typeof(node) == 'object') {
			textContent = textContent != null ? textContent : "";
			var property = 'textContent' in node ? "textContent" : (node.uniqueID ? "innerText" : "text");
			node[property] = textContent;
		}
	}
	static getTextContent(node) {
		if (typeof(node) == 'object') {
			var text = 'textContent' in node ? node.textContent : (node.uniqueID ? node.innerText : node.text); //NOMBV(2)
		}
		return text ? text : "";
	}
	static setXMLNamespaces(object, namespaces) {
		if (XmlUtil.isIE()) {
			var xmlDocument = (object.ownerDocument || object);
			var res = "";
			for (var prefix in namespaces) {
				if (prefix.indexOf("xml") == 0 || !namespaces[prefix]) continue;
				if (res.length > 0) res += " ";
				res += "xmlns:" + prefix + "='" + namespaces[prefix] + "'";
			}
			xmlDocument.setProperty("SelectionNamespaces", res); //NOMBV
		} else {
			var xmlDocument = (object.ownerDocument || object);
			xmlDocument.__namespaces = namespaces;
		}
	}
	static getXMLNamespaces(object) {
		if (XmlUtil.isIE()) {
			var xmlDocument = (object.ownerDocument || object);
			var documentNamespaces = xmlDocument.getProperty("SelectionNamespaces"); //NOMBV
			if (documentNamespaces) {
				//Checking the space after ' of namespace only
				documentNamespaces = documentNamespaces.replace(/\bxmlns:([^\s]*)\b/g, "$1").split("' ");
				var namespaces = {};
				for (var i = 0, length = documentNamespaces.length; i < length; i++) {
					var xmlns = documentNamespaces[i].split("=");
					if (!xmlns[0] || !xmlns[1]) continue;
					var ns = xmlns[1];
					var endIndex = (i == documentNamespaces.length - 1) ? ns.length - 1 : ns.length;
					namespaces[xmlns[0]] = ns.slice(1, endIndex);
				}
				return namespaces;
			}
			return null;
		} else {
			var xmlDocument = (object.ownerDocument || object);
			return (xmlDocument.__namespaces || null);
		}
	}
	static appendXMLNode(fromNode, toNode) {
		if (XmlUtil.isIE()) {
			return toNode.appendChild(fromNode); //NOMBV
		} else {
			var toNodeDocument = toNode.ownerDocument || toNode;
			if (fromNode.ownerDocument != toNodeDocument) {
				fromNode = toNodeDocument.adoptNode(fromNode);
			}
			var toNodeDocFragment = toNodeDocument.createDocumentFragment();
			var newNode = toNodeDocFragment.appendChild(fromNode); //NOMBV
			toNode.appendChild(toNodeDocFragment); //NOMBV
			return newNode;
		}
	}
    
	static selectXMLNode(object, xpathExpression, namespaces) {
		if (XmlUtil.isIE()) {
			try {
				var xmlDocument = (object.ownerDocument || object);
				var isXSLPattern = (xmlDocument.getProperty("SelectionLanguage") === "XSLPattern");
				if (isXSLPattern) {
					xmlDocument.setProperty("SelectionLanguage", "XPath");
				}
				if (namespaces) {
					var savedNamespaces = xmlDocument.getProperty("SelectionNamespaces"); //NOMBV
					XmlUtil.setXMLNamespaces(xmlDocument, namespaces);
				}
				var result = object.selectSingleNode(xpathExpression); //NOMBV
				if (namespaces) {
					xmlDocument.setProperty("SelectionNamespaces", savedNamespaces); //NOMBV
				}
				if (isXSLPattern) {
					xmlDocument.setProperty("SelectionLanguage", "XSLPattern");
				}
				return result;
			} catch (e) {}
		} else {
			try {
				var xmlDocument = (object.ownerDocument || object);
				if (namespaces) {
					var savedNamespaces = (xmlDocument.__namespaces || null);
					xmlDocument.__namespaces = namespaces;
				}
				var result = xmlDocument.evaluate(xpathExpression, object, XmlUtil.createNSResolver(xmlDocument),
					XPathResult.FIRST_ORDERED_NODE_TYPE, null);
				if (namespaces) {
					xmlDocument.__namespaces = savedNamespaces;
				}
				if (result) return result.singleNodeValue;
				return null;
			} catch (e) {
				//var t_error = translate("selectXMLNode: expression ' {0} ' cannot be evaluated.");
				//throw CordysRoot.Localization.makeCompositeText(t_error, xpathExpression) + e.message;
			}
		}
	}
    
	static selectXMLNodes(object, xpathExpression, namespaces) {
		if (XmlUtil.isIE()) {
			try {
				var xmlDocument = (object.ownerDocument || object);
				var isXSLPattern = (xmlDocument.getProperty("SelectionLanguage") === "XSLPattern");
				if (isXSLPattern) {
					xmlDocument.setProperty("SelectionLanguage", "XPath");
				}
				if (namespaces) {
					var savedNamespaces = xmlDocument.getProperty("SelectionNamespaces"); //NOMBV
					XmlUtil.setXMLNamespaces(xmlDocument, namespaces);
				}
				var result = object.selectNodes(xpathExpression); //NOMBV
				if (namespaces) {
					xmlDocument.setProperty("SelectionNamespaces", savedNamespaces); //NOMBV
				}
				if (isXSLPattern) {
					xmlDocument.setProperty("SelectionLanguage", "XSLPattern");
				}
				return result;
			} catch (e) {}
		} else {
			try {
				// Wrapper type for the result of cordys.selectXMLNodes()
				function XMLSelectionList(context, xpathExpression) {
					this._current = 0;
					this.context = context;
					this.expr = xpathExpression;
					this.length = 0;
				}

				XMLSelectionList.prototype.item = function(i) {
					return this[i] || null;
				};
				XMLSelectionList.prototype.nextNode = function() {
					return this[this._current++] || null
				};
				XMLSelectionList.prototype.reset = function() {
					this._current = 0;
				};

				var result = new XMLSelectionList(object, xpathExpression);
				var xmlDocument = (object.ownerDocument || object);
				if (namespaces) {
					var savedNamespaces = (xmlDocument.__namespaces || null);
					xmlDocument.__namespaces = namespaces;
				}
				var nodeList = xmlDocument.evaluate(xpathExpression, object, XmlUtil.createNSResolver(xmlDocument),
					XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
				var node, nodeIndex = 0;
				if (node = nodeList.iterateNext()) {
					do {
						result[nodeIndex++] = node;
					} while (node = nodeList.iterateNext())
					result.length = nodeIndex;
				}
				if (namespaces) {
					xmlDocument.__namespaces = savedNamespaces;
				}
				return result;
			} catch (e) {
				//var t_error = translate("selectXMLNodes: expression ' {0} ' cannot be evaluated.");
				//throw CordysRoot.Localization.makeCompositeText(t_error, xpathExpression) + e.message;
			}
		}
	}
    
    static createAttributeNS(object, namespaceURI, qualifiedName) {
        var xmlDocument = (object.ownerDocument || object);
        if (XmlUtil.isIE()) {
            return xmlDocument.createNode(2, qualifiedName, namespaceURI); 
        } else {
           return xmlDocument.createAttributeNS(namespaceURI, qualifiedName);
        }
    }
    
    static getXMLAttribute(elementNode, attributeNamespace, attributeName) {
        if (XmlUtil.isIE()) {
            return elementNode.getAttributeNode(attributeName);
        } else {
            var nsPrefixIndex = attributeName.indexOf(":");
			if ( nsPrefixIndex > 0) attributeName = attributeName.substr(nsPrefixIndex+1);
			return elementNode.getAttributeNodeNS(attributeNamespace, attributeName);
        }
    }
    
    static setXMLAttribute(elementNode, attributeNamespace, attributeName, attributeValue) {
        if (XmlUtil.isIE()) {
            var attributeNode = XmlUtil.createAttributeNS(elementNode.ownerDocument, attributeNamespace, attributeName);
			attributeNode.nodeValue = attributeValue;
			return elementNode.setAttributeNode(attributeNode);
        } else if(XmlUtil.isWebKit()) {
            var attributeNode = XmlUtil.getXMLAttribute(elementNode, attributeNamespace, attributeName);
			if(attributeNode)
			{
				attributeNode.nodeValue = attributeValue;
				return attributeNode;
			}
			attributeNode = XmlUtil.createAttributeNS(elementNode.ownerDocument, attributeNamespace, attributeName);
			attributeNode.nodeValue = attributeValue;
			return elementNode.setAttributeNodeNS(attributeNode);
        } else {
            var attributeNode = XmlUtil.createAttributeNS(elementNode.ownerDocument, attributeNamespace, attributeName);
			attributeNode.nodeValue = attributeValue;
			return elementNode.setAttributeNodeNS(attributeNode);
        }
    }
    

}
