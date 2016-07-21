// Third party library.
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

// Config.
import {AppConfig} from '../appconfig';

// Utils.
import {AlertUtil} from './alertutil';
import {DateUtil} from './dateutil';
import {XmlUtil} from './xmlutil';
import {StorageUtil} from './storageutil';

// Services.
import {ShareService} from '../providers/share-service';

@Injectable()
export class CordysUtil {
    constants: any = {
        GATEWAY_URL: 'com.eibus.web.soap.Gateway.wcp',
        PRE_LOGIN_INFO_URL: 'com.eibus.sso.web.authentication.PreLoginInfo.wcp',
        SAMLART_NAME: 'SAMLart',
        CLIENT_ATTRIBUTES_SCHEMA_NAMESPACE: 'http://schemas.cordys.com/General/ClientAttributes/',
        SOAP_NAMESPACE: 'http://schemas.xmlsoap.org/soap/envelope/',
        I18N_NAMESPACE: 'http://www.w3.org/2005/09/ws-i18n',
        CORDSY_NAMESPACE: 'http://schemas.cordys.com/General/1.0/',
        WSSE_NAMESPACE: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
        WSU_NAMESPACE: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd',
        SAMLPROTOCOL_NAMESPACE: 'urn:oasis:names:tc:SAML:1.0:protocol',
        SAML_NAMESPACE: 'urn:oasis:names:tc:SAML:1.0:assertion'
    };

