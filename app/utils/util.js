import {IonicApp, NavController, Alert} from 'ionic-angular';
import {HTTP_PROVIDERS, Http, Headers, RequestOptions, RequestMethod} from 'angular2/http';

import {SSO} from './sso';
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
    
    callCordysWebserviceUseAnonymous(request) {
        let useAnonymous = true;
        return this.callCordysWebservice(request, useAnonymous);
    }

    callCordysWebservice(request, useAnonymous) {
        if (!useAnonymous) {
            // If there is not a saml artifact in cookie, then redirect to Login page.
            let sso = new SSO(this, this.app.config);
            if (!sso.loggedOn()) {
                // redirect to Login page.
                this.app.redirectLoginPage();
                return;
            }
        }
        return new Promise((resolve, reject) => {
            let url = this.app.config.get("BASE_URL") + this.app.config.get("GATEWAY_URL");
            if (!useAnonymous) {
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
                    let responseText = error.text();
                    let responseNode = this.parseXml(responseText);
                    let faultstring = this.getNodeText(responseNode, ".//*[local-name()='faultstring']");
                    this.app.translate.get(["app.message.error.title", "app.action.ok"]).subscribe(message => {
                        let title = message['app.message.error.title'];
                        let ok = message['app.action.ok'];

                        let alert = Alert.create({
                            title: title,
                            subTitle: faultstring,
                            buttons: [ok]
                        });
                        this.nav.present(alert);
                    });

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
        return CookieUtil.remove(name, path);
    }

    hasCookie(name) {
        return CookieUtil.has(name);
    }
    
    transferCordysDateStringToUTC(dateString) {
        return DateUtil.transferCordysDateStringToUTC(dateString);
    }

    getUTCDate() {
        return DateUtil.getUTCDate();
    }

    getUserAvatarUrlByUserId(userId) {
        return this.app.config.get("USER_AVATAR_IMAGE_URL") + userId;
    }

    getUserIdFromAuthUserDn(authUserDn) {
        var position = authUserDn.indexOf(",cn=");
        let userId = "";
        if (position > 0) {
            userId = authUserDn.substring(3, position);
        }
        return userId;
    }

    transferDateToKindsOfStyles(date) {
        return DateUtil.transferDateToKindsOfStyles(date, this.app);
    }
    
    /**
     * Html Tag を転換する
     */
    replaceHtmlTagCharacter(content) {
        content = content.replace(/&/g, "&amp;");
        content = content.replace(/</g, "&lt;");
        content = content.replace(/>/g, "&gt;");
        content = content.replace(/\n/g,"<br />");
        
        return content;
    }
    
    /**
     * 半角スペース、全角スペース、改行を削除する
     */
    deleteEmSpaceEnSpaceNewLineInCharacter(content) {
        content = content.replace(/\n/g, "");
        content = content.replace(/\s+/g, "");
        
        return content;
    }
}