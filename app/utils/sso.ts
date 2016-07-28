// Third party library.
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Config.
import {AppConfig} from '../appconfig';

// Utils.
import {CordysUtil} from './cordysutil';
import {XmlUtil} from './xmlutil';
import {DateUtil} from './dateutil';
import {StorageUtil} from './storageutil';

// Services.
import {ShareService} from '../providers/share-service';


@Injectable()
export class SSO {
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

    constructor(private http: Http, private translate: TranslateService, private appConfig: AppConfig, private cordysUtil: CordysUtil, private dateUtil: DateUtil, private xmlUtil: XmlUtil, private storageUtil: StorageUtil, private share: ShareService) {
        
    }

    authenticate(userId, password) {
        if (!userId || !password) {
            return Promise.resolve(false);
        } else {
            return new Promise(resolve => {
                this.cordysUtil.getRequestXml('./assets/requests/saml_assertion_request.xml').then((req: string) => {

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
                            gid += Math.floor(Math.random() * 0xF).toString(0xF) + (i == 8 || i == 12 || i == 16 || i == 20 ? "-" : "");
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

                    this.cordysUtil.callCordysWebserviceUseAnonymous(req).then((data: string) => {
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
                this.isAutoLogin().then((isAutoLogin: string) => {
                    if (isAutoLogin === 'true') {
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

    setSAMLart(value: string, notOnOrAfter: any): void {
        this.storageUtil.setSAMLart(value, notOnOrAfter);
    }

    getSAMLart(): Promise<string> {
        return this.storageUtil.getSAMLart();
    }

    removeSAMLart(): Promise<boolean> {
        return this.storageUtil.removeSAMLart();
    }

    enableAutoLogin() {
        return this.storageUtil.enableAutoLogin();
    }

    disableAutoLogin() {
        return this.storageUtil.disableAutoLogin();
    }

    isAutoLogin() {
        return this.storageUtil.isAutoLogin();
    }

    setLoginID(value) {
        return this.storageUtil.setLoginID(value);
    }

    setPassword(value) {
        return this.storageUtil.setPassword(value);
    }

    getLoginID() {
        return this.storageUtil.getLoginID();
    }

    getPassword() {
        return this.storageUtil.getPassword();
    }

    removeLoginID() {
        return this.storageUtil.removeLoginID();
    }

    removePassword() {
        return this.storageUtil.removePassword();
    }
}