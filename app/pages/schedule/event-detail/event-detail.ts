// Third party library.
import {Component} from '@angular/core';
import {ActionSheetController, NavController, NavParams} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {GoogleAnalytics} from 'ionic-native';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ScheduleService} from '../../../providers/schedule-service';
import {UserService} from '../../../providers/user-service';

// Pages.
import {EditEventPage} from '../edit-event/edit-event';

import * as moment from 'moment';

@Component({
    templateUrl: 'build/pages/schedule/event-detail/event-detail.html',
    providers: [
        ScheduleService,
        UserService,
        Util
    ]
})

export class EventDetailPage {
    private sendDataToShowOrDeleteEvent: any;
    private eventID: string;
    private selectedDay: string;
    private isLoadCompleted: boolean;
    private sendDataToEditEvent: any;
    private isAllDay: string;
    private isRepeat: string;
    private eventStartTime: any;
    private eventEndTime: any;
    private startDay: any;
    private startDateAndWeekDay: any;
    private startWeekDayMin: any;
    private startTime: any;
    private endDay: any;
    private endDateAndWeekDay: any;
    private endWeekDayMin: any;
    private endTime: any;
    private categoryID: string;
    private deviceNames: any;
    private categoryName: string;
    private title: string;
    private location: string;
    private summary: string;
    private createUserName: string;
    private createDateTime: string;
    private updateUserID: string;
    private updateUserName: string;
    private updateDateTime: string;
    private participantNames: any;
    private repeatType: any;
    private repeatStartTime: string;
    private repeatEndTime: string;
    private repeatTypeName: string;
    private repeatValueName: string;
    private visibilityTypeName: string;

    private isAfterEditEvent: boolean;
    private isAdmin: boolean = false;
    private isParticiPant: boolean = false;

    constructor(private nav: NavController,
        private params: NavParams,
        private actionSheetCtrl: ActionSheetController,
        private translate: TranslateService,
        private scheduleService: ScheduleService,
        private userService: UserService) {

        this.sendDataToShowOrDeleteEvent = this.params.get('sendDataToShowOrDeleteEvent');
        this.eventID = this.sendDataToShowOrDeleteEvent.eventID;
        this.selectedDay = this.sendDataToShowOrDeleteEvent.selectedDay;
        this.isLoadCompleted = false;
        this.sendDataToEditEvent = {
            'eventID': this.eventID,
            'selectedDay': this.selectedDay,
            'isRefreshFlag': false,
            'isFromRepeatToSpecial': false
        };
        this.getEventByEventID();

        this.scheduleService.getIsAdmin().then((data: boolean) => {
            this.isAdmin = data;
        });
    }

    getEventByEventID() {
        this.scheduleService.getEventByEventID(this.eventID).then((event: any) => {
            this.isAllDay = event.isAllDay;
            this.isRepeat = event.isRepeat;
            let repeatRule = event.repeatRule;

            this.setRepeatContentsByRepeatRule(repeatRule);

            this.eventStartTime = event.startTime;
            this.eventEndTime = event.endTime;
            this.startDay = moment(event.startTime, 'X').format('LL');
            this.startDateAndWeekDay = moment(event.startTime, 'X').format('LLdddd');
            this.startWeekDayMin = moment.weekdaysMin(false)[moment(event.startTime, 'X').format('d')];
            this.startTime = moment(event.startTime, 'X').format('HH:mm');
            this.endDay = moment(event.endTime, 'X').format('LL');
            this.endDateAndWeekDay = moment(event.endTime, 'X').format('LLdddd');
            this.endWeekDayMin = moment.weekdaysMin(false)[moment(event.endTime, 'X').format('d')];
            this.endTime = moment(event.endTime, 'X').format('HH:mm');

            let deviceIDs = event.deviceID;
            if (deviceIDs) {
                this.scheduleService.getDevicesByDeviceIDs(deviceIDs).then(deviceNames => {
                    this.deviceNames = deviceNames;
                });
            }

            let visibility = event.visibility;
            this.setVisibilityTypeNameByVisibility(visibility);
            this.categoryID = event.categoryID;
            this.scheduleService.getCategoryNameByCategoryID(event.categoryID).then((categoryName: string) => {
                this.categoryName = categoryName;
            });
            this.title = event.title;
            this.location = event.location;
            this.summary = event.summary;
            this.createUserName = event.createUserName;
            this.createDateTime = moment(event.createDate).format('LL HH:mm:ss');
            this.updateUserID = event.updateUserID;
            this.updateUserName = event.updateUserName;
            this.updateDateTime = moment(event.updateDate).format('LL HH:mm:ss');

            let participants = event.Participant;
            this.isParticiPantMember(participants);
            this.setParticipantNames(participants);
            this.isLoadCompleted = true;
        });
    }

