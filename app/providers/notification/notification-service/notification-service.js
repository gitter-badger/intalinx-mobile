import {Injectable, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {IonicApp, NavController, Alert} from 'ionic-angular';

import {Util} from '../../../utils/util';

export class NotificationService {

    static get parameters() {
        return [[Http], [IonicApp], [NavController], [Util]];
    }

    constructor(http, app, nav, util) {
        this.http = http;
        this.app = app;
        this.nav = nav;
        this.data = null;
        this.util = util;
        
        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");
    }

    // トップ画面について、ブログリストを取得します
    getNotificationListForTop(position, isNeedRegistNotExistsReadStatus) {
        let rowsPerpage = 10;
        if (this.data) {
            // データはもうロードされた。
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/get_notification_list_for_top_request.xml').then(req => {
                let objRequest = this.util.parseXml(req);

                let cursorNode = this.util.selectXMLNode(objRequest, ".//*[local-name()='cursor']");
                this.util.setXMLAttribute(cursorNode, "", "position", position);
                this.util.setXMLAttribute(cursorNode, "", "numRows", rowsPerpage);

                this.util.setNodeText(objRequest, ".//*[local-name()='isNeedRegistNotExistsReadStatus']", isNeedRegistNotExistsReadStatus);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let notificationOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='NotificationOutputForTop']");
                    let notifications = new Array();
                    for (let i = 0; i < notificationOutputs.length; i++) {
                        notifications.push(this.util.xml2json(notificationOutputs[i]).NotificationOutputForTop);
                    }

                    notifications.forEach(function(element) {
                        if (element.createUserAvatar.toString().indexOf("data:image") != 0) {
                            element.createUserAvatar = this.userAvatarImageUrl + this.userAvatarDefaultImage;
                        }
                        this.util.fromNowForNotification(element.publishStartDate).then(data => {
                            element.publishStartDate = data;
                        });
                    }, this);

                    resolve(notifications);
                });
            });
        });
    }

    // まだ読まない通知に計数を取得する
    getNotReadNotificationCountBySelf() {
        if (this.data) {
            // データはもうロードされた。
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/get_not_read_notification_count_by_self.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let returnOutPut = this.util.selectXMLNode(objResponse, ".//*[local-name()='return']");
                    let returnData = this.util.xml2json(returnOutPut).return;
                    resolve(returnData);
                });
            });
        });
    }

    // 通知IDに基づいて、通知詳細情報を取得する
    getNotificationDetailByNotificationID(notificationID) {
        if (this.data) {
            // データはもうロードされた。
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/get_notification_detail_by_notification_id_request.xml').then(req => {
                let objRequest = this.util.parseXml(req);

                this.util.setNodeText(objRequest, ".//*[local-name()='notificationID']", notificationID);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let notificationOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='NotificationOutput']");
                    let notification = this.util.xml2json(notificationOutput).NotificationOutput;
                    if (!notification.createUserAvatar || notification.createUserAvatar.toString().indexOf("data:image") != 0) {
                        notification.createUserAvatar = this.userAvatarImageUrl + this.userAvatarDefaultImage;
                    }
                    this.util.fromNowForNotification(notification.publishStartDate).then(data => {
                        notification.publishStartDate = data;
                    });
                    resolve(notification);
                });
            });
        });
    }
    
    // 読むか読まないかの識別子を更新します。
    updateReadStatus(notificationID, status){
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/update_read_status.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                
                this.util.setNodeText(objRequest, ".//*[local-name()='notificationId']", notificationID);
                this.util.setNodeText(objRequest, ".//*[local-name()='status']", status);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    resolve("true");
                });
            });
        });
    }
}