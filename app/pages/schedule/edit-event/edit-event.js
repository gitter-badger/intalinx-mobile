import {Page, IonicApp, NavController, Content, Alert, Modal, ViewController, NavParams} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

// import {DatePicker} from 'ionic-native';
import {ScheduleService} from '../../../providers/schedule-service';
import {Util} from '../../../utils/util';

import {SelectParticipantsPage} from '../select-participants/select-participants'
import {SelectFacilitiesPage} from '../select-facilities/select-facilities'

@Page({
  templateUrl: 'build/pages/schedule/edit-event/edit-event.html',
  providers: [ScheduleService,
              Util,
              SelectParticipantsPage,
              SelectFacilitiesPage],
  pipes: [TranslatePipe]
})
export class EditEventPage {
  static get parameters() {
    return [[IonicApp], [NavController], [NavParams], [ScheduleService], [Util]];
  }

  constructor(app, nav, params, scheduleService, util) {
      this.app = app;
      this.nav = nav;
      this.params = params;
      this.scheduleService = scheduleService;
      this.util = util;
      
      this.event = {
          "eventID": "",
          "categoryID": "100001", 
          "isAllDay": false,
          "isRepeat": false, 
          "repeatRule": "", 
          "startTime": "",
          "endTime": "", 
          "deviceID": "", 
          "visibility": "public",
          "isReminder": "", 
          "reminderRule": "", 
          "title": "", 
          "summary": "", 
          "location": "", 
          "status": "", 
          "isDeviceRepeatWarned": false, 
          "isEventRepeatWarned": false, 
          "parentEventID": "",
          "oldStartTime": "", 
          "oldEndTime": "", 
          "isFromRepeatToSpecial": ""
      }
      this.startTime = "";
      this.endTime = "";
      // Used to page performance and sava data.
      this.participants = [
                {
                    "userId": "100072", 
                    "userName": "王　茜",
                    "avator" : ""
                }];
      // Just used to page performance.
      this.facilities = [];
      
      this.initTranslation();
      this.initData();
  }
  
    initTranslation() {
        this.app.translate.get(["app.schedule.editEvent.visibility.public", 
                                "app.schedule.editEvent.visibility.limitPublic", 
                                "app.schedule.editEvent.visibility.private"]).subscribe(message => {
            this.visibilityPublic =  message["app.schedule.editEvent.visibility.public"];
            this.visibilityLimitPublic = message["app.schedule.editEvent.visibility.limitPublic"];
            this.visibilityPrivate = message["app.schedule.editEvent.visibility.private"];
        });
        this.visibilities = [
            {
                value: "public",
                description: this.visibilityPublic
            },
            {
                value: "limitPublic",
                description: this.visibilityLimitPublic
            },
            {
                value: "private",
                description: this.visibilityPrivate
            }
        ];
        this.app.translate.get(["app.schedule.editEvent.repeatRules.everyDay", 
                                "app.schedule.editEvent.repeatRules.everyWeek", 
                                "app.schedule.editEvent.repeatRules.everyMonth"]).subscribe(message => {
            this.repeatEveryDay =  message["app.schedule.editEvent.repeatRules.everyDay"];
            this.repeatEveryWeek = message["app.schedule.editEvent.repeatRules.everyWeek"];
            this.repeatEveryMonth = message["app.schedule.editEvent.repeatRules.everyMonth"];
        });
        this.weeklySelections = [];
        this.monthlySelections = [];
        for(var i = 1 ; i <= 7; i++) {
            let weekdayObject = {
                "value": i,
                "description": moment.weekdays(i)
            };
            this.weeklySelections.push(weekdayObject);
        }
        this.app.translate.get(["app.date.day"]).subscribe(message => {
            let dayDescription = message["app.date.day"];
            for(var i = 1 ; i <= 31; i++) {
                let dateDescription = i + dayDescription;
                let dateObject = {
                    "value": i,
                    "description": dateDescription
                };
                this.monthlySelections.push(dateObject);
            }
        });
        
        this.repeatRules = [
            {
                value: "DAILY",
                description: this.repeatEveryDay 
            },
            {
                value: "WEEKLY",
                description: this.repeatEveryWeek 
            },
            {
                value: "MONTHLY",
                description: this.repeatEveryMonth 
            }
        ];
    }
  
