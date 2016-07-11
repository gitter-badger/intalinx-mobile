import {Page, IonicApp, NavController, Content, Alert, Modal, ViewController, NavParams} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

// import {DatePicker} from 'ionic-native';
import {ScheduleService} from '../../../providers/schedule-service';
import {Util} from '../../../utils/util';

import {SelectParticipantsPage} from '../select-participants/select-participants'

@Page({
  templateUrl: 'build/pages/schedule/edit-event/edit-event.html',
  providers: [ScheduleService,
              Util,
              SelectParticipantsPage],
  pipes: [TranslatePipe]
})
export class EditEventPage {
  static get parameters() {
    return [[IonicApp], [NavController], [NavParams], [ScheduleService], [Util]];
  }

  constructor(app, nav, params, schedule, util) {
      this.app = app;
      this.nav = nav;
      this.params = params;
      this.schedule = schedule;
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
          "visibility": "private",
          "isReminder": "", 
          "reminderRule": "", 
          "title": "", 
          "summary": "", 
          "location": "", 
          "status": "", 
          "isDeviceRepeatWarned": "", 
          "isEventRepeatWarned": "", 
          "parentEventID": "",
          "oldStartTime": "", 
          "oldEndTime": "", 
          "isFromRepeatToSpecial": ""
      }
      this.participants = [];
      if(this.params.get("eventID")) {
          this.event.eventID = this.params.get("eventID");
      }
      // for test
      // this.event.eventID = "test";
      this.initControl();
      this.initTranslation();
      this.initData();
      this.repeatTime = "everyDay";
  }
  
    initControl() {
        if(this.event.eventID && this.event.eventID != "") {
            this.isNewEvent = false;
        } else {
            this.isNewEvent = true;
        }
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
        this.repeatRules = [
            {
                value: "everyDay",
                description: this.repeatEveryDay
            },
            {
                value: "everyWeek",
                description: this.repeatEveryWeek
            },
            {
                value: "everyMonth",
                description: this.repeatEveryMonth
            }
        ];
    }
  
  // 画面初期化
    initData() {
        // 開始時間をただいまの時間に設定します。
        let now = moment().format();
        this.setEndTimeHalfHourLater(now);
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
            this.event.startTime = moment(time).minute(startMinutes).add(1, "hours").format();
            startMinutes = 60;
        } else {
            this.event.startTime = moment(time).minute(startMinutes).format();;
        }
        
        let endMinutes = startMinutes + 30;
        if(endMinutes < 60) {
            this.event.endTime = moment(time).minute(endMinutes).format();;
        } else {
            endMinutes = endMinutes - 60;
            this.event.endTime = moment(time).minute(endMinutes).add(1, "hours").format();
        }
    }
    
    changeStartTime() {
        this.setEndTimeHalfHourLater(this.event.startTime);
    }
    
    changeEndTime() {
      if(this.event.endTime < this.event.startTime) {
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
    changeTitle() {
        if (!this.event.title && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.event.title) == "") {
            this.app.translate.get(["app.message.warning.title", "app.schedule.editEvent.error.eventTitleNecessary", "app.action.ok"]).subscribe(message => {
                    let title = message['app.message.warning.title'];
                    let ok = message['app.action.ok'];
                    let content = message['app.schedule.editEvent.error.eventTitleNecessary'];

                    let alert = Alert.create({
                        title: title,
                        subTitle: content,
                        buttons: [ok]
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
            this.event.participant = data;
        });
        this.nav.present(participantsModal);
    }
    
    // 使う施設の選択
    chooseDevice() {
        
    }
    
    saveEvent() {
        if(this.event.eventID != "") {
            this.addEvent();
        } else {
            this.updateEvent();
        }
    }
    
    addEvent() {
        
    }
    
    updateEvent() {
        
    }
}