    constructor(private http: Http, private appConfig: AppConfig, private xmlUtil: XmlUtil, private alertUtil: AlertUtil, private dateUtil: DateUtil, private storageUtil: StorageUtil, private share: ShareService) {
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

    callCordysWebserviceUseAnonymous(request: any) {
        let useAnonymous = true;
        return this.callCordysWebserviceUseAnonymousShowError(request, useAnonymous);
    }

    callCordysWebserviceUseAnonymousShowError(request: any, useAnonymous: boolean) {
        let hideError = false;
        return this.callCordysWebservice(request, hideError, useAnonymous);
    }

    callCordysWebservice(request: any, hideError?: boolean, useAnonymous?: boolean) {
        if (!useAnonymous) {
            // If there is not a saml artifact in cookie, then redirect to Login page.
            if (!this.loggedOn()) {
                // redirect to Login page.
                this.share.redirectLoginPage();
                // TODO
                return;
            }
        }
        return new Promise((resolve, reject) => {
            this.getCallCordysWebserviceURL(useAnonymous).then((url: string) => {
                this.http.post(url, request)
                    .map(res => res.text())
                    .subscribe(data => {
                        resolve(data);
                    }, error => {
                        if (error.status === '500' && error.type === '2') {
                            if (!hideError) {
                                let responseText = error.text();
                                let responseNode = this.xmlUtil.parseXML(responseText);
                                this.alertUtil.presentModal(this.xmlUtil.getNodeText(responseNode, './/*[local-name()=\'faultstring\']'));
                            }
                        } else {
                            this.alertUtil.presentSystemErrorModal();
                        }
                        reject(error);
                    });
            });
        });
    }

    callCordysWebserviceWithUrl(url, request) {
        return new Promise(resolve => {
            this.http.post(url, request)
                .map(res => res.text())
                .subscribe(data => {
                    resolve(data);
                }, error => {
                    
                });
        });
    }

    getCallCordysWebserviceURL(useAnonymous?: boolean) {
        let url = this.appConfig.get('BASE_URL') + this.appConfig.get('GATEWAY_URL');
        if (!useAnonymous) {
            return this.getSAMLart().then((samlart: string) => {
                url = url + '?' + this.appConfig.get('SAMLART_NAME') + '=' + samlart;
                url = url + '&language=' + this.appConfig.get('USER_LANG');
                return url;
            }) ;    
        } else {
            url = url + '?language=' + this.appConfig.get('USER_LANG');
            return Promise.resolve(url);
        }
    }

    authenticate(userId, password) {
        if (!userId || !password) {
            return Promise.resolve(false);
        } else {
            return new Promise(resolve => {
                this.getRequestXml('./assets/requests/saml_assertion_request.xml').then((req: string) => {

                    let samlRequest = this.xmlUtil.parseXML(req);
                    this.xmlUtil.setXMLNamespaces(samlRequest, {
                        'SOAP': this.constants.SOAP_NAMESPACE,
                        'wsse': this.constants.WSSE_NAMESPACE,
                        'wsu': this.constants.WSU_NAMESPACE,
                        'samlp': this.constants.SAMLPROTOCOL_NAMESPACE,
                        'saml': this.constants.SAML_NAMESPACE
                    });

                    let createRequestID = function() {
                        // wdk XXX: use guid generator?
                        let gid = 'a'; // XML validation requires that the request ID does not start with a number
                        for (let i = 0; i < 32; i++) {
                            gid += Math.floor(Math.random() * 0xF).toString(0xF) + (i === 8 || i === 12 || i === 16 || i === 20 ? '-' : '');
                        }
                        return gid;
                    };

                    // set RequestID, IssueInstant and NameIdentifier
                    this.xmlUtil.selectXMLNode(samlRequest, 'SOAP:Envelope/SOAP:Body/samlp:Request').setAttribute('RequestID', createRequestID());
                    this.xmlUtil.selectXMLNode(samlRequest, 'SOAP:Envelope/SOAP:Body/samlp:Request').setAttribute('IssueInstant', this.dateUtil.getUTCDate());
                    this.xmlUtil.setNodeText(samlRequest, './/saml:NameIdentifier', userId);

                    // Remove security node if no wsse username is used 
                    let headerNode = this.xmlUtil.selectXMLNode(samlRequest, 'SOAP:Envelope/SOAP:Header');
                    let securityNode = this.xmlUtil.selectXMLNode(samlRequest, './/wsse:Security');
                    if (password == null) password = '';

                    this.xmlUtil.setNodeText(samlRequest, './/wsse:Username', userId);
                    this.xmlUtil.setNodeText(samlRequest, './/wsse:Password', password);

                    req = this.xmlUtil.xml2string(samlRequest);

                    this.callCordysWebserviceUseAnonymous(req).then((data: string) => {
                        let samlResponse = this.xmlUtil.parseXML(data);
                        this.xmlUtil.setXMLNamespaces(samlResponse, {
                            'SOAP': this.constants.SOAP_NAMESPACE,
                            'wsse': this.constants.WSSE_NAMESPACE,
                            'wsu': this.constants.WSU_NAMESPACE,
                            'samlp': this.constants.SAMLPROTOCOL_NAMESPACE,
                            'saml': this.constants.SAML_NAMESPACE
                        });

                        let assertions = this.xmlUtil.selectXMLNode(samlResponse, './/saml:Assertion');
                        let authenticationResult = false;
                        if (assertions != null) {
                            let samlArtifact = this.xmlUtil.getNodeText(samlResponse, './/samlp:AssertionArtifact', null);
                            if (samlArtifact) {
                                let notOnOrAfterString = this.xmlUtil.getNodeText(samlResponse, './/saml:Conditions/@NotOnOrAfter', null);
                                if (notOnOrAfterString) {
                                    let notOnOrAfterDate = this.dateUtil.transferCordysDateStringToUTC(notOnOrAfterString);
                                    this.setSAMLart(samlArtifact, notOnOrAfterDate);
                                    authenticationResult = true;    
                                }
                                /*
                                if (sso.useSamlUrlArtifact){
                                    system.parameters[SAMLART_NAME] = artifact;
                                }
                                */
                            }
                        }
                        resolve(authenticationResult);
                    });
                });
            });
        }
    }

    loggedOn(): Promise<boolean> {
        return this.getSAMLart().then((samlart: string) => {
            let isLoggedOn = false;
            isLoggedOn = samlart != null && samlart !== '';
            if (!isLoggedOn) {
                this.isAutoLogin().then((isAutoLogin: boolean) => {
                    if (isAutoLogin) {
                        Promise.all([this.getLoginID(), this.getPassword()]).then((values: any) => {
                            return this.authenticate(values[0], values[1]);
                        });
                    }
                });
            }
            return isLoggedOn;
        });
    }

    logout() {
        return Promise.all([
            this.disableAutoLogin(),
            this.removeLoginID(),
            this.removePassword(),
            this.removeSAMLart(),
        ]);
    }

    enableAutoLogin() {
        return this.storageUtil.set(this.appConfig.get('AUTO_LOGIN_STORAGE_NAME'), true);
    }

    disableAutoLogin() {
        return this.storageUtil.remove(this.appConfig.get('AUTO_LOGIN_STORAGE_NAME'));
    }

    isAutoLogin() {
        return this.storageUtil.get(this.appConfig.get('AUTO_LOGIN_STORAGE_NAME'));
    }

    setLoginID(value) {
        return this.storageUtil.set(this.appConfig.get('LOGIN_ID_STORAGE_NAME'), value);
    }

    setPassword(value) {
        return this.storageUtil.set(this.appConfig.get('PASSWORD_STORAGE_NAME'), value);
    }

    getLoginID() {
        return this.storageUtil.get(this.appConfig.get('LOGIN_ID_STORAGE_NAME'));
    }

    getPassword() {
        return this.storageUtil.get(this.appConfig.get('PASSWORD_STORAGE_NAME'));
    }

    removeLoginID() {
        return this.storageUtil.remove(this.appConfig.get('LOGIN_ID_STORAGE_NAME'));
    }

    removePassword() {
        return this.storageUtil.remove(this.appConfig.get('PASSWORD_STORAGE_NAME'));
    }

    setSAMLart(value, notOnOrAfter) {
        return new Promise(resolve => {
            let p1 = this.storageUtil.set(this.appConfig.get('SAML_ARTIFACT_STORAGE_NAME'), value);
            let p2 = this.storageUtil.set(this.appConfig.get('SAML_NOT_ON_AFTER_STORAGE_NAME'), notOnOrAfter);
            resolve(Promise.all([p1, p2]));
        });
    }

    getSAMLart(): Promise<string> {
        return this.hasSAMLart().then((result: boolean) => {
            if (result) {
                return this.storageUtil.get(this.appConfig.get('SAML_ARTIFACT_STORAGE_NAME')).then((samlArtifact: any) => {
                    return String(samlArtifact);
                });
            } else {
                return null;
            }
        });
    }

    getSAMLartExpireDate(): Promise<any> {
        return this.storageUtil.get(this.appConfig.get('SAML_NOT_ON_AFTER_STORAGE_NAME'));
    }

    removeSAMLart(): Promise<boolean> {
        let p1 = this.storageUtil.remove(this.appConfig.get('SAML_ARTIFACT_STORAGE_NAME'));
        let p2 = this.storageUtil.remove(this.appConfig.get('SAML_NOT_ON_AFTER_STORAGE_NAME'));
        return Promise.all([p1, p2]).then(() => {
            return true;
        });
    }

    hasSAMLart(): Promise<boolean> {
        return this.getSAMLartExpireDate().then((expireDate: any) => {
                if (!expireDate || new Date(expireDate) < new Date()) {
                    this.removeSAMLart();
                    return false;
                } else {
                    return true;
                }
            });
    }
}