    // 画面初期化
    initData() {
        if(this.params.get("eventID")) {
            this.event.eventID = this.params.get("eventID");
        }
        // test repeat event
        // this.event.eventID = "de8bd87d-776a-48fc-a9e4-8ba2c1c92404"; 
        // test allDay event
        // this.event.eventID = "7d0b3991-4265-4bf8-81fc-b618d796c882"; 
        this.selectedRepeatRules = {
            "rule": "DAILY", 
            "index": 1
        }
        if(this.event.eventID && this.event.eventID != "") {
            this.isNewEvent = false;
            this.scheduleService.getEventByEventId(this.event.eventID).then(data => { 
                this.event = data.event;
                this.participants = data.participants;
                if(this.event.isAllDay == "true") {
                    this.event.isAllDay = true;
                } else {
                    this.event.isAllDay = false;
                }
                if(this.event.isRepeat == "true") {
                    this.event.isRepeat = true;
                    this.transRepeatRuleToPerformanceData(data.event.repeatRule);
                } else {
                    this.event.isRepeat = false;
                }
                this.event.isDeviceRepeatWarned = false;
                this.event.isEventRepeatWarned = false;
            });
        } else {
            this.isNewEvent = true;
            // 開始時間をただいまの時間に設定します。
            let now = moment().format();
            this.setEndTimeHalfHourLater(now);
        }
        
        this.scheduleService.getCategoryList().then(data => {
            this.categories = data;
        });
    }
    
    transRepeatRuleToPerformanceData(repeatRule) {
        let repeatRuleArray = repeatRule.split(";");
        this.selectedRepeatRules = {
            "rule": repeatRuleArray[0], 
            "index": parseInt(repeatRuleArray[1])
        }
        
        this.startTime = moment.unix(this.event.startTime);
        this.endTime = moment.unix(this.event.endTime);
        this.startTime = moment(this.startTime).hour(repeatRuleArray[2].substring(0,2)).minute(repeatRuleArray[2].substring(2,4)).format();
        this.endTime = moment(this.startTime).hour(repeatRuleArray[3].substring(0,2)).minute(repeatRuleArray[2].substring(3,4)).format(); 
        
        // set rule-index to 1, when the repeat rule is everyday.
        if(this.selectedRepeatRules.index = 0) {
            this.selectedRepeatRules.index = 1;
        }
    }
    
    setEndTimeHalfHourLater(time) {
        let currentMinutes = time.substring(14,16);
        let startMinutes = currentMinutes;
        if(currentMinutes < 10) {
            startMinutes = 0;
        } else if(currentMinutes < 20) {
            startMinutes = 15;
        } else if(currentMinutes < 40) {
            startMinutes = 30;
        } else if(currentMinutes < 50) {
            startMinutes = 45;
        } else {
            startMinutes = 0;
        }
        
        if(currentMinutes >= 50) {
            this.startTime = moment(time).minute(startMinutes).add(1, "hours").format();
            startMinutes = 60;
        } else {
            this.startTime = moment(time).minute(startMinutes).format();;
        }
        
        let endMinutes = startMinutes + 30;
        if(endMinutes < 60) {
            this.endTime = moment(time).minute(endMinutes).format();
        } else {
            endMinutes = endMinutes - 60;
            this.endTime = moment(time).minute(endMinutes).add(1, "hours").format();
        }
    }
    
    changeStartTime() {
        this.setEndTimeHalfHourLater(this.event.startTime);
    }
    
    changeEndTime() {
      if(this.endTime < this.startTime) {
          this.app.translate.get(["app.message.error.title", "app.schedule.editEvent.error.endTimeBigger", "app.action.ok"]).subscribe(message => {
                    let title = message['app.message.error.title'];
                    let ok = message['app.action.ok'];
                    let content = message['app.schedule.editEvent.error.endTimeBigger'];

                    let alert = Alert.create({
                        title: title,
                        subTitle: content,
                        buttons: [
                            {
                                text: ok,
                                handler: () => {
                                    this.setEndTimeHalfHourLater(this.event.startTime);
                                }
                            }]
                    });
                    this.nav.present(alert);
                });
      }
    }
    
    changeIsAllDay() {
        if(this.event.isRepeat) {
            if(this.event.isAllDay) {
                this.event.isRepeat = false;
            }
        }
      }
    
    changeIsRepeat() {
        if(this.event.isAllDay) {
            if(this.event.isRepeat) {
                this.event.isAllDay = false;
            }
        }
    }
    
    // 予定参加者の選択
    chooseParticipant() {
        let participantsModal = Modal.create(SelectParticipantsPage);
        participantsModal.onDismiss(data => {
            // virtual data for test. 
            data = [
                {
                    "userID": "111147", 
                    "userName": "王　茜"
                }, 
                {
                    "userID": "xiaoyu@intasect.com.cn",     
                    "userName": "肖　昱"
                }
                ];
            this.participants = data;
        });
        this.nav.present(participantsModal);
    }
    
