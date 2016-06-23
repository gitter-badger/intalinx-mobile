import {Injectable, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {IonicApp, NavController, Alert} from 'ionic-angular';

import {Util} from '../../../utils/util';

export class ScheduleService {

    static get parameters() {
        return [[Http], [IonicApp], [NavController], [Util]];
    }

    constructor(http, app, nav, util) {
        this.http = http;
        this.app = app;
        this.nav = nav;
        this.util = util;
        
        this.data = null;
        this.userSettingsData = null;
        this.userDetailsData = null;
        this.specialDaysData = null;
    }

    // トップ画面について、ブログリストを取得します
    getUserSettings(userID) {
        if (this.userSettingsData) {
            // already loaded data
            return Promise.resolve(this.userSettingsData);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_user_settings.xml').then(req => {
                let objRequest = this.util.parseXml(req);

                this.util.setNodeText(objRequest, ".//*[local-name()='userID']", userID);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let userSettingOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='UserSettingOutput']");
                    let userSettings = this.util.xml2json(userSettingOutput).UserSettingOutput;
                    resolve(userSettings);
                });
            });
        });
    }
    
    getUserDetails() {
        if (this.userDetailsData) {
            // already loaded data
            return Promise.resolve(this.userDetailsData);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_user_details.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let userOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='User']");
                    let user = this.util.xml2json(userOutput).User;
                    let organizationsOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='organization']");
                    let organizations = new Array();
                    // default="true"の場合はどう？
                    for (let i = 0; i < organizationsOutputs.length; i++) {
                        organizations.push(this.util.xml2json(organizationsOutputs[i]).organization);
                    }
                    
                    let returnUser = {
                        "authuserdn": user.authuserdn,
                        "description": user.description,
                        "organization": organizations
                    }
                    resolve(returnUser);
                });
            });
        });
    }
    
    getEventsForDeviceAndGroup(eventInputForDeviceAndGroup) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_events_for_device_and_group.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                
                // startTime/endTime--
                // selType--施設一覧画面の施設・スケジュール画面のグループのため取得するデータ--device/group--groupの場合はデータなし
                this.util.setNodeText(objRequest, ".//*[local-name()='startTime']", eventInputForDeviceAndGroup.startTime);
                this.util.setNodeText(objRequest, ".//*[local-name()='endTime']", eventInputForDeviceAndGroup.endTime);
                this.util.setNodeText(objRequest, ".//*[local-name()='selType']", eventInputForDeviceAndGroup.selType);
                
                req = this.util.xml2string(objRequest);
                
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let targetLists = this.util.selectXMLNodes(objResponse, ".//*[local-name()='TargetList']");
                    let devicesAndEvents = new Array();
                    let participants = new Array();
                    for(let i = 0; i < targetLists.length; i++) {
                        participants = [];
                        let participantNodes = this.util.selectXMLNodes(targetLists[i], ".//*[local-name()='Participant']");
                        for(let j = 0; j < participantNodes.length; j++) {
                            participants.push(this.util.xml2json(participantNodes[j]).Participant);
                        }
                        devicesAndEvents.push(this.util.xml2json(participantNodes[j]).Participant)
                        devicesAndEvents.participants = participants;
                    }
                    
                    resolve(devicesAndEvents);
                });
            });
        });
    }
    
    getSpecialDays(request) {
        if (this.specialDaysData) {
            // already loaded data
            return Promise.resolve(this.specialDaysData);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_special_days.xml.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                // locale--告別--";"でスプリットします。JP/CN/US三つのデータがあります。
                // start/end--休日検索の開始時間・終了時間timestamp類型
                this.util.setNodeText(objRequest, ".//*[local-name()='locale']", request.locale);
                this.util.setNodeText(objRequest, ".//*[local-name()='start']", request.start);
                this.util.setNodeText(objRequest, ".//*[local-name()='end']", request.end);
                
                req = this.util.xml2string(objRequest);
                
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let holidayOutputs = this.util.selectXMLNode(objResponse, ".//*[local-name()='HolidayOutput']");
                    let holidays = new Array();
                    for(let i = 0; i < holidayOutputs.length; i++) {
                        holidays.push(this.util.xml2json(holidayOutputs[i]).HolidayOutput);
                    }
                    resolve(holidays);
                });
            });
        });
    }
}