// Third party library.
import {Component} from '@angular/core';
import {NavController, Content, Alert, Modal, ViewController, NavParams} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Config.
import {AppConfig} from '../../../appconfig';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ScheduleService} from '../../../providers/schedule-service';
import {UserService} from '../../../providers/user-service';

// Pages.
import {SelectParticipantsPage} from '../select-participants/select-participants';
import {SelectDevicesPage} from '../select-devices/select-devices';

import * as moment from 'moment';

@Component({
    templateUrl: 'build/pages/schedule/edit-event/edit-event.html',
    providers: [ScheduleService,
        UserService,
        Util,
        SelectParticipantsPage,
        SelectDevicesPage]
})

export class EditEventPage {
    private visibilityPublic: string;
    private visibilityConfidential: string;
    private visibilityPrivate: string;
    private visibilities: any;
    private repeatEveryDay: string;
    private repeatEveryWeek: string;
    private repeatEveryMonth: string;
    private weeklySelections: any;
    private monthlySelections: any;
    private repeatRules: any;
    private categories: any;
    private selectedRepeatRules: any;
    private isFromRepeatToSpecial: string;
    private isOriginalRepeat: boolean;
    private sendDataToEditEvent: any;
    private sendDataToAddEvent: any;
    private receivedData: any;
    private isNewEvent: boolean;
    private event: any;
    private participants: any;
    private startTime: any;
    private endTime: any;
    private repeatStartTime: any;
    private repeatEndTime: any;
    private devices: any;
    private warningTitle: string;
    private actionOk: string;
    private actionYes: string;
    private actionNo: string;
    private minDisplayDate: string = this.appConfig.get('DATETIME_YEAR_MONTH_DAY_MIN');
    private maxDisplayDate: string = this.appConfig.get('DATETIME_YEAR_MONTH_DAY_MAX');
    private minuteValues: string = this.appConfig.get('DATETIME_MINUTE_VALUES');

    constructor(private nav: NavController,
        private params: NavParams,
        private translate: TranslateService,
        private scheduleService: ScheduleService,
        private util: Util,
        private appConfig: AppConfig,
        private userService: UserService) {
        this.initTranslation();
        this.initData();
    }

    initTranslation() {
        this.translate.get(['app.schedule.visibility.public',
            'app.schedule.visibility.confidential',
            'app.schedule.visibility.private']).subscribe(message => {
                this.visibilityPublic = message['app.schedule.visibility.public'];
                this.visibilityConfidential = message['app.schedule.visibility.confidential'];
                this.visibilityPrivate = message['app.schedule.visibility.private'];
            });
        this.visibilities = [
            {
                value: 'public',
                description: this.visibilityPublic
            },
            {
                value: 'confidential',
                description: this.visibilityConfidential
            },
            {
                value: 'private',
                description: this.visibilityPrivate
            }
        ];
        this.translate.get(['app.schedule.repeatRules.daily',
            'app.schedule.repeatRules.weekly',
            'app.schedule.repeatRules.monthly']).subscribe(message => {
                this.repeatEveryDay = message['app.schedule.repeatRules.daily'];
                this.repeatEveryWeek = message['app.schedule.repeatRules.weekly'];
                this.repeatEveryMonth = message['app.schedule.repeatRules.monthly'];
            });
        this.weeklySelections = [];
        this.monthlySelections = [];

        for (let i = 1; i <= 7; i++) {
            let weekdayObject = {
                'value': i,
                'description': moment.weekdays(i)
            };
            this.weeklySelections.push(weekdayObject);
        }

        this.translate.get(['app.date.day']).subscribe(message => {
            let dayDescription = message['app.date.day'];

            for (let i = 1; i <= 31; i++) {
                let dateDescription = i + dayDescription;
                let dateObject = {
                    value: i,
                    description: dateDescription
                };
                this.monthlySelections.push(dateObject);
            }
        });

        this.repeatRules = [
            {
                value: 'DAILY',
                description: this.repeatEveryDay
            },
            {
                value: 'WEEKLY',
                description: this.repeatEveryWeek
            },
            {
                value: 'MONTHLY',
                description: this.repeatEveryMonth
            }
        ];
    }

