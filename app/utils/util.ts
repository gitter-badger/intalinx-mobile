import {Injectable, ReflectiveInjector} from '@angular/core';

import {App, Config, Alert} from 'ionic-angular';
import {HTTP_PROVIDERS, Http, Headers, RequestOptions, RequestMethod} from '@angular/http';
import {TranslateService} from 'ng2-translate/ng2-translate';
import * as moment from 'moment';
import 'moment/locale/ja';
import 'moment/locale/zh-cn';

import {AppConfig} from './appconfig';
import {SSO} from './sso';
import {XmlUtil} from './xmlutil';
import {DateUtil} from './dateutil';
import {StorageUtil} from './storageutil';

@Injectable()
export class Util {

    constructor(private appConfig: AppConfig, private http: Http, private translate: TranslateService, private dateUtil: DateUtil, private xmlUtil: XmlUtil) {
        let lang = this.appConfig.get('USER_LANG').toLowerCase();
        moment.locale(lang);
    }

    parseXml(s: string) {
        return this.xmlUtil.parseXML(s);
    }

    xml2json(xml: any): any {
        return this.xmlUtil.xml2json(xml);
    }

    xml2string(xml: any) {
        return this.xmlUtil.xml2string(xml);
    }

    setNodeText(node: any, xpath: string, value: string, namespaces?: string) {
        return this.xmlUtil.setNodeText(node, xpath, value, namespaces);
    }
    
    setTextContent(node: any, textContent: string) {
        return this.xmlUtil.setTextContent(node, textContent);
    }

    getNodeText(node: any, xpath: string, defaultValue?: string, namespaces?: string) {
        return this.xmlUtil.getNodeText(node, xpath, defaultValue, namespaces);
    }

    selectXMLNode(object: any, xpathExpression: string, namespaces?: string) {
        return this.xmlUtil.selectXMLNode(object, xpathExpression, namespaces);
    }

    selectXMLNodes(object: any, xpathExpression: string, namespaces?: string) {
        return this.xmlUtil.selectXMLNodes(object, xpathExpression, namespaces);
    }

    setXMLNamespaces(object: any, namespaces: any) {
        return this.xmlUtil.setXMLNamespaces(object, namespaces);
    }

    getXMLAttribute(elementNode: any, attributeNamespace: string, attributeName: string) {
        return this.xmlUtil.getXMLAttribute(elementNode, attributeNamespace, attributeName);
    }

    setXMLAttribute(elementNode: any, attributeNamespace: string, attributeName: string, attributeValue: string) {
        return this.xmlUtil.setXMLAttribute(elementNode, attributeNamespace, attributeName, attributeValue);
    }
    
    createXMLElementNS(xmlDocument: any, namespaceURI: string, qualifiedName: string) {
        return this.xmlUtil.createElementNS(xmlDocument, namespaceURI, qualifiedName);
    }
    
    createXMLElement(xmlDocument: any, namespaceURI: string, qualifiedName: string) {
        return this.xmlUtil.createElementWithNS(namespaceURI, qualifiedName);
    }

    appendXMLNode(fromNode: any, toNode: any) {
        return this.xmlUtil.appendXMLNode(fromNode, toNode);
    }

    callCordysWebserviceUseAnonymous(request: any) {
        let useAnonymous = true;
        return this.callCordysWebserviceUseAnonymousShowError(request, useAnonymous);
    }

    callCordysWebserviceUseAnonymousShowError(request: any, useAnonymous: boolean) {
        let hideError = false;
        return this.callCordysWebservice(request, useAnonymous, hideError);
    }

