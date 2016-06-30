import {Page, IonicApp, NavController, ViewController, Platform} from 'ionic-angular';

import {NgForm, ngClass} from '@angular/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {ScheduleService} from '../../../providers/schedule/schedule-service/schedule-service';
import {UserService} from '../../../providers/user-service/user-service';

import {Util} from '../../../utils/util';
import {DateUtil} from '../../../utils/dateutil';

@Page({
    templateUrl: 'build/pages/schedule/month-calendar/month-calendar.html',
    providers: [
        ScheduleService,
        UserService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class MonthCalendarPage {
    static get parameters() {
        return [[IonicApp], [NavController], [ViewController], [Platform], [ScheduleService], [UserService]];
    }

    constructor(app, nav, view, platform, scheduleService, userService) {
        this.app = app;
        this.nav = nav;
        this.view = view;
        this.platform = platform;
        
        this.scheduleService = scheduleService;
        this.userService = userService;
        
        this.calendarSlideOptions = {
            direction: 'vertical'
            // ,
            // initialSlide: 0,
            // loop: true
        }
        
        this.weekdays = moment.weekdaysMin(true);
        this.today = moment().format('YYYY/MM/D');
        this.yearMonth = moment().format('YYYY-MM');
        //this month
        let firstDateWeek = moment(this.yearMonth);
        this.selectDay = this.today;
        
        this.days = new Array();
        
        this.searchEventsRequires = {
            "categoryID":  null,
            "isRepeat": null,
            "startTime": null,
            "endTime": null,
            "deviceID": null,
            "visibility": null,
            "title": null,
            "summary": null,
            "location": null,
            "timezone": null,
            "selType": null,
            "userId": null
        }
        this.searchHolidaysRequires = {
            "locale": null,
            "start": null,
            "end": null
        }
        this.userService.getUserId().then(userId => {
            this.searchEventsRequires.userId = userId;
            this.getLocalsFromSetting().then(local => {
                this.showCalendar(firstDateWeek);
            });
        });
    }
    
    changeCalendar(event) {
        let yearMonth = moment({
            y: event.year.value,
            M: event.month.value - 1});
        //selected month
        let firstDateWeek = moment(yearMonth);
        this.selectDay = firstDateWeek.format('YYYY/MM/D');
        this.showCalendar(firstDateWeek);
    }
    
    lastMonth() {
        this.yearMonth = moment(this.yearMonth).subtract(1, 'months').format('YYYY-MM');
        //last month
        let firstDateWeek = moment(this.yearMonth);
        this.selectDay = firstDateWeek.format('YYYY/MM/D');
        this.showCalendar(firstDateWeek);
    }
    
    nextMonth() {
        this.yearMonth = moment(this.yearMonth).add(1, 'months').format('YYYY-MM');
        //next month
        let firstDateWeek = moment(this.yearMonth);
        this.selectDay = firstDateWeek.format('YYYY/MM/D');
        this.showCalendar(firstDateWeek);
    }
    
    
    showCalendar(firstDateWeek) {
        //the quantity of days in selected month
        let daysInMonth = firstDateWeek.daysInMonth();
        //the weekday of the first day on this month
        let firstDayWeek = firstDateWeek.format('d');
        //weekdays
        let timeline = [];
        //calendar
        let calendar = [];
        
        //day and weekday
        for (let i=0; i<firstDayWeek; i++) {
            timeline.push(moment(firstDateWeek).subtract(firstDayWeek-i, 'days'));
        }
        for (let i=0; i<daysInMonth; i++) {
            timeline.push(moment(firstDateWeek).add(i, 'days'));
        }
        let lastDateWeek = moment(firstDateWeek).endOf('month').format('d');
        for (let i=0; i<6-lastDateWeek; i++) {
            timeline.push(moment(lastDateWeek).add(i, 'days'));
        }
        //calendar
        for (let i=0; i<Math.ceil(timeline.length/7); i++) {
            calendar[i] = timeline.slice(i*7, (i+1)*7);
        }
        this.calendar = calendar;
        
        this.searchEventsBySelectedDay(this.selectDay).then(data =>{
            if (data=="true") {
                this.searchEventsByDisplayedMonth();
            }
        });
        // this.getSpecialDays(this.selectDay);
    }
    
    searchEventsBySelectedDay(selectDay) {
         return new Promise(resolve => {
            this.selectDay = selectDay;
            let startTime = moment(selectDay).unix();
            let endTime = moment(selectDay).add(1, 'd').subtract('seconds', 1).unix();
            
            this.searchEventsRequires.startTime = startTime;
            this.searchEventsRequires.endTime = endTime;
            
            this.getSpecialDays(this.selectDay);

            this.scheduleService.searchEventsBySelectedDay(this.searchEventsRequires).then(data => {
                this.events = data;
                resolve("true");
            });
        });
    }
    
    searchEventsByDisplayedMonth() {
        let startTimeOfMonth = moment(this.yearMonth).unix() + moment().zone() * 60;
        let endTimeOfMonth = moment(this.yearMonth).add('months', 1).subtract('seconds', 1).unix() + moment().zone() * 60;
        this.searchEventsRequires.startTime = startTimeOfMonth;
        this.searchEventsRequires.endTime = endTimeOfMonth;
        this.scheduleService.searchEventsByDisplayedMonth(this.searchEventsRequires).then(data => {
            this.days = data;
        });
    }
    
    getLocalsFromSetting() {
        return new Promise(resolve => {
            let locales = {
                japan:"JP",
                china:"CN",
                usa:"US"
            };
            this.scheduleService.getUserSettings(this.searchEventsRequires.userId).then(data => {
                let locale = "";
                if (data.isShowJapanHoiday == "true") {
                    locale += locales.japan + ";";
                } 
                if (data.isShowChinaHoliday == "true") {
                    locale += locales.china + ";";
                }
                if (data.isShowAmericaHoliday == "true") {
                    locale += locales.usa + ";";
                }
                this.searchHolidaysRequires.locale = locale;
                resolve(locale);
            });
        });
    }
    
    getSpecialDays(selectDay) {
         return new Promise(resolve => {
            this.selectDay = selectDay;
            let startTime = moment(selectDay).unix();
            let endTime = moment(selectDay).add(1, 'd').subtract('seconds', 1).unix();
            
            this.searchHolidaysRequires.start = startTime;
            this.searchHolidaysRequires.end = endTime;

            this.scheduleService.getSpecialDays(this.searchHolidaysRequires).then(data => {
                this.specialDays = data;
                resolve("true");
            });
        });
    }
}