    // Initial display data.
    initData() {
        this.scheduleService.getCategoryList().then(data => {
            // The 'action-sheet' option will be invalid, when the count of option over 6.
            this.categories = data;
            this.categories.unshift({
                categoryID: '',
                categoryName: '未選択'  // Adding a japanese select-option for the other data is japanese.
            });
        });
        this.selectedRepeatRules = {
            'rule': 'DAILY',
            'index': 1
        };
        this.isFromRepeatToSpecial = 'all';
        this.isOriginalRepeat = false;

        // Just to get event will get the 'event' action, not our schedule.
        this.sendDataToEditEvent = this.params.get('sendDataToEditEvent');
        this.sendDataToAddEvent = this.params.get('sendDataToAddEvent');

        if (this.sendDataToEditEvent) {
            this.receivedData = {
                'eventID': this.sendDataToEditEvent.eventID,
                'selectedDay': this.sendDataToEditEvent.selectedDay
            };
            this.event = {
                eventID: this.receivedData.eventID
            };
            this.getEventByEventID(this.event.eventID);
        } else {
            this.setDefaultDataForNewEvent();
        }
    }

    getEventByEventID(eventID) {
        this.isNewEvent = false;
        this.scheduleService.getEventByEventID(eventID).then((event: any) => {
            this.event = event;
            this.participants = event.Participant;

            if (this.event.isAllDay === 'true') {
                this.event.isAllDay = true;
            } else {
                this.event.isAllDay = false;
            }
            if (this.event.isRepeat === 'true') {
                this.event.isRepeat = true;
                this.isOriginalRepeat = true;
                this.event.parentEventID = this.event.eventID;
                this.transRepeatRuleToPerformanceData(event.repeatRule);
            } else {
                this.event.isRepeat = false;
                this.startTime = moment.unix(event.startTime).format();
                this.endTime = moment.unix(event.endTime).format();
            }
            this.getDevicesByDeviceIDs(event.deviceID);
            // To set some default value for updating data.
            this.event.isDeviceRepeatWarned = false;
            this.event.isEventRepeatWarned = false;
            this.event.isFromRepeatToSpecial = false;
        });
    }

    transRepeatRuleToPerformanceData(repeatRule) {
        let repeatRuleArray = repeatRule.split(';');
        this.selectedRepeatRules = {
            'rule': repeatRuleArray[0],
            'index': parseInt(repeatRuleArray[1])
        };
        this.repeatStartTime = {
            hour: repeatRuleArray[2].substring(0, 2),
            minute: repeatRuleArray[2].substring(2, 4)
        };
        this.repeatEndTime = {
            hour: repeatRuleArray[3].substring(0, 2),
            minute: repeatRuleArray[3].substring(2, 4)
        };
        this.startTime = moment.unix(this.event.startTime);
        this.endTime = moment.unix(this.event.endTime);
        this.startTime = moment(this.startTime).hour(this.repeatStartTime.hour).minute(this.repeatStartTime.minute).format();
        this.endTime = moment(this.endTime).hour(this.repeatEndTime.hour).minute(this.repeatEndTime.minute).format();

        let specialStartTime = moment(this.receivedData.selectedDay).hour(this.repeatStartTime.hour).minute(this.repeatStartTime.minute).format();
        let specialEndTime = moment(this.receivedData.selectedDay).hour(this.repeatEndTime.hour).minute(this.repeatEndTime.minute).format();
        this.event.oldStartTime = moment(specialStartTime).unix();
        this.event.oldEndTime = moment(specialEndTime).unix();

        // set rule-index to 1, when the repeat rule is everyday.
        if (this.selectedRepeatRules.index === 0) {
            this.selectedRepeatRules.index = 1;
        }
    }

    getDevicesByDeviceIDs(deviceIDs) {
        // this.devices = [];
        let deviceIDArray = deviceIDs.split(',');
        this.scheduleService.getDeviceListByDeviceIDs(deviceIDs).then((data: any) => {
            this.devices = data;
        });
    }

