import {IonicApp, NavController, Alert} from 'ionic-angular';
import {HTTP_PROVIDERS, Http, Headers, RequestOptions, RequestMethod} from '@angular/http';

import {SSO} from './sso';
import {XmlUtil} from './xmlutil';
import {DateUtil} from './dateutil';
import {StorageUtil} from './storageutil';

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
                this.getSAMLart(this.app.config.get("SAML_ARTIFACT_STORAGE_NAME"));
                url = url + "&language=" + this.app.userLang;
            } else {
                url = url + "?language=" + this.app.userLang;
            }
            this.http.post(url, request)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    if (error.status == "500" && error.type == "2") {
                        let responseText = error.text();
                        let responseNode = this.parseXml(responseText);
                        this.changeErrorMessageOfWebservice(this.getNodeText(responseNode, ".//*[local-name()='faultstring']")).then(message => {
                            this.presentErrorModal(message);
                        });
                    } else {
                        this.presentSystemErrorModal();
                    }
                });
        });
    }   

    callCordysWebserviceWithUrl(url, request) {
        return new Promise(resolve => {
            this.http.post(url)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    this.presentSystemErrorModal();
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

    setSAMLart(key, value, notOnOrAfter) {
        StorageUtil.setSAMLart(key, value, notOnOrAfter);
    }
    
    getSAMLart(key) {
        return StorageUtil.getSAMLart(key);
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
        let usrLan = this.app.userLang;
        moment.locale(usrLan);
        return DateUtil.transferDateToKindsOfStyles(date, this.app);
    }
    
    // 通知では、公開開始時間を表示して、詳しい時間は全部午前零時からだから、詳しい時間の表示は必要ないです。
    transferDateToKindsOfStylesWithoutTime(date) {
        let usrLan = this.app.userLang;
        moment.locale(usrLan);
        return DateUtil.transferDateToKindsOfStylesWithoutTime(date, this.app);
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
    
    changeErrorMessageOfWebservice(message) {
        return new Promise(resolve => {
            if (this.app.userLang.toLowerCase() == "zh-cn") {
                if (message.indexOf("The username or password you entered is incorrect") >= 0) {
                    this.app.translate.get(["app.login.message.error.idOrPasswordNotCorrect"]).subscribe(message => {
                        resolve(message['app.login.message.error.idOrPasswordNotCorrect']);
                    });
                } else if (message.indexOf("does not match the current password") >= 0) {
                    this.app.translate.get(["app.profile.message.error.mismatchCurrentPassword"]).subscribe(message => {
                        resolve(message['app.profile.message.error.mismatchCurrentPassword']);
                    });
                }
            } else {
                resolve(message);
            }
        });
    }
    
    presentErrorModal(subTitle) {
        this.app.translate.get(["app.message.error.title", "app.action.ok"]).subscribe(message => {
            let title = message['app.message.error.title'];
            let ok = message['app.action.ok'];

            let alert = Alert.create({
                title: title,
                subTitle: subTitle,
                buttons: [ok]
            });
            this.nav.present(alert);
        });
    }
    
    presentSystemErrorModal() {
        this.app.translate.get(["app.message.error.title","app.message.error.systemError", "app.action.ok"]).subscribe(message => {
            let title = message['app.message.error.title'];
            let ok = message['app.action.ok'];
            let content = message['app.message.error.systemError'];

            let alert = Alert.create({
                title: title,
                subTitle: content,
                buttons: [ok]
            });
            this.nav.present(alert);
        });
    }
}