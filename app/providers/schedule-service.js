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
                        var showJapanHoliday = this.util.getNodeText(userSettings[0], ".//*[local-name()='isShowJapanHoiday']");
                        var showChinaHoliday = this.util.getNodeText(userSettings[0], ".//*[local-name()='isShowChinaHoliday']");
                        var showAmericaHoliday = this.util.getNodeText(userSettings[0], ".//*[local-name()='isShowAmericaHoliday']");
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

                    let oRoleNodes = this.util.selectXMLNodes(objResponse, ".//*[local-name()='Role']");
                    let isAdmin = false;
                    if (oRoleNodes) {
                        for (var i = 0; i < oRoleNodes.length; i++) {
                            var role = this.util.getNodeText(oRoleNodes[i], "./");
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

                    for (let i = 0; i < targetLists.length; i++) {
                        let targetIdString = this.util.getNodeText(targetLists[i], ".//*[local-name()='targetID']");
                        let targetNameString = this.util.getNodeText(targetLists[i], ".//*[local-name()='targetName']");

                        let eventLists = this.util.selectXMLNodes(targetLists[i], ".//*[local-name()='eventList']");
                        eventList = [];
                        for (let j = 0; j < eventLists.length; j++) {
                            participantsOfEvent = [];
                            let participantNodes = this.util.selectXMLNodes(eventLists[j], ".//*[local-name()='Participant']");
                            for (let k = 0; k < participantNodes.length; k++) {
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
                    for (let i = 0; i < holidayOutputs.length; i++) {
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
                        eventID: eventOutput.eventID,
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
                    // the start time is before the month
                    if (Number(eventOutput.startTime) < searchEventsRequires.startTime) {
                        startDay = Number(moment(searchEventsRequires.startTime, "X").format("D"));
                    }
                    // the end time is after the month
                    if (Number(eventOutput.endTime) > searchEventsRequires.endTime) {
                        endDay = Number(moment(searchEventsRequires.endTime, "X").format("D"));
                    }
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

    getEventByEventId(eventId) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_event_by_event_id.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='eventID']", eventId);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let eventOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='EventOutput']");
                    let event = this.util.xml2json(eventOutput).EventOutput;

                    let participants = [];
                    let participantNodes = this.util.selectXMLNodes(objResponse, ".//*[local-name()='Participant']");
                    for (let i = 0; i < participantNodes.length; i++) {
                        participants.push(this.util.xml2json(participantNodes[i]).Participant);
                    }
                    let returnData = {
                        "event": event,
                        "participants": participants
                    }
                    resolve(returnData);
                    resolve(event);
                });
            });
        });

    }

    getCategoryList() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_category_list.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let normalCategory = this.util.selectXMLNodes(objResponse, ".//*[local-name()='FixedCategory']");
                    let otherCategories = this.util.selectXMLNodes(objResponse, ".//*[local-name()='OtherCategoryList']");
                    let categories = new Array();
                    for (let i = 0; i < normalCategory.length; i++) {
                        categories.push(this.util.xml2json(normalCategory[i]).FixedCategory);
                    }
                    for (let i = 0; i < otherCategories.length; i++) {
                        categories.push(this.util.xml2json(otherCategories[i]).OtherCategoryList);
                    }
                    resolve(categories);
                });
            });
        });
    }

    getCategoryNameByCategoryId(categoryId) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.getCategoryList().then(categories => {
                let categoryName;
                categories.forEach(function(element) {
                    if (element.categoryID == categoryId) {
                        categoryName = element.categoryName;
                    }
                }, this);
                resolve(categoryName);
            });
        });
    }

    getDeviceListWithoutTranferToJson() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_device_list.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let deviceOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='DeviceOutput']");

                    resolve(deviceOutputs);
                });
            });
        });
    }

    getDeviceList() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.getDeviceListWithoutTranferToJson.then(deviceOutputs => {
                let facilities = [];
                for (let i = 0; i < deviceOutputs.length; i++) {
                    facilities.push(this.util.xml2json(deviceOutputs[i]).DeviceOutput);
                }
                resolve(facilities);
            });
        });
    }

    getDevicesByDeviceIds(deviceIds) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            let deviceIdsArray = deviceIds.split(",");

            this.getDeviceListWithoutTranferToJson().then(deviceOutputs => {
                let deviceNames = new Array();
                for (let i = 0; i < deviceOutputs.length; i++) {
                    let device = this.util.xml2json(deviceOutputs[i]).DeviceOutput;
                    if (deviceIdsArray.includes(device.deviceID)) {
                        deviceNames.push(device.deviceName);
                    }
                }
                resolve(deviceNames);
            });
        });
    }

    getOrganizationList() {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_organanization_list.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let organizationOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='OrganizationOutput']");
                    let orgs = new Array();
                    for (let i = 0; i < organizationOutputs.length; i++) {
                        orgs.push(this.util.xml2json(organizationOutputs[i]).OrganizationOutput);
                    }

                    orgs.forEach(function(element) {
                        if (element.parentOrganizationCode && element.parentOrganizationCode != "") {
                            let curParentOrganizationCode = element.parentOrganizationCode;
                            for (let index = 0; index < orgs.length; index++) {
                                if (orgs[index].organizationCode == curParentOrganizationCode) {
                                    let parentOrganizationName = orgs[index].organizationName;
                                    let curOrganizationName = element.organizationName;
                                    element.organizationName = parentOrganizationName
                                        + "・" + curOrganizationName;
                                    break;
                                }
                            }
                        }
                    }, this);

                    resolve(orgs);
                });
            });
        });
    }

    getHumanResourceUserInfoList() {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/get_human_resource_user_info_list.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let userOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='UserOutput']");
                    let usrs = new Array();
                    for (let i = 0; i < userOutputs.length; i++) {
                        let userOutput = this.util.xml2json(userOutputs[i]).UserOutput;
                        let user = {
                            "userId": userOutput.userId,
                            "userName": userOutput.userName,
                            "assignOrgCd": userOutput.assignOrgCd,
                            "isSelected": false,
                        }
                        usrs.push(user);
                    }
                    resolve(usrs);
                });
            });
        });
    }

    addEvent(event, participants) {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/schedule/add_event.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.setNodeText(req, ".//*[local-name()='categoryID']", event.categoryID);
                this.util.setNodeText(req, ".//*[local-name()='isAllDay']", event.isAllDay);
                this.util.setNodeText(req, ".//*[local-name()='isRepeat']", event.isRepeat);
                this.util.setNodeText(req, ".//*[local-name()='repeatRule']", event.repeatRule);
                this.util.setNodeText(req, ".//*[local-name()='startTime']", event.startTime);
                this.util.setNodeText(req, ".//*[local-name()='endTime']", event.endTime);
                this.util.setNodeText(req, ".//*[local-name()='deviceID']", event.deviceID);
                this.util.setNodeText(req, ".//*[local-name()='visibility']", event.visibility);
                // this.util.setNodeText(req, ".//*[local-name()='isReminder']", "");
                // this.util.setNodeText(req, ".//*[local-name()='reminderRule']", "");
                this.util.setNodeText(req, ".//*[local-name()='title']", event.title);
                this.util.setNodeText(req, ".//*[local-name()='summary']", event.summary);
                this.util.setNodeText(req, ".//*[local-name()='location']", event.location);
                this.util.setNodeText(req, ".//*[local-name()='status']", event.status);
                this.util.setNodeText(req, ".//*[local-name()='isDeviceRepeatWarned']", event.isDeviceRepeatWarned);
                this.util.setNodeText(req, ".//*[local-name()='isEventRepeatWarned']", event.isEventRepeatWarned);
                // add paticipants to the request.
                let oEventOutput = this.util.selectXMLNode(req, ".//*[local-name()='EventOutput']");
                let iLen = participants.length;
                debugger
                // Is this definetion ok?
                let curEventNamespace = "http://schemas.intasect.co.jp/mycal/service/event";
                if (iLen > 0) {
                    for (var i = 0; i < iLen; i++) {
                        let curParticipant = participants[i];
                        var oParticipant = this.util.createXMLElement(oEventOutput, curEventNamespace, "Participant");
                        var oUserID = this.util.createXMLElement(oParticipant, curEventNamespace, "userID");
                        var oUserName = this.util.createXMLElement(oParticipant, curEventNamespace, "userName");
                        this.util.setNodeText(oUserID, curParticipant.userID);
                        this.util.appendXMLNode(oUserID, oParticipant);
                        this.util.setNodeText(oUserName, curParticipant.userName);
                        this.util.appendXMLNode(oUserName, oParticipant);
                        this.util.appendXMLNode(oParticipant, oEventOutput);
                    }
                }
                debugger
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    debugger
                    //     if (!oBdiObject.soapFaultOccurred) {
                    // 	gsData.setChildPageChanged(true);
                    // 	CordysUtil.success(MyCalUtil.getMessage("MYCAL_ERROR_0020006"));
                    // 	CordysUtil.closeModal();
                    // }　else　{
                    // 	var sWarnMesssageCode = oBdiObject.warnCode;
                    // 	var sWarnMesssageInfo = oBdiObject.warnMessage;
                    // 	if (sWarnMesssageCode && sWarnMesssageCode.indexOf("WARN003") > -1)　{
                    // 		// 繰り返し予定は存在なし
                    // 		var sMessages = convertWarningMessage(sWarnMesssageInfo);
                    // 		CordysUtil.error(sMessages);
                    // 	} else if (sWarnMesssageCode && sWarnMesssageCode.indexOf("WARN002") > -1) {
                    // 		// 予定重複
                    //         var okHandler = function() {
                    // 			var isDeviceRepeatWarned = false;
                    // 			var isEventRepeatWarned = true;
                    //             return addEvent(isDeviceRepeatWarned, isEventRepeatWarned);
                    //         }
                    //         var sMessages = convertWarningMessage(sWarnMesssageInfo);
                    // 		CordysUtil.confirm(sMessages,okHandler);
                    //     } else if　(sWarnMesssageCode && sWarnMesssageCode.indexOf("WARN001") > -1) {
                    // 		// 施設重複
                    //         var okHandler = function() {
                    // 			var isDeviceRepeatWarned = true;
                    // 			var isEventRepeatWarned = true;
                    //             return addEvent(isDeviceRepeatWarned, isEventRepeatWarned);
                    //         }
                    //         var sMessages = convertWarningMessage(sWarnMesssageInfo);
                    // 		CordysUtil.confirm(sMessages,okHandler);
                    // 	} else　{
                    // 		CordysUtil.systemError();
                    // 	}
                    // }　

                    let returnObject = this.util.selectXMLNode(objResponse, ".//*[local-name()='return']");
                    let returnData = this.util.xml2json(returnObject).return;
                    resolve(returnData);
                });
            });
        });
    }

    deleteEvent(deleteEventRequires) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {

            let eventId = deleteEventRequires.eventId;
            let isFromRepeatToSpecial = deleteEventRequires.isFromRepeatToSpecial;
            this.util.getRequestXml('./assets/requests/schedule/delete_event.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='eventID']", eventId);
                // delete the event of the selecte dday
                this.util.setNodeText(objRequest, ".//*[local-name()='isFromRepeatToSpecial']", "" + isFromRepeatToSpecial);
                if (isFromRepeatToSpecial) {
                    this.util.setNodeText(objRequest, ".//*[local-name()='parentEventID']", eventId);
                    this.util.setNodeText(objRequest, ".//*[local-name()='oldStartTime']", deleteEventRequires.startTime);
                    this.util.setNodeText(objRequest, ".//*[local-name()='oldEndTime']", deleteEventRequires.endTime);
                    this.util.setNodeText(objRequest, ".//*[local-name()='startTime']", -1);
                    this.util.setNodeText(objRequest, ".//*[local-name()='endTime']", -1);
                }

                req = this.util.xml2string(objRequest);
                this.util.callCordysWebservice(req).then(data => {

                    resolve("true");
                });
            });
        });
    }

    getDeviceListForSelect() {
        return new Promise(resolve => {
            this.getDeviceListWithoutTranferToJson().then(deviceOutputs => {
                let facilities = new Array();
                for (let i = 0; i < deviceOutputs.length; i++) {
                    let deviceOutput = this.util.xml2json(deviceOutputs[i]).DeviceOutput;
                    let facility = {
                        "facilityId": deviceOutput.deviceID,
                        "facilityName": deviceOutput.deviceName,
                        "description": deviceOutput.description,
                        "isSelected": false,
                    }
                    facilities.push(facility);
                }
                resolve(facilities);
            });
        });
    }
}