    // 使う施設の選択
    chooseFacility() {
        let facilitiesModal = Modal.create(SelectFacilitiesPage);
        facilitiesModal.onDismiss(data => { 
            // virtual data for test. 
            data = [
                {
                    "deviceID": "00010", 
                    "deviceName": "セミナールームA（3F）【TV会議あり】（倉庫側）"
                }
                ];
            this.facilities = data;
            this.event.deviceID = "";
            for(let i = 0; i < data.length; i++) {
                this.event.deviceID += data[i].deviceID;
                if(i != (data.length - 1)) {
                    this.event.deviceID += ",";
                }
            }
        });
        this.nav.present(facilitiesModal);
    }
    
    saveEvent() {
        this.createSaveData();
        let isOk = this.checkBeforeSave();
        if(isOk) {
            if(this.event.eventID == "") {
                this.addEvent();
            } else {
                this.updateEvent();
            }
        }
    }
    createSaveData() { 
        if(this.event.isRepeat || this.event.isAllDay) { 
            if(this.event.isRepeat) {
                this.event.repeatRule = "";
                this.event.repeatRule += this.selectedRepeatRules.rule;
                this.event.repeatRule += ";"; 
                
                if(this.selectedRepeatRules.rule == "DAILY") {
                    this.event.repeatRule += "0;";
                } else {
                    this.event.repeatRule += this.selectedRepeatRules.index;
                    this.event.repeatRule += ";"; 
                } 
                
                var repeatStartTime = moment(this.startTime).format("HHmm");
                var repeatEndTime = moment(this.endTime).format("HHmm");
                this.event.repeatRule += repeatStartTime;
                this.event.repeatRule += ";"; 
                this.event.repeatRule += repeatEndTime; 
            }
            
            var saveStartTime = moment(this.startTime).hour(0).minute(0).second(0).unix();
            var saveEndTime = moment(this.endTime).hour(0).minute(0).second(0).add(1, "d").add(-1, "s").unix();
            this.event.startTime = saveStartTime;
            this.event.endTime = saveEndTime;
        } else {
            var saveStartTime = moment(this.startTime).second(0).unix();
            var saveEndTime = moment(this.endTime).second(0).unix();
            this.event.startTime = saveStartTime;
            this.event.endTime = saveEndTime;
            this.event.repeatRule = "";
        }
    }
    
    checkBeforeSave() {
        if(!this.checkTitle()) {
            return false;
        }
        if(!this.checkTime()) {
            return false;
        }
        return true;
    }
    
    
    checkTitle() {
        if (!this.event.title && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.event.title) == "") {
            this.app.translate.get(["app.message.error.title", "app.schedule.editEvent.error.eventTitleNecessary", "app.action.ok"]).subscribe(message => {
                let title = message['app.message.error.title'];
                let ok = message['app.action.ok'];
                let content = message['app.schedule.editEvent.error.eventTitleNecessary'];

                let alert = Alert.create({
                    title: title,
                    subTitle: content,
                    buttons: [ok]
                });
                this.nav.present(alert);
            });
            return false;
        }
        return true;
    }
    
    checkTime() {
        if(this.event.startTime >= this.event.endTime) {
            this.app.translate.get(["app.message.error.title", "app.schedule.editEvent.error.eventTitleNecessary", "app.action.ok"]).subscribe(message => {
                let title = message['app.message.error.title'];
                let ok = message['app.action.ok'];
                // let content = message['app.schedule.editEvent.error.eventTitleNecessary'];
                let content = "終了時間は開始時間の前に設定してください";

                let alert = Alert.create({
                    title: title,
                    subTitle: content,
                    buttons: [ok]
                });
                this.nav.present(alert);
            });
            return false;
        }
        return true;
    }
    
    addEvent() {
        debugger
        this.scheduleService.addEvent(this.event, this.participants).then(data => {
           if(data == "true") {
               this.app.translate.get(["app.message.info.title", "app.schedule.editEvent.addEventSuccess", "app.action.ok"]).subscribe(message => {
                    let title = message['app.message.info.title'];
                    let ok = message['app.action.ok'];
                    let content = message['app.schedule.editEvent.addEventSuccess'];

                    let alert = Alert.create({
                        title: title,
                        subTitle: content,
                        buttons: [ok]
                    });
                    this.nav.present(alert);
                });
           } else {
               debugger
           }
        });
    }
    
    updateEvent() {
        debugger
    }
}