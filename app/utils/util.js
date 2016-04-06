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

    getUTCDate() {
        return DateUtil.getUTCDate();
    }

    getUserAvatarUrlByUserId(userId) {
        return this.app.config.get("USER_AVAtar_IMAGE_URL") + userId + this.app.config.get("USER_AVATAR_IMAGE_TYPE");
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
        let yearMonthDay = date.substring(0, 10);
        let dateWhoutT = new Date(yearMonthDay);
        dateWhoutT.setHours(date.substring(11, 13));
        dateWhoutT.setMinutes(date.substring(14, 16));
        dateWhoutT.setSeconds(date.substring(17, 19));
        let dateWhoutTTime = dateWhoutT.getTime();

        let nowTime = new Date().getTime();
        let minutesFromDateToNow = Math.trunc((nowTime - dateWhoutTTime) / (60 * 1000));

        let minutesOfOneHour = 60;
        let minutesOfOneday = minutesOfOneHour * 24;
        let minutesOfOneWeek = minutesOfOneday * 7;
        return new Promise(resolve => {
            if (minutesFromDateToNow >= minutesOfOneWeek) {
                // 一週前の場合
                resolve(yearMonthDay.replace(/\-/ig, "/") + " " + date.substring(11, 16));
            } else if (minutesFromDateToNow >= minutesOfOneday) {
                // 一日~一週の場合
                this.transferDateToWeekDayName(dateWhoutT).then(data => {
                    resolve(data + " " + date.substring(11, 16));
                });
            } else if (minutesFromDateToNow >= minutesOfOneHour) {
                // 一時間~一日の場合
                let hours = Math.trunc(minutesFromDateToNow / minutesOfOneHour);
                this.app.translate.get(["app.date.hoursAgo"]).subscribe(message => {
                    resolve(hours + message["app.date.hoursAgo"]);
                });
            } else {
                // 一時間以内場合
                // １分以内場合
                if (minutesFromDateToNow < 1) {
                    minutesFromDateToNow = 1;
                }
                this.app.translate.get(["app.date.minutesAgo"]).subscribe(message => {
                    resolve(minutesFromDateToNow + message["app.date.minutesAgo"]);
                });
            }

        });
    }

    transferDateToWeekDayName(date) {
        let weekday = new Array(7);
        return new Promise(resolve => {
            this.app.translate.get(["app.date.sunday", "app.date.monday", "app.date.tuesday",
                "app.date.wednesday", "app.date.thursday", "app.date.friday", "app.date.saturday"]).subscribe(message => {

                    weekday[0] = message["app.date.sunday"];
                    weekday[1] = message["app.date.monday"];
                    weekday[2] = message["app.date.tuesday"];
                    weekday[3] = message["app.date.wednesday"];
                    weekday[4] = message["app.date.thursday"];
                    weekday[5] = message["app.date.friday"];
                    weekday[6] = message["app.date.saturday"];

                    resolve(weekday[date.getDay()]);
                });
        });
    }
}