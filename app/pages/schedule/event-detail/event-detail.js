import {Page, NavController, NavParams} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {ScheduleService} from '../../../providers/schedule-service';

import {Util} from '../../../utils/util';

/*
  Generated class for the EventDetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
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
        return [[NavController], [NavParams], [ScheduleService]];
    }

    constructor(nav, params, scheduleService) {
        this.nav = nav;
        this.params = params;
        this.scheduleService = scheduleService;
        this.event = this.params.get("event");
        this.eventId = this.event.eventID;
        this.getEventByEventId();
    }

    getEventByEventId() {
        this.scheduleService.getEventByEventId(this.eventId).then(event => {
            this.isAllDay = event.isAllDay;
            this.isRepeat = event.isRepeat;
            let repeatRule = event.repeatRule;

            this.setRepeatContentsByRepeatRule(repeatRule);

            this.startDay = moment(event.startTime, "X").format("LL");//
            this.startDateAndWeekDay = moment(event.startTime, "X").format("LLdddd");
            this.startWeekDayMin = moment.weekdaysMin(true)[moment(event.startTime, "X").format("d")];
            this.startTime = moment(event.startTime, "X").format("HH:mm");//
            this.endDay = moment(event.endTime, "X").format("LL");//
            this.endDateAndWeekDay = moment(event.endTime, "X").format("LLdddd");
            this.endWeekDayMin = moment.weekdays(true)[moment(event.endTime, "X").format("d")];
            this.endTime = moment(event.endTime, "X").format("HH:mm");//

            let deviceIds = event.deviceID;
            debugger
            this.scheduleService.getDevicesByDeviceIds(deviceIds).then(deviceNames => {
                this.deviceNames = deviceNames;
            });
            
            let visibility = event.visibility;
            this.setVisibilityTypeNameByVisibility(visibility);
            this.categoryID = event.categoryID;
            this.scheduleService.getCategoryNameByCategoryId(event.categoryID).then(categoryName => {
                this.categoryName = categoryName;
            });
            this.title = event.title;
            this.location = event.location;
            this.summary = event.summary;
            this.status = event.status;
            this.isReminder = event.isReminder;
            this.reminderRule = event.reminderRule;
            this.createUserID = event.createUserID;
            this.createUserName = event.createUserName;
            this.createDateTime = moment(event.createDate, "X").format("LL HH:MM:SS");
            this.updateUserID = event.updateUserID;
            this.updateUserName = event.updateUserName;
            this.updateDateTime = moment(event.updateDate, "X").format("LL HH:MM:SS");

            let participants = event.Participant;
            this.participantNames = new Array();
            for (let i = 0; i < participants.length; i++) {
                this.participantNames.push(participants[i].userName);
            }
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
                this.repeatTypeName = "毎日";
                this.repeatValueName = "";
            } else if (this.repeatType == "WEEKLY") {
                this.repeatTypeName = "毎週";
                this.repeatValueName = moment.weekdays(true)[Number(repeatValue)]
            } else if (this.repeatType == "MONTHLY") {
                this.repeatTypeName = "毎月";
                this.repeatValueName = repeatValue + "日";
            }
        }
    }

    setVisibilityTypeNameByVisibility(visibility) {
        if (visibility == "public") {
            this.visibilityTypeName = "一般公開";
        } else if (visibility == "private") {
            this.visibilityTypeName = "限定公開";
        } else if (visibility == "confidential") {
            this.visibilityTypeName = "非公開";
        }
    }




}
