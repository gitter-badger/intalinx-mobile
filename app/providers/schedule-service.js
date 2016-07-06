import {Injectable, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {IonicApp, NavController, Alert} from 'ionic-angular';

import {Util} from '../utils/util';

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
        this.userLocaleSettingsData = null;
        this.userDetailsData = null;
        this.specialDaysData = null;
    }

    getUserLocaleSettings(userID) {
        if (this.userLocaleSettingsData) {
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
                    let userSettings = this.util.selectXMLNodes(objResponse, ".//*[local-name()='UserSettingOutput']");
                    let localeString = "";
                    if (userSettings.length > 0) {
                        var showJapanHoliday = this.util.getNodeText(userSettings[0],  ".//*[local-name()='isShowJapanHoiday']");
                        var showChinaHoliday = this.util.getNodeText(userSettings[0],  ".//*[local-name()='isShowChinaHoliday']");
                        var showAmericaHoliday = this.util.getNodeText(userSettings[0],  ".//*[local-name()='isShowAmericaHoliday']");
                        // JP/CN/US
                        if (showJapanHoliday == "true") {
                            localeString += "JP;";
                        } 
                        if (showChinaHoliday == "true") {
                            localeString += "CN;";
                        }
                        if (showAmericaHoliday == "true") {
                            localeString += "US;";
                        }
                    }
                    resolve(localeString);
                });
            });
        });
    }
    
    getIsAdmin() {
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

                    let oRoleNodes = this.util.selectXMLNodes(objResponse,  ".//*[local-name()='Role']");
                    let isAdmin = false;
                    if (oRoleNodes) {
                        for (var i = 0; i < oRoleNodes.length; i++) {
                            var role =this.util.getNodeText(oRoleNodes[i], "./");
                            if (role == "MyCalAdmin") {
                                isAdmin = true;
                            }
                        }
                    }
                    resolve(isAdmin);
                });
            });
        });
    }
    
    getEventsForFacility(eventInputForFacilityAndGroup) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_events_for_device_and_group.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                
                // startTime/endTime--
                // selType--value--device/group--"when set group, cannot get anything.
                this.util.setNodeText(objRequest, ".//*[local-name()='startTime']", eventInputForFacilityAndGroup.startTime);
                this.util.setNodeText(objRequest, ".//*[local-name()='endTime']", eventInputForFacilityAndGroup.endTime);
                this.util.setNodeText(objRequest, ".//*[local-name()='selType']", eventInputForFacilityAndGroup.selType);
                
                req = this.util.xml2string(objRequest);
                
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let targetLists = this.util.selectXMLNodes(objResponse, ".//*[local-name()='TargetList']");
                    let facilitiesAndEvents = {};
                    let facilityList = new Array();
                    let eventList = new Array();
                    let participantsOfEvent = new Array();
                    
                    for(let i = 0; i < targetLists.length; i++) {
                        let targetIdString = this.util.getNodeText(targetLists[i], ".//*[local-name()='targetID']");
                        let targetNameString = this.util.getNodeText(targetLists[i], ".//*[local-name()='targetName']");
                        
                        let eventLists = this.util.selectXMLNodes(targetLists[i], ".//*[local-name()='eventList']");
                        eventList = [];
                        for(let j = 0; j < eventLists.length; j++) {
                            participantsOfEvent = [];
                            let participantNodes = this.util.selectXMLNodes(eventLists[j], ".//*[local-name()='Participant']");
                            for(let k = 0; k < participantNodes.length; k++) {
                                let participant = this.util.xml2json(participantNodes[k]).Participant;
                                participantsOfEvent.push(participant.userName);
                            }
                            let eventObject = this.util.xml2json(eventLists[j]).eventList;
                            let showEventContent = {
                                "title": eventObject.title, 
                                "participants": participantsOfEvent,
                                "facilityName": eventObject.deviceName,
                                "startTime": eventObject.startTime,
                                "endTime": eventObject.endTime
                            };
                            eventList.push(showEventContent);
                        }
                        let facilityObject = {
                            "targetId": targetIdString,
                            "targetName": targetNameString,
                            "events": eventList
                        };
                        facilityList.push(facilityObject);
                    }
                    facilitiesAndEvents = {
                        "facilities": facilityList
                    };
                    resolve(facilitiesAndEvents);
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
            this.util.getRequestXml('./assets/requests/schedule/get_special_days.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                // locale--separator--";". Avaliable value - JP/CN/US
                // start/end--type--timestamp 
                this.util.setNodeText(objRequest, ".//*[local-name()='locale']", request.locale);
                this.util.setNodeText(objRequest, ".//*[local-name()='start']", request.start);
                this.util.setNodeText(objRequest, ".//*[local-name()='end']", request.end);
                
                req = this.util.xml2string(objRequest);
                
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let holidayOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='HolidayOutput']");
                    let holidays = new Array();
                    for(let i = 0; i < holidayOutputs.length; i++) {
                        holidays.push(this.util.xml2json(holidayOutputs[i]).HolidayOutput);
                    }
                    resolve(holidays);
                });
            });
        });
    }

    searchEvents(searchEventsRequires) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/search_events.xml').then(req => {
                let objRequest = this.util.parseXml(req);

                this.util.setNodeText(objRequest, ".//*[local-name()='categoryID']", searchEventsRequires.categoryID);
                this.util.setNodeText(objRequest, ".//*[local-name()='isRepeat']", searchEventsRequires.isRepeat);
                this.util.setNodeText(objRequest, ".//*[local-name()='startTime']", searchEventsRequires.startTime);
                this.util.setNodeText(objRequest, ".//*[local-name()='endTime']", searchEventsRequires.endTime);
                this.util.setNodeText(objRequest, ".//*[local-name()='deviceID']", searchEventsRequires.deviceID);
                this.util.setNodeText(objRequest, ".//*[local-name()='visibility']", searchEventsRequires.visibility);
                this.util.setNodeText(objRequest, ".//*[local-name()='title']", searchEventsRequires.title);
                this.util.setNodeText(objRequest, ".//*[local-name()='summary']", searchEventsRequires.summary);
                this.util.setNodeText(objRequest, ".//*[local-name()='location']", searchEventsRequires.location);
                this.util.setNodeText(objRequest, ".//*[local-name()='timezone']", searchEventsRequires.timezone);
                this.util.setNodeText(objRequest, ".//*[local-name()='selType']", searchEventsRequires.selType);
                this.util.setNodeText(objRequest, ".//*[local-name()='userID']", searchEventsRequires.userId);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let eventOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='EventOutput']");

                    resolve(eventOutputs);
                });
            });
        });
    }

    searchEventsBySelectedDay(searchEventsRequires) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.searchEvents(searchEventsRequires).then(eventOutputs => {
                let events = new Array();
                for (let i = 0; i < eventOutputs.length; i++) {
                    let eventOutput = this.util.xml2json(eventOutputs[i]).EventOutput;
                    let startTime = moment(eventOutput.startTime, "X").format("HH:mm");
                    let endTime = moment(eventOutput.endTime, "X").format("HH:mm");
                    let isAllDay = eventOutput.isAllDay;
                    if (searchEventsRequires.startTime >= eventOutput.startTime && searchEventsRequires.endTime <= eventOutput.endTime) {
                        isAllDay = "true";
                    } else if (searchEventsRequires.startTime < eventOutput.startTime && searchEventsRequires.endTime < eventOutput.endTime) {
                        endTime = "24:00";
                    } else if (searchEventsRequires.endTime > eventOutput.endTime && searchEventsRequires.startTime > eventOutput.startTime) {
                        startTime = "00:00";
                    }
                    let event = {
                        startTime: startTime,
                        endTime: endTime,
                        title: eventOutput.title,
                        isAllDay: isAllDay
                    }
                    events.push(event);
                }
                resolve(events);
            });
        });
    }

    searchEventsByDisplayedMonth(searchEventsRequires) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.searchEvents(searchEventsRequires).then(eventOutputs => {
                let days = new Array();
                for (let i = 0; i < eventOutputs.length; i++) {
                    let eventOutput = this.util.xml2json(eventOutputs[i]).EventOutput;
                    let startDay = Number(moment(eventOutput.startTime, "X").format("D"));
                    let endDay = Number(moment(eventOutput.endTime, "X").format("D"));
                    for (let i = startDay; i <= endDay; i++) {
                        days.push(i.toString());
                    }
                }
                resolve(days);
            });
        });
    }
    
    searchSpecialDaysByDisplayedMonth(searchSpecialDaysRequires) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.getSpecialDays(searchSpecialDaysRequires).then(holidays => {
                let days = new Array();
                for (let i = 0; i < holidays.length; i++) {
                    let startDay = moment(holidays[i].startDay, "X").format("D");
                    days.push(startDay);
                }
                resolve(days);
            });
        });
    }
    
    getSpecialDaysInSelectedDay(searchSpecialDaysRequires, selectedDay) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.getSpecialDays(searchSpecialDaysRequires).then(holidays => {
                let specialDays = new Array();
                for (let i = 0; i < holidays.length; i++) {
                    let startDay = moment(holidays[i].startDay, "X").format('YYYY/MM/D');
                    if (selectedDay == startDay) {
                        specialDays.push(holidays[i]);
                    }
                }
                resolve(specialDays);
            });
        });
    }
}