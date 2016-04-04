import {Injectable, Inject} from 'angular2/core';
import {Http} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {IonicApp} from 'ionic-angular';

import {Util} from '../../utils/util';

/*
  Generated class for the UserService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
export class UserService {

    static get parameters() {
        return [[Http], [IonicApp], [Util]];
    }

    constructor(http, app, util) {
        this.http = http;
        this.app = app;
        this.sso = null;
        this.util = util;
    }

    initializeSSO() {
        return new Promise(resolve => {
            let url = this.app.config.get("BASE_URL") + this.app.config.get("PRE_LOGIN_INFO_URL");
            this.util.callCordysWebserviceWithUrl(url, null).then(data => {
                let xmlConfigData = this.util.parseXml(data);
                this.sso = new SSO(this.util, this.app.config);
                resolve(this.sso);
            });
        });
    }

    getSSO() {
        if (!this.sso) {
            return this.initializeSSO();
        } else {
            return Promise.resolve(this.sso);
        }
    }

    loggedOn() {
        return new Promise(resolve => {
            this.getSSO()
                .then(sso => {
                    resolve(sso.loggedOn());
                });
        });
    }

    authenticate(user) {
        return new Promise(resolve => {
            this.getSSO()
                .then(sso => {
                    return sso.authenticate(user.loginId, user.password);
                })
                .then(authenticationResult => {
                    resolve(authenticationResult);
                });
        });
    }

    getUserDetail() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/userservice/getuserdetail.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    updateProfile(user) {
        if (this.validateUserPassword(user.newPassword, user.confirmPassword)) {
            if (this.data) {
                // already loaded data
                return Promise.resolve(this.data);
            }
            return new Promise(resolve => {
                this.util.getRequestXml('./assets/requests/set_password.xml').then(req => {
                    let objRequest = this.util.parseXml(req);
                    this.util.setNodeText(objRequest, ".//*[local-name()='OldPassword']", user.oldPassword);
                    this.util.setNodeText(objRequest, ".//*[local-name()='NewPassword']", user.newPassword);
                    req = this.util.xml2string(objRequest);

                    this.util.callCordysWebservice(req).then(data => {
                        let objResponse = this.util.parseXml(data);
                        let insertReplyContent = this.util.selectXMLNode(objResponse, ".//*[local-name()='insertReplyContent']");
                        let returnData = this.util.xml2json(insertReplyContent).insertReplyContent.insertReplyContent;

                        resolve(returnData);
                    });
                });
            });
        }
    }

    validateUserPassword(newPassword, confirmPassword) {
        let passwordEmptyFault = newPassword == "" && confirmPassword == "";
        let arePasswordsSame = newPassword == confirmPassword;

        if (passwordEmptyFault) {
            alert("パスワードは空になることはできません。");
        }
        else if (!arePasswordsSame) {
            alert("パスワードが一致しません。 両方のテキスト ボックスに同じパスワードを入力するを確認してください。");
        }

        return !passwordEmptyFault && arePasswordsSame;
    }
}

class SSO {

    static get constants() {
        return {
            GATEWAY_URL: "com.eibus.web.soap.Gateway.wcp",
            PRE_LOGIN_INFO_URL: "com.eibus.sso.web.authentication.PreLoginInfo.wcp",
            SAMLART_NAME: "SAMLart",
            CLIENT_ATTRIBUTES_SCHEMA_NAMESPACE: "http://schemas.cordys.com/General/ClientAttributes/",
            SOAP_NAMESPACE: "http://schemas.xmlsoap.org/soap/envelope/",
            I18N_NAMESPACE: "http://www.w3.org/2005/09/ws-i18n",
            CORDSY_NAMESPACE: "http://schemas.cordys.com/General/1.0/",
            WSSE_NAMESPACE: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
            WSU_NAMESPACE: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
            SAMLPROTOCOL_NAMESPACE: "urn:oasis:names:tc:SAML:1.0:protocol",
            SAML_NAMESPACE: "urn:oasis:names:tc:SAML:1.0:assertion",
        }
    }

    constructor(util, config) {
        this.util = util;
        this.config = config;
    }

    authenticate(userId, password) {
        if (!userId || !password) {
            return Promise.resolve(false);
        } else {
            return new Promise(resolve => {
                this.util.getRequestXml('./assets/requests/saml_assertion_request.xml').then(req => {

                    let samlRequest = this.util.parseXml(req);
                    this.util.setXMLNamespaces(samlRequest, {
                        "SOAP": SSO.constants.SOAP_NAMESPACE,
                        "wsse": SSO.constants.WSSE_NAMESPACE,
                        "wsu": SSO.constants.WSU_NAMESPACE,
                        "samlp": SSO.constants.SAMLPROTOCOL_NAMESPACE,
                        "saml": SSO.constants.SAML_NAMESPACE
                    });

                    let createRequestID = function() {
                        // wdk XXX: use guid generator?
                        let gid = "a"; // XML validation requires that the request ID does not start with a number
                        for (let i = 0; i < 32; i++) {
                            gid += Math.floor(Math.random() * 0xF).toString(0xF) + (i == 8 || i == 12 || i == 16 || i == 20 ? "-" : "");
                        }
                        return gid;
                    }

                    // set RequestID, IssueInstant and NameIdentifier
                    this.util.selectXMLNode(samlRequest, "SOAP:Envelope/SOAP:Body/samlp:Request").setAttribute("RequestID", createRequestID());
                    this.util.selectXMLNode(samlRequest, "SOAP:Envelope/SOAP:Body/samlp:Request").setAttribute("IssueInstant", this.util.getUTCDate());
                    this.util.setNodeText(samlRequest, ".//saml:NameIdentifier", userId);

                    // Remove security node if no wsse username is used 
                    let headerNode = this.util.selectXMLNode(samlRequest, "SOAP:Envelope/SOAP:Header");
                    let securityNode = this.util.selectXMLNode(samlRequest, ".//wsse:Security");
                    if (password == null) password = "";

                    this.util.setNodeText(samlRequest, ".//wsse:Username", userId);
                    this.util.setNodeText(samlRequest, ".//wsse:Password", password);

                    req = this.util.xml2string(samlRequest);

                    this.util.callCordysWebservice(req).then(data => {
                        let samlResponse = this.util.parseXml(data);
                        this.util.setXMLNamespaces(samlResponse, {
                            "SOAP": SSO.constants.SOAP_NAMESPACE,
                            "wsse": SSO.constants.WSSE_NAMESPACE,
                            "wsu": SSO.constants.WSU_NAMESPACE,
                            "samlp": SSO.constants.SAMLPROTOCOL_NAMESPACE,
                            "saml": SSO.constants.SAML_NAMESPACE
                        });

                        let assertions = this.util.selectXMLNode(samlResponse, ".//saml:Assertion");
                        let authenticationResult = false;
                        if (assertions != null) {
                            let samlArtifact = this.util.getNodeText(samlResponse, ".//samlp:AssertionArtifact", null);
                            if (samlArtifact) {
                                authenticationResult = true;
                                this.util.setCookie(this.config.get("SAML_ARTIFACT_COOKIE_NAME"), samlArtifact, null, this.config.get("SAML_ARTIFACT_COOKIE_PATH"));
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

    loggedOn() {
        let isLoggedOn = false;
        let cookie = this.util.getCookie(this.config.get("SAML_ARTIFACT_COOKIE_NAME"));
        isLoggedOn = cookie != null && cookie != "";
        // TODO
        /*
        if (!isLoggedOn && this.config.useSamlUrlArtifact) {
            let artifact = BizNaviUtil.getValueFromURL(BizNaviUtil.constants.SAMLART_NAME);
            isLoggedOn = artifact != null;
        }
        */
        return isLoggedOn;
    }
}
