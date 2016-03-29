import {IonicApp} from 'ionic-angular';
import {HTTP_PROVIDERS, Http, Headers, RequestOptions, RequestMethod} from 'angular2/http';

import {XmlUtil} from './xmlutil';
import {DateUtil} from './dateutil';
import {CookieUtil} from './cookieutil';

export class Util {
    
    static get parameters() {
        return [[Http], [IonicApp]];
    }
    
    constructor(http, app) {
        this.http = http;
        this.app = app;
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
    
    setXMLNamespaces(object, namespaces) {
        return XmlUtil.setXMLNamespaces(object, namespaces);
    }
    
    callCordysWebservice(request) {
        return new Promise(resolve => {
            let url = this.app.config.get("BASE_URL") + this.app.config.get("GATEWAY_URL") + 
                        "?" + this.app.config.get("SAMLART_NAME") + "=" +
                        this.getCookie(this.app.config.get("SAML_ARTIFACT_COOKIE_NAME"));
            this.http.post(url, request)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
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
        return has(name);
    }
    
    getUTCDate() {
		return DateUtil.getUTCDate();
	}
}