    setDefaultDataForNewEvent() {
        this.isNewEvent = true;
        // 開始時間をただいまの時間に設定します。
        let now = moment().format();
        this.setEndTimeHalfHourLater(now);
        // Used to page performance and sava data.
        this.userService.getUserDetails().then(user => {
            this.participants = [
                {
                    'userID': user.userID,
                    'userName': user.userName
                }];
        });

        // Just used to page performance.
        this.devices = [];
        // The data object of update, but be used when add new event.
        this.event = {
            'eventID': '',
            'categoryID': '',
            'isAllDay': false,
            'isRepeat': false,
            'repeatRule': '',
            'startTime': '',
            'endTime': '',
            'deviceID': '',
            'visibility': 'public',
            'isReminder': '',
            'reminderRule': '',
            'title': '',
            'summary': '',
            'location': '',
            'status': '',
            'isDeviceRepeatWarned': false,
            'isEventRepeatWarned': false,
            'parentEventID': '',
            'oldStartTime': '',
            'oldEndTime': '',
            'isFromRepeatToSpecial': ''
        };
    }

    setEndTimeHalfHourLater(time) {
        let currentMinutes = time.substring(14, 16);
        let startMinutes = currentMinutes;
        if (currentMinutes < 10) {
            startMinutes = 0;
        } else if (currentMinutes < 20) {
            startMinutes = 15;
        } else if (currentMinutes < 40) {
            startMinutes = 30;
        } else if (currentMinutes < 50) {
            startMinutes = 45;
        } else {
            startMinutes = 0;
        }

        if (currentMinutes >= 50) {
            this.startTime = moment(time).minute(startMinutes).add(1, 'hours').format();
            startMinutes = 60;
        } else {
            this.startTime = moment(time).minute(startMinutes).format();
        }

        let endMinutes = startMinutes + 30;
        if (endMinutes < 60) {
            this.endTime = moment(time).minute(endMinutes).format();
        } else {
            endMinutes = endMinutes - 60;
            this.endTime = moment(time).minute(endMinutes).add(1, 'hours').format();
        }
    }

    // Q: Did we need to show warnning when the user is editing?
    // Q: And change the endTime half hour after startTime auto?
    // changeEndTime() {
    //   if(this.endTime < this.startTime) {
    //       this.app.translate.get(['app.message.error.title', 'app.schedule.editEvent.error.endTimeBigger', 'app.action.ok']).subscribe(message => {
    //                 let title = message['app.message.error.title'];
    //                 let ok = message['app.action.ok'];
    //                 let content = message['app.schedule.editEvent.error.endTimeBigger'];

    //                 let alert = Alert.create({
    //                     title: title,
    //                     subTitle: content,
    //                     buttons: [
    //                         {
    //                             text: ok,
    //                             handler: () => {
    //                                 this.setEndTimeHalfHourLater(this.startTime);
    //                             }
    //                         }]
    //                 });
    //                 this.nav.present(alert);
    //             });
    //     }
    // }

    changeRepeatEventUpdateFlag() {
        if (this.isFromRepeatToSpecial === 'all') {
            this.event.isFromRepeatToSpecial = false;
            this.event.isRepeat = true;
            this.startTime = moment.unix(this.event.startTime);
            this.endTime = moment.unix(this.event.endTime);
            this.startTime = moment(this.startTime).hour(this.repeatStartTime.hour).minute(this.repeatStartTime.minute).format();
            this.endTime = moment(this.endTime).hour(this.repeatEndTime.hour).minute(this.repeatEndTime.minute).format();
        } else {
            this.event.isFromRepeatToSpecial = true;
            this.event.isRepeat = false;
            this.startTime = moment.unix(this.event.oldStartTime).format();
            this.endTime = moment.unix(this.event.oldEndTime).format();
        }
    }

    changeIsAllDay(isAllDay) {
        if (isAllDay && this.event.isRepeat) {
            this.event.isRepeat = false;
        }
    }

    changeIsRepeat(isRepeat) {
        if (isRepeat && this.event.isAllDay) {
            this.event.isAllDay = false;
        }
    }

