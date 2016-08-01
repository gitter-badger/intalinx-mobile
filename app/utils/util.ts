// Third party library.
import {Injectable} from '@angular/core';
import {HTTP_PROVIDERS, Http, Headers, RequestOptions, RequestMethod} from '@angular/http';
import {TranslateService} from 'ng2-translate/ng2-translate';
import * as moment from 'moment';
import 'moment/locale/ja';
import 'moment/locale/zh-cn';
import {Config, Alert} from 'ionic-angular';

// Config.
import {AppConfig} from '../appconfig';

// Utils.
import {AlertUtil} from './alertutil';
import {CordysUtil} from './cordysutil';
import {XmlUtil} from './xmlutil';
import {DateUtil} from './dateutil';
import {StorageUtil} from './storageutil';

// Services.
import {ShareService} from '../providers/share-service';

@Injectable()
export class Util {

    constructor(private http: Http, private translate: TranslateService, private appConfig: AppConfig, private cordysUtil: CordysUtil, private dateUtil: DateUtil, private xmlUtil: XmlUtil, private storageUtil: StorageUtil, private alertUtil: AlertUtil, private share: ShareService) {
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

    setNodeText(node: any, xpath: string, value: any, namespaces?: string) {
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

    setXMLAttribute(elementNode: any, attributeNamespace: string, attributeName: string, attributeValue: any) {
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
        return this.cordysUtil.callCordysWebserviceUseAnonymous(request);
    }

    callCordysWebserviceUseAnonymousShowError(request: any, useAnonymous: boolean) {
        return this.cordysUtil.callCordysWebserviceUseAnonymousShowError(request, useAnonymous);
    }

    callCordysWebservice(request: any, hideError?: boolean, useAnonymous?: boolean) {
        return this.cordysUtil.callCordysWebservice(request, hideError, useAnonymous);
    }

    getCallCordysWebserviceURL(useAnonymous?: boolean) {
        return this.cordysUtil.getCallCordysWebserviceURL(useAnonymous);
    }

    callCordysWebserviceWithUrl(url, request) {
        return this.cordysUtil.callCordysWebserviceWithUrl(url, request);
    }

    getRequestXml(url: string) {
        return this.cordysUtil.getRequestXml(url);
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

    presentModal(content: string, level?: string) {
        return this.alertUtil.presentModal(content, level);
    }

    presentSystemErrorModal() {
        return this.alertUtil.presentSystemErrorModal();
    }

    authenticate(userId, password) {
        return this.cordysUtil.authenticate(userId, password);
    }

    loggedOn(): Promise<boolean> {
        return this.cordysUtil.loggedOn();
    }

    logout() {
        return this.cordysUtil.logout();
    }

    enableAutoLogin(loginID, password, server) {
        return this.cordysUtil.enableAutoLogin(loginID, password, server);
    }

    disableAutoLogin() {
        return this.cordysUtil.disableAutoLogin();
    }

    isAutoLogin() {
        return this.cordysUtil.isAutoLogin();
    }

    setLoginID(value) {
        return this.cordysUtil.setLoginID(value);
    }

    setPassword(value) {
        return this.cordysUtil.setPassword(value);
    }

    setServer(value) {
        return this.cordysUtil.setServer(value);
    }

    getLoginID() {
        return this.cordysUtil.getLoginID();
    }

    getPassword() {
        return this.cordysUtil.getPassword();
    }

    getServer() {
        return this.cordysUtil.getServer();
    }

    removeLoginID() {
        return this.cordysUtil.removeLoginID();
    }

    removePassword() {
        return this.cordysUtil.removePassword();
    }

    removeServer() {
        return this.cordysUtil.removeServer();
    }

    setSAMLart(value, notOnOrAfter) {
        return this.cordysUtil.setSAMLart(value, notOnOrAfter);
    }

    getSAMLart(): Promise<string> {
        return this.cordysUtil.getSAMLart();
    }

    getSAMLartExpireDate(): Promise<any> {
        return this.cordysUtil.getSAMLartExpireDate();
    }

    removeSAMLart(): Promise<boolean> {
        return this.cordysUtil.removeSAMLart();
    }

    hasSAMLart(): Promise<boolean> {
        return this.cordysUtil.hasSAMLart();
    }
}