    setRepeatContentsByRepeatRule(repeatRule) {
        if (repeatRule) {
            let repeatRules = repeatRule.split(';');
            this.repeatType = repeatRules[0];
            let repeatValue = repeatRules[1];
            this.repeatStartTime = repeatRules[2].substr(0, 2) + ':' + repeatRules[2].substr(2, 4);
            this.repeatEndTime = repeatRules[3].substr(0, 2) + ':' + repeatRules[3].substr(2, 4);
            if (this.repeatType === 'DAILY') {
                this.translate.get('app.date.daily').subscribe(message => {
                    this.repeatTypeName = message;
                    this.repeatValueName = '';
                });
            } else if (this.repeatType === 'WEEKLY') {
                this.translate.get('app.date.weeekly').subscribe(message => {
                    this.repeatTypeName = message;
                    this.repeatValueName = moment.weekdays(false)[Number(repeatValue)];
                });
            } else if (this.repeatType === 'MONTHLY') {
                this.translate.get(['app.date.monthly', 'app.date.day']).subscribe(message => {
                    this.repeatTypeName = message['app.date.monthly'];
                    this.repeatValueName = repeatValue + message['app.date.day'];
                });
            }
        }
    }

    setVisibilityTypeNameByVisibility(visibility) {
        if (visibility === 'public') {
            this.translate.get('app.schedule.visibility.public').subscribe(message => {
                this.visibilityTypeName = message;
            });
        } else if (visibility === 'private') {
            this.translate.get('app.schedule.visibility.private').subscribe(message => {
                this.visibilityTypeName = message;
            });
        } else if (visibility === 'confidential') {
            this.translate.get('app.schedule.visibility.confidential').subscribe(message => {
                this.visibilityTypeName = message;
            });
        }
    }

    setParticipantNames(participants) {
        this.participantNames = new Array();
        for (let i = 0; i < participants.length; i++) {
            this.participantNames.push(participants[i].userName);
        }
    }

    isParticiPantMember(participants) {
        this.userService.getUserID().then((userID: string) => {
            for (let i = 0; i < participants.length; i++) {
                if (participants[i].userID === userID) {
                    this.isParticiPant = true;
                }
            }
        });
    }

    deleteEvent() {
        if (this.isRepeat === 'true') {
            this.presentDeleteRepeatEventActionSheet();
        } else {
            this.presentDeleteNotRepeatEventActionSheet();
        }
    }

    presentDeleteRepeatEventActionSheet() {
        this.translate.get(['app.schedule.deleteRepeatEvent.deleteEventOfSelectedDay',
            'app.schedule.deleteRepeatEvent.deleteAllEvents',
            'app.action.cancel']).subscribe(message => {
                let deleteEventOfSelectedDay = message['app.schedule.deleteRepeatEvent.deleteEventOfSelectedDay'];
                let deleteAllEvents = message['app.schedule.deleteRepeatEvent.deleteAllEvents'];
                let cancelButton = message['app.action.cancel'];
                let actionSheet = this.actionSheetCtrl.create({
                    buttons: [
                        {
                            text: deleteEventOfSelectedDay,
                            handler: () => {
                                let startTime = moment(this.selectedDay + ' ' + this.repeatStartTime).unix();
                                let endTime = moment(this.selectedDay + ' ' + this.repeatEndTime).unix();
                                this.deleteTheEvent(this.eventID, true, startTime, endTime);
                            }
                        }, {
                            text: deleteAllEvents,
                            handler: () => {
                                this.deleteTheEvent(this.eventID, false, '', '');
                            }
                        }, {
                            text: cancelButton,
                            handler: () => {

                            }
                        }
                    ]
                });
                actionSheet.present();
            });
    }