    // Calling the sub-page to select the paticipants.
    chooseParticipants() {
        let participantsModal = Modal.create(SelectParticipantsPage, { 'participants': this.participants });
        participantsModal.onDismiss(data => {
            this.participants = data;
        });
        this.nav.present(participantsModal);
    }

    // Calling the sub-page to select the devices.
    chooseDevices() {
        let devicesModal = Modal.create(SelectDevicesPage, { 'devices': this.devices });
        devicesModal.onDismiss(data => {
            this.devices = data;
            this.event.deviceID = '';
            for (let i = 0; i < data.length; i++) {
                this.event.deviceID += data[i].deviceID;
                if (i !== (data.length - 1)) {
                    this.event.deviceID += ',';
                }
            }
        });
        this.nav.present(devicesModal);
    }

    saveEvent() {
        this.getTransInfoForDisplayAlert();
        this.createSaveData().then(completed => {
            if (completed) {
                let isOk = this.checkBeforeSave();
                if (isOk) {
                    if (this.event.eventID === '') {
                        this.addEvent();
                    } else {
                        this.updateEvent();
                    }
                }
            }
        });
    }

    getTransInfoForDisplayAlert() {
        this.translate.get([
            'app.message.warning.title',
            'app.action.yes',
            'app.action.no']).subscribe(message => {
                this.warningTitle = message['app.message.warning.title'];
                this.actionYes = message['app.action.yes'];
                this.actionNo = message['app.action.no'];
            });
    }

    createSaveData() {
        return new Promise(resolve => {
            let saveStartTime: number;
            let saveEndTime: number;
            this.event.repeatRule = '';
            if (this.event.isRepeat) {
                saveStartTime = moment(this.startTime).hour(0).minute(0).second(0).unix();
                saveEndTime = moment(this.endTime).hour(0).minute(0).second(0).add(1, 'd').add(-1, 's').unix();

                this.event.repeatRule += this.selectedRepeatRules.rule;
                this.event.repeatRule += ';';
                if (this.selectedRepeatRules.rule === 'DAILY') {
                    this.event.repeatRule += '0;';
                } else {
                    this.event.repeatRule += this.selectedRepeatRules.index;
                    this.event.repeatRule += ';';
                }
                let repeatStartTime = moment(this.startTime).format('HHmm');
                let repeatEndTime = moment(this.endTime).format('HHmm');
                this.event.repeatRule += repeatStartTime;
                this.event.repeatRule += ';';
                this.event.repeatRule += repeatEndTime;
            } else if (this.event.isAllDay) {
                saveStartTime = moment(this.startTime).hour(0).minute(0).second(0).unix();
                saveEndTime = moment(this.endTime).hour(0).minute(0).second(0).add(1, 'd').add(-1, 's').unix();
            } else {
                saveStartTime = moment(this.startTime).second(0).unix();
                saveEndTime = moment(this.endTime).second(0).unix();
            }
            if (this.isOriginalRepeat && (this.isFromRepeatToSpecial === 'all')) {
                this.event.parentEventID = '';
                this.event.oldStartTime = '';
                this.event.oldEndTime = '';
            }
            this.event.startTime = saveStartTime;
            this.event.endTime = saveEndTime;
            resolve(true);
        });
    }

    checkBeforeSave() {
        if (!this.checkTitle()) {
            return false;
        }
        if (!this.checkTime()) {
            return false;
        }
        return true;
    }


