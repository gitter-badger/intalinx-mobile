import {IonicApp, NavController, Alert} from 'ionic-angular';
import {HTTP_PROVIDERS, Http, Headers, RequestOptions, RequestMethod} from 'angular2/http';

import {XmlUtil} from './xmlutil';
import {DateUtil} from './dateutil';
import {CookieUtil} from './cookieutil';

export class Util {
    
    static get parameters() {
        return [[Http], [IonicApp], [NavController]];
    }
    
    constructor(http, app, nav) {
        this.http = http;
        this.app = app;
        this.nav = nav;
    }
    
    parseXml(s) {
        return XmlUtil.parseXML(s);
    }
    
    xml2json(xml) {
        return XmlUtil.xml2json(xml);
    }
    
    xml2string(xml) {
        return XmlUtil.xml2string(xml);
    }
    
    setNodeText(node, xpath, value, namespaces) {
        return XmlUtil.setNodeText(node, xpath, value, namespaces);
    }
    
    getNodeText(node, xpath, defaultValue, namespaces) {
        return XmlUtil.getNodeText(node, xpath, defaultValue, namespaces);
    }
    
    selectXMLNode(object, xpathExpression, namespaces) {
        return XmlUtil.selectXMLNode(object, xpathExpression, namespaces);
    }
    
    selectXMLNodes(object, xpathExpression, namespaces) {
        return XmlUtil.selectXMLNodes(object, xpathExpression, namespaces);
    }
    
    setXMLNamespaces(object, namespaces) {
        return XmlUtil.setXMLNamespaces(object, namespaces);
    }
    
    getXMLAttribute(elementNode, attributeNamespace, attributeName) {
        return XmlUtil.getXMLAttribute(elementNode, attributeNamespace, attributeName);
    }
    
    setXMLAttribute(elementNode, attributeNamespace, attributeName, attributeValue) {
        return XmlUtil.setXMLAttribute(elementNode, attributeNamespace, attributeName, attributeValue);
    }
    
    callCordysWebservice(request) {
        return new Promise(resolve => {
            let url = this.app.config.get("BASE_URL") + this.app.config.get("GATEWAY_URL");
            if (this.hasCookie(this.app.config.get("SAML_ARTIFACT_COOKIE_NAME"))) {
                url = url + "?" + this.app.config.get("SAMLART_NAME") + "=" +
                        this.getCookie(this.app.config.get("SAML_ARTIFACT_COOKIE_NAME"));
                        
                url = url + "&language=" + this.app.userLang;     
            } else {
                url = url + "?language=" + this.app.userLang;
            }   
            this.http.post(url, request)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    debugger
                    let alert = Alert.create({
                        title: 'Low battery',
                        subTitle: '10% of battery remaining',
                        buttons: ['Dismiss']
                    });
                    this.nav.present(alert);
                });
        });
    }
    
    callCordysWebserviceWithUrl(url, request) {
        return new Promise(resolve => {
            this.http.post(url)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                });
        });
    }
    
    getRequestXml(url) {
        return new Promise(resolve => {
            this.http.get(url)
                .map(res => res.text())
                .subscribe(data => {
                    
                    resolve(data);
                });
                
        });
    }
    
    setCookie(name, value, end, path, domain, secure) {
        CookieUtil.set(name, value, end, path, domain, secure);
    }
    
    getCookie(name) {
        return CookieUtil.get(name);
    }
    
    removeCookie(name, path) {
        return CookieUtil.remove(name, path) ;
    }
    
    hasCookie(name) {
        return CookieUtil.has(name);
    }
    
    getUTCDate() {
		return DateUtil.getUTCDate();
	}
}