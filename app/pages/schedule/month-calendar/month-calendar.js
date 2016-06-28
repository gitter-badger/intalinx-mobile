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
        }
        
        this.weekdays = moment.weekdaysMin(true);
        
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

        this.today = moment().format('YYYY/MM/D');
        this.yearMonth = moment().format('YYYY-MM');
        this.showCalendar(this.yearMonth, true);
    }
    
    changeCalendar(event) {
        let yearMonth = moment({
            y: event.year.value,
            M: event.month.value - 1});
        this.showCalendar(yearMonth);
    }
    
    lastMonth() {
        this.yearMonth = moment(this.yearMonth).subtract(1, 'months').format('YYYY-MM');
        this.showCalendar(this.yearMonth);
    }
    
    nextMonth() {
        this.yearMonth = moment(this.yearMonth).add(1, 'months').format('YYYY-MM');
        this.showCalendar(this.yearMonth);
    }
    
    
    showCalendar(yearMonth, isToday) {
        //本月份
        let firstDateWeek = moment(yearMonth);
        //本月一共几天
        let daysInMonth = firstDateWeek.daysInMonth();
        //本月第一天是周几
        let firstDayWeek = firstDateWeek.format('d');
        //时间轴(一维)
        let timeline = [];
        //时间日历
        let calendar = [];
        
        //时间轴算法
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
        //时间轴转日历
        for (let i=0; i<Math.ceil(timeline.length/7); i++) {
            calendar[i] = timeline.slice(i*7, (i+1)*7);
        }
        this.calendar = calendar;
        
        let selectDay = firstDateWeek;
        
        if (isToday) {
            selectDay = this.today;
        }
        
        this.userService.getUserId().then(data => {
            this.searchEventsRequires.userId = data;
            this.events = this.searchEvents(selectDay);
        });
    }
    
    // setColClass () {
    //     let defaultColClass = "col-default";
    //     let todayColClass = "col-today";
    //     let hasEventClass = "col-has-event";
    // }
    
    
    searchEvents(selectDay) {
        let startTime = moment(selectDay).format('X');
        let endTime = moment(selectDay).add(1, 'd').format('X');
        
        this.searchEventsRequires.startTime = startTime;
        this.searchEventsRequires.endTime = endTime;
        
        this.scheduleService.searchEvents(this.searchEventsRequires).then(data => {
            this.events = data;
        });
    }
    
    // getEventsForDeviceAndGroup(startTime, endTime, selType) {
    //     startTime = 1465311800;
    //     endTime = 1465398000;
    //     selType = null;
    //     this.scheduleService.getEventsForDeviceAndGroup(startTime, endTime, selType).then(data => {
            
    //         debugger
    //     });

    // }

}
