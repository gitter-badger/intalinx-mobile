// Third party library.
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {NavController, Alert} from 'ionic-angular';

// Config.
import {AppConfig} from '../appconfig';

// Utils
import {Util} from '../utils/util';

@Injectable()
export class NotificationService {
    private userDefaultAvatarImageUrl: string;

    constructor(private http: Http, 
                private nav: NavController, 
                private appConfig: AppConfig, 
                private util: Util) {
        this.userDefaultAvatarImageUrl = this.appConfig.get('USER_DEFAULT_AVATAR_IMAGE_URL');
    }

    getNotificationListForTop(position, isNeedRegistNotExistsReadStatus): any {
        let rowsPerpage = '10';
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/get_notification_list_for_top_request.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);

                let cursorNode = this.util.selectXMLNode(objRequest, './/*[local-name()=\'cursor\']');
                this.util.setXMLAttribute(cursorNode, '', 'position', position);
                this.util.setXMLAttribute(cursorNode, '', 'numRows', rowsPerpage);

                this.util.setNodeText(objRequest, './/*[local-name()=\'isNeedRegistNotExistsReadStatus\']', isNeedRegistNotExistsReadStatus);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);
                    let notificationOutputs = this.util.selectXMLNodes(objResponse, './/*[local-name()=\'NotificationOutputForTop\']');
                    let notifications = new Array();
                    for (let i = 0; i < notificationOutputs.length; i++) {
                        notifications.push(this.util.xml2json(notificationOutputs[i]).NotificationOutputForTop);
                    }

                    notifications.forEach(function(notification) {
                        if (!notification.createUserAvatar || notification.createUserAvatar.toString().indexOf('data:image') !== 0) {
                            notification.createUserAvatar = this.userDefaultAvatarImageUrl;
                        }
                        this.util.fromNowForNotification(notification.publishStartDate).then(data => {
                            notification.publishStartDate = data;
                        });
                    }, this);

                    resolve(notifications);
                });
            });
        });
    }

    getNotReadNotificationCountBySelf(): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/get_not_read_notification_count_by_self.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);

                    let returnOutPut = this.util.selectXMLNode(objResponse, './/*[local-name()=\'return\']');
                    let returnData = this.util.xml2json(returnOutPut).return;
                    resolve(returnData);
                });
            });
        });
    }

    getNotificationDetailByNotificationID(notificationID): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/get_notification_detail_by_notification_id_request.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);

                this.util.setNodeText(objRequest, './/*[local-name()=\'notificationID\']', notificationID);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);

                    let notificationOutput = this.util.selectXMLNode(objResponse, './/*[local-name()=\'NotificationOutput\']');
                    let notification = this.util.xml2json(notificationOutput).NotificationOutput;
                    if (!notification.createUserAvatar || notification.createUserAvatar.toString().indexOf('data:image') !== 0) {
                        notification.createUserAvatar = this.userDefaultAvatarImageUrl;
                    }
                    this.util.fromNowForNotification(notification.publishStartDate).then(data => {
                        notification.publishStartDate = data;
                    });
                    resolve(notification);
                });
            });
        });
    }
    
    updateReadStatus(notificationID, status): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/notification/update_read_status.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                
                this.util.setNodeText(objRequest, './/*[local-name()=\'notificationId\']', notificationID);
                this.util.setNodeText(objRequest, './/*[local-name()=\'status\']', status);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    resolve('true');
                });
            });
        });
    }
}