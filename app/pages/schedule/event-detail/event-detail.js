import {IonicApp, Page, NavController, NavParams} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {ScheduleService} from '../../../providers/schedule-service';

import {Util} from '../../../utils/util';

@Page({
    templateUrl: 'build/pages/schedule/event-detail/event-detail.html',
    providers: [
        ScheduleService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class EventDetailPage {
    static get parameters() {
        return [[IonicApp], [NavController], [NavParams], [ScheduleService]];
    }

    constructor(app, nav, params, scheduleService) {
        this.app = app;
        this.nav = nav;
        this.params = params;
        this.scheduleService = scheduleService;
        this.event = this.params.get("event");
        this.eventId = this.event.eventID;
        this.isLoadCompleted = false;
        this.getEventByEventId();
    }

    getEventByEventId() {
        this.scheduleService.getEventByEventId(this.eventId).then(event => {
            this.isAllDay = event.isAllDay;
            this.isRepeat = event.isRepeat;
            let repeatRule = event.repeatRule;

            this.setRepeatContentsByRepeatRule(repeatRule);

            this.startDay = moment(event.startTime, "X").format("LL");
            this.startDateAndWeekDay = moment(event.startTime, "X").format("LLdddd");
            this.startWeekDayMin = moment.weekdaysMin(true)[moment(event.startTime, "X").format("d")];
            this.startTime = moment(event.startTime, "X").format("HH:mm");
            this.endDay = moment(event.endTime, "X").format("LL");
            this.endDateAndWeekDay = moment(event.endTime, "X").format("LLdddd");
            this.endWeekDayMin = moment.weekdaysMin(true)[moment(event.endTime, "X").format("d")];
            this.endTime = moment(event.endTime, "X").format("HH:mm");

            let deviceIds = event.deviceID;
            if (deviceIds) {
                this.scheduleService.getDevicesByDeviceIds(deviceIds).then(deviceNames => {
                    this.deviceNames = deviceNames;
                });
            }

            let visibility = event.visibility;
            this.setVisibilityTypeNameByVisibility(visibility);
            this.categoryID = event.categoryID;
            this.scheduleService.getCategoryNameByCategoryId(event.categoryID).then(categoryName => {
                this.categoryName = categoryName;
            });
            this.title = event.title;
            this.location = event.location;
            this.summary = event.summary;
            this.createDateTime = moment(event.createDate).format("LL HH:MM:SS");
            this.updateUserID = event.updateUserID;
            this.updateUserName = event.updateUserName;
            this.updateDateTime = moment(event.updateDate).format("LL HH:MM:SS");

            let participants = event.Participant;
            this.setParticipantNames(participants);
            this.isLoadCompleted = true;
        });
    }

    setRepeatContentsByRepeatRule(repeatRule) {
        if (repeatRule) {
            let repeatRules = repeatRule.split(";");
            this.repeatType = repeatRules[0];
            let repeatValue = repeatRules[1];
            this.repeatStartTime = repeatRules[2].substr(0, 2) + ":" + repeatRules[2].substr(2, 4);
            this.repeatEndTime = repeatRules[3].substr(0, 2) + ":" + repeatRules[3].substr(2, 4)
            if (this.repeatType == "DAILY") {
                this.app.translate.get('app.date.daily').subscribe(message => {
                    this.repeatTypeName = message;
                    this.repeatValueName = "";
                });
            } else if (this.repeatType == "WEEKLY") {
                this.app.translate.get('app.date.weeekly').subscribe(message => {
                    this.repeatTypeName = message;
                    this.repeatValueName = moment.weekdays(true)[Number(repeatValue)]
                });
            } else if (this.repeatType == "MONTHLY") {
                this.app.translate.get('app.date.monthly', 'app.date.day').subscribe(message => {
                    this.repeatTypeName = message['app.date.monthly'];
                    this.repeatValueName = repeatValue + ['app.date.day']
                });
            }
        }
    }

    setVisibilityTypeNameByVisibility(visibility) {
        if (visibility == "public") {
            this.app.translate.get('app.schedule.public').subscribe(message => {
                this.visibilityTypeName = message;
            });
        } else if (visibility == "private") {
            this.app.translate.get('app.schedule.private').subscribe(message => {
                this.visibilityTypeName = message;
            });
        } else if (visibility == "confidential") {
            this.app.translate.get('app.schedule.confidential').subscribe(message => {
                this.visibilityTypeName = message;
            });
        }
    }

    setParticipantNames(participants) {
        this.participantNames = new Array();
        if (Array.isArray(participants)) {
            for (let i = 0; i < participants.length; i++) {
                this.participantNames.push(participants[i].userName);
            }
        } else {
            this.participantNames.push(participants.userName);
        }

    }
}