    presentDeleteNotRepeatEventActionSheet() {
        this.translate.get(['app.schedule.deleteEvent', 'app.action.cancel']).subscribe(message => {
            let deleteEvent = message['app.schedule.deleteEvent'];
            let cancelButton = message['app.action.cancel'];
            let actionSheet = this.actionSheetCtrl.create({
                buttons: [
                    {
                        text: deleteEvent,
                        handler: () => {
                            this.deleteTheEvent(this.eventID, false, '', '');
                        }
                    }, {
                        text: cancelButton,
                        handler: () => {

                        }
                    }
                ]
            });
            actionSheet.present();
        });
    }

    deleteTheEvent(eventID, isFromRepeatToSpecial, startTime, endTime) {
        this.scheduleService.deleteEvent(eventID, isFromRepeatToSpecial, startTime, endTime).then(data => {
            if (data === 'true') {
                this.sendDataToShowOrDeleteEvent.isRefreshFlag = true;
                setTimeout(() => {
                    this.nav.pop();
                    GoogleAnalytics.trackEvent('Schedule', 'delete', 'event');
                }, 500);
            }
        });
    }

    editEvent() {
        if (this.isRepeat === 'true') {
            this.presentEditRepeatEventActionSheet();
        } else {
            this.nav.push(EditEventPage, {
                'sendDataToEditEvent': this.sendDataToEditEvent
            });
        }
    }

    presentEditRepeatEventActionSheet() {
        this.translate.get(['app.schedule.editEvent.selectRepeatEventUpdateFlag',
            'app.schedule.editEvent.selectAll',
            'app.schedule.editEvent.selectSpecial',
            'app.action.cancel']).subscribe(message => {
                let selectRepeatEventUpdateFlag = message['app.schedule.editEvent.selectRepeatEventUpdateFlag'];
                let selectAll = message['app.schedule.editEvent.selectAll'];
                let selectSpecial = message['app.schedule.editEvent.selectSpecial'];
                let cancelButton = message['app.action.cancel'];
                let actionSheet = this.actionSheetCtrl.create({
                    title: selectRepeatEventUpdateFlag,
                    buttons: [
                        {
                            text: selectAll,
                            handler: () => {
                                this.sendDataToEditEvent.isFromRepeatToSpecial = false;
                                setTimeout(() => {
                                    this.nav.push(EditEventPage, {
                                        'sendDataToEditEvent': this.sendDataToEditEvent
                                    });
                                }, 500);
                            }
                        }, {
                            text: selectSpecial,
                            handler: () => {
                                this.sendDataToEditEvent.isFromRepeatToSpecial = true;
                                setTimeout(() => {
                                    this.nav.push(EditEventPage, {
                                        'sendDataToEditEvent': this.sendDataToEditEvent
                                    });
                                }, 500);
                            }
                        }, {
                            text: cancelButton
                        }
                    ]
                });
                actionSheet.present();
            });
    }

    ionViewWillEnter() {
        this.isAfterEditEvent = this.sendDataToEditEvent.isRefreshFlag;
        if (this.isAfterEditEvent === true) {
            this.isLoadCompleted = false;
            this.getEventByEventID();
        }
    }

    ionViewWillLeave() {
        if (this.isAfterEditEvent) {
            this.sendDataToShowOrDeleteEvent.isRefreshFlag = true;
        }
    }
}
