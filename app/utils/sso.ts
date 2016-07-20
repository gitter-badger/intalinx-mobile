// Third party library.
import { Injectable } from '@angular/core';

// Config.
import {AppConfig} from '../appconfig';

// Utils.
import {Util} from './util';

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

    constructor(private util: Util, private appConfig: AppConfig) {
    }

    authenticate(userId, password) {
        if (!userId || !password) {
            return Promise.resolve(false);
        } else {
            return new Promise(resolve => {
                this.util.getRequestXml('./assets/requests/saml_assertion_request.xml').then((req: string) => {

                    let samlRequest = this.util.parseXml(req);
                    this.util.setXMLNamespaces(samlRequest, {
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
                    this.util.selectXMLNode(samlRequest, 'SOAP:Envelope/SOAP:Body/samlp:Request').setAttribute('RequestID', createRequestID());
                    this.util.selectXMLNode(samlRequest, 'SOAP:Envelope/SOAP:Body/samlp:Request').setAttribute('IssueInstant', this.util.getUTCDate());
                    this.util.setNodeText(samlRequest, './/saml:NameIdentifier', userId);

                    // Remove security node if no wsse username is used 
                    let headerNode = this.util.selectXMLNode(samlRequest, 'SOAP:Envelope/SOAP:Header');
                    let securityNode = this.util.selectXMLNode(samlRequest, './/wsse:Security');
                    if (password == null) password = '';

                    this.util.setNodeText(samlRequest, './/wsse:Username', userId);
                    this.util.setNodeText(samlRequest, './/wsse:Password', password);

                    req = this.util.xml2string(samlRequest);

                    this.util.callCordysWebserviceUseAnonymous(req).then((data: string) => {
                        let samlResponse = this.util.parseXml(data);
                        this.util.setXMLNamespaces(samlResponse, {
                            'SOAP': this.constants.SOAP_NAMESPACE,
                            'wsse': this.constants.WSSE_NAMESPACE,
                            'wsu': this.constants.WSU_NAMESPACE,
                            'samlp': this.constants.SAMLPROTOCOL_NAMESPACE,
                            'saml': this.constants.SAML_NAMESPACE
                        });

                        let assertions = this.util.selectXMLNode(samlResponse, './/saml:Assertion');
                        let authenticationResult = false;
                        if (assertions != null) {
                            let samlArtifact = this.util.getNodeText(samlResponse, './/samlp:AssertionArtifact', null);
                            if (samlArtifact) {
                                let notOnOrAfterString = this.util.getNodeText(samlResponse, './/saml:Conditions/@NotOnOrAfter', null);
                                if (notOnOrAfterString) {
                                    let notOnOrAfterDate = this.util.transferCordysDateStringToUTC(notOnOrAfterString);
                                    this.util.setSAMLart(this.appConfig['SAML_ARTIFACT_STORAGE_NAME'], samlArtifact, notOnOrAfterDate);
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
        return this.util.loggedOn();
    }
}