    callCordysWebservice(request: any, useAnonymous?: boolean, hideError?: boolean) {
        if (!useAnonymous) {
            // If there is not a saml artifact in cookie, then redirect to Login page.
            if (!this.loggedOn()) {
                // redirect to Login page.
                // this.app.redirectLoginPage();
                // TODO
                return;
            }
        }
        return new Promise((resolve, reject) => {
            let url = this.appConfig.get('BASE_URL') + this.appConfig.get('GATEWAY_URL');
            if (!useAnonymous) {
                url = url + '?' + this.appConfig.get('SAMLART_NAME') + '=' +
                    this.getSAMLart(this.appConfig.get('SAML_ARTIFACT_STORAGE_NAME'));
                url = url + '&language=' + this.appConfig.get('USER_LANG');
            } else {
                url = url + '?language=' + this.appConfig.get('USER_LANG');
            }
            this.http.post(url, request)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    if (error.status === '500' && error.type === '2') {
                        if (!hideError) {
                            let responseText = error.text();
                            let responseNode = this.parseXml(responseText);
                            this.presentModal(this.getNodeText(responseNode, './/*[local-name()=\'faultstring\']'));
                        }
                    } else {
                        this.presentSystemErrorModal();
                    }
                    reject(error);
                });
        });
    }
    
    callCordysWebserviceWithoutShowError(request, useAnonymous) {

    } 

    callCordysWebserviceWithUrl(url, request) {
        return new Promise(resolve => {
            this.http.post(url, request)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    this.presentSystemErrorModal();
                });
        });
    }

    getRequestXml(url: string) {
        return new Promise(resolve => {
            this.http.get(url)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                });

        });
    }

    setSAMLart(key: string, value: string, notOnOrAfter): void {
        StorageUtil.setSAMLart(key, value, notOnOrAfter);
    }

    getSAMLart(key: string): string {
        return StorageUtil.getSAMLart(key);
    }

    loggedOn(): Promise<boolean> {
        return new Promise(resolve => {
            let isLoggedOn = false;
            let storage =  this.getSAMLart(this.appConfig['SAML_ARTIFACT_STORAGE_NAME']);
            isLoggedOn = storage != null && storage !== '';
            return isLoggedOn;
        });
    }

    transferCordysDateStringToUTC(dateString: string) {
        return this.dateUtil.transferCordysDateStringToUTC(dateString);
    }

    getUTCDate() {
        return this.dateUtil.getUTCDate();
    }

    fromNow(date) {
        return this.dateUtil.fromNow(date);
    }

    // 通知では、公開開始時間を表示して、詳しい時間は全部午前零時からだから、詳しい時間の表示は必要ないです。
    fromNowForNotification(date) {
        return this.dateUtil.fromNowForNotification(date);
    }
    /**
     * Html Tag を転換する
     */
    replaceHtmlTagCharacter(content) {
        content = content.replace(/&/g, '&amp;');
        content = content.replace(/</g, '&lt;');
        content = content.replace(/>/g, '&gt;');
        content = content.replace(/\n/g, '<br />');
        return content;
    }

    /**
     * 半角スペース、全角スペース、改行を削除する
     */
    deleteEmSpaceEnSpaceNewLineInCharacter(content) {
        content = content.replace(/\n/g, '');
        content = content.replace(/\s+/g, '');
        return content;
    }

    changeErrorMessageOfWebservice(message): Promise<string> {
        return new Promise(resolve => {
            if (this.appConfig.get('USER_LANG').toLowerCase() === 'zh-cn') {
                if (message.indexOf('The username or password you entered is incorrect') >= 0) {
                    this.translate.get(['app.login.message.error.idOrPasswordNotCorrect']).subscribe(message => {
                        resolve(message['app.login.message.error.idOrPasswordNotCorrect']);
                    });
                } else if (message.indexOf('does not match the current password') >= 0) {
                    this.translate.get(['app.profile.message.error.mismatchCurrentPassword']).subscribe(message => {
                        resolve(message['app.profile.message.error.mismatchCurrentPassword']);
                    });
                }
            } else {
                resolve(message);
            }
        });
    }

    presentModal(content, level = 'error'): void {
        this.translate.get(['app.message.' + level + '.title', 'app.action.ok']).subscribe(message => {
            let title = message['app.message.' + level + '.title'];
            let ok = message['app.action.ok'];

            let alert = Alert.create({
                title: title,
                subTitle: content,
                buttons: [ok]
            });
            //this.nav.present(alert);
        });
    }

    presentSystemErrorModal(): void {
        this.translate.get(['app.message.error.title', 'app.message.error.systemError', 'app.action.ok']).subscribe(message => {
            let title = message['app.message.error.title'];
            let ok = message['app.action.ok'];
            let content = message['app.message.error.systemError'];

            let alert = Alert.create({
                title: title,
                subTitle: content,
                buttons: [ok]
            });
            //this.nav.present(alert);
        });
    }
}