    checkTitle() {
        if (!this.event.title && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.event.title) === '') {
            this.translate.get(['app.schedule.editEvent.message.eventTitleNecessary']).subscribe(message => {
                let errMsg = message['app.schedule.editEvent.message.eventTitleNecessary'];

                this.showError(errMsg);
            });
            return false;
        }
        return true;
    }

    checkTime() {
        if (this.event.isRepeat) {
            let repeatStartTime = moment(this.startTime).format('HHmm');
            let repeatEndTime = moment(this.endTime).format('HHmm');
            if (repeatStartTime >= repeatEndTime) {
                this.translate.get(['app.schedule.editEvent.message.repeatEndTimeShouldBeLater']).subscribe(message => {
                    let errMsg = message['app.schedule.editEvent.message.repeatEndTimeShouldBeLater'];

                    this.showError(errMsg);
                });
                return false;
            }
        }
        if (this.event.startTime >= this.event.endTime) {
            this.translate.get(['app.schedule.editEvent.message.endTimeShouldBeLater']).subscribe(message => {
                let errMsg = message['app.schedule.editEvent.message.endTimeShouldBeLater'];

                this.showError(errMsg);
            });
            return false;
        }
        return true;
    }

    addEvent() {
        this.scheduleService.addEvent(this.event, this.participants).then(data => {
            if (data === 'true') {
                this.sendDataToAddEvent.isRefreshFlag = true;
                this.nav.pop();
            } else {
                this.showError(data);
            }
        }, err => {
            let errMsg = err.faultstring;
            let faultCode = err.faultcode;
            if ((faultCode.indexOf('WARN002') > -1) || (faultCode.indexOf('WARN001') > -1)) {
                errMsg = this.convertWarningMessage(errMsg);
                this.confirmRepeatWarn(this.warningTitle, errMsg, this.actionYes, this.actionNo, faultCode, 'addEvent');
            } else {
                this.showError(errMsg);
            }
        });
    }

    updateEvent() {
        this.scheduleService.updateEvent(this.event, this.participants).then(data => {
            if (data === 'true') {
                this.sendDataToEditEvent.isRefreshFlag = true;
                this.nav.pop();
            } else {
                this.showError(data);
            }
        }, err => {
            let errMsg = err.faultstring;
            let faultCode = err.faultcode;
            if ((faultCode.indexOf('WARN002') > -1) || (faultCode.indexOf('WARN001') > -1)) {
                errMsg = this.convertWarningMessage(errMsg);

                this.confirmRepeatWarn(this.warningTitle, errMsg, this.actionYes, this.actionNo, faultCode, 'updateEvent');
            } else {
                this.showError(errMsg);
            }
        });
    }

    convertWarningMessage(oldMessage) {
        // oldMessage:
        // '下記の参加者は既に同じ時間帯の予定が入っています。<br/>王　茜: 1469412000~1469416500;スケジュールを登録しますか？'
        let aMessages = oldMessage.split(';');
        let newMessage = '';
        for (let i = 0; i < aMessages.length - 1; i++) {
            let sWarningName = aMessages[i].split(': ')[0];
            let sStartEnd = aMessages[i].split(': ')[1];
            let sStart = sStartEnd.split('~')[0];
            let sEnd = sStartEnd.split('~')[1];
            newMessage += sWarningName + ': ' + moment.unix(sStart).format('YYYY/MM/DD HH:mm')
                + ' ~ ' + moment.unix(sEnd).format('YYYY/MM/DD HH:mm') + '<br/>';
        }
        newMessage += aMessages[aMessages.length - 1];
        // newMessage: 
        // 下記の参加者は既に同じ時間帯の予定が入っています。<br/>王　茜: 2016/07/14 08:45 ~ 2016/07/14 09:15<br/>スケジュールを登録しますか？'
        return newMessage;
    }

    confirmRepeatWarn(title, content, yes, no, faultCode, type) {
        let alert = Alert.create({
            title: title,
            subTitle: content,
            buttons: [{
                text: yes,
                handler: () => {
                    if (faultCode.indexOf('WARN002') > -1) {
                        // The same people had have scheduling at selected peroid.
                        this.event.isDeviceRepeatWarned = false;
                        this.event.isEventRepeatWarned = true;
                    } else if (faultCode.indexOf('WARN001') > -1) {
                        // The same device had been used at selected peroid.
                        this.event.isDeviceRepeatWarned = true;
                        this.event.isEventRepeatWarned = true;
                    }
                    if (type === 'addEvent') {
                        this.addEvent();
                    } else {
                        this.updateEvent();
                    }
                }
            }, {
                    text: no
                }]
        });
        this.nav.present(alert);
    }

    showError(errorMessage) {
        this.util.presentModal(errorMessage);
    }
}