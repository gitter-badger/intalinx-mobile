import {Page, IonicApp, NavController, ViewController, Platform} from 'ionic-angular';

import {NgForm} from '@angular/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {ScheduleService} from '../../../providers/schedule/schedule-service/schedule-service';

import {Util} from '../../../utils/util';
import {DateUtil} from '../../../utils/dateutil';

@Page({
    templateUrl: 'build/pages/schedule/month-calendar/month-calendar.html',
    providers: [
        ScheduleService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class MonthCalendarPage {
    static get parameters() {
        return [[IonicApp], [NavController], [ViewController], [Platform], [ScheduleService]];
    }

    constructor(app, nav, view, platform, scheduleService) {
        this.app = app;
        this.nav = nav;
        this.view = view;
        this.platform = platform;
        
        this.scheduleService = scheduleService;

        this.today = moment().format('YYYY/MM/DD');
        this.yearMonth = moment().format('YYYY-MM');
        
        this.showCalendar(this.yearMonth);
        

        
        // this.searchEvents();
    }
    
    changeCalendar(event) {
        let yearMonth = moment({
            y: event.year.value,
            M: event.month.value});
        this.showCalendar(yearMonth);
    }
    
    showCalendar(yearMonth) {
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
        //时间轴转日历
        for (let i=0; i<Math.ceil(timeline.length/7); i++) {
            calendar[i] = timeline.slice(i*7, (i+1)*7);
        }
        this.calendar = calendar;
    }
    
    
    // searchEvents(categoryID, isRepeat, startTime, endTime, deviceID, visibility, title, summary, location, timezone, selType, userId) {
        
    //     startTime = 1465311800;
    //     endTime = 1465398000;
    //     userId = "wang";
    //     this.scheduleService.searchEvents(categoryID, isRepeat, startTime, endTime, deviceID, visibility, title, summary, location, timezone, selType, userId).then(data => {
    //         this.events = data;

    //         debugger
    //     });
    // }
    
    // getEventsForDeviceAndGroup(startTime, endTime, selType) {
    //     startTime = 1465311800;
    //     endTime = 1465398000;
    //     selType = null;
    //     this.scheduleService.getEventsForDeviceAndGroup(startTime, endTime, selType).then(data => {
            
    //         debugger
    //     });
    // }

}
