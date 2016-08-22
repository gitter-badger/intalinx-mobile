// Third party library.
import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, ModalController, Content, Slides, Modal} from 'ionic-angular';
import {NgForm, NgClass} from '@angular/common';
import {TranslateService} from 'ng2-translate/ng2-translate';
import * as moment from 'moment';
import 'moment/locale/ja';
import 'moment/locale/zh-cn';

// Config.
import {AppConfig} from '../../../appconfig';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ScheduleService} from '../../../providers/schedule-service';
import {UserService} from '../../../providers/user-service';

// Pages.
import {EventDetailPage} from '../event-detail/event-detail';
import {EditEventPage} from '../edit-event/edit-event';
import {SelectUserPage} from '../select-user/select-user';

@Component({
    templateUrl: 'build/pages/schedule/index/index.html',
    providers: [
        ScheduleService,
        UserService,
        Util
    ]
})
export class ScheduleIndexPage {
    @ViewChild('calendarSlides') slider: Slides;

    private locale: string;
    private sendDataToShowOrDeleteEvent: any = {
        'selectedDay': '',
        'eventID': '',
        'isRefreshFlag': false
    };

    private sendDataToAddEvent: any = {
        'selectedDay': '',
        'isRefreshFlag': false
    };
    private userLang: string = this.appConfig.get('USER_LANG');
    private minDisplayDate: string = this.appConfig.get('DATETIME_YEAR_MONTH_DAY_MIN');
    private maxDisplayDate: string = this.appConfig.get('DATETIME_YEAR_MONTH_DAY_MAX');

    private weekdays: any[] = moment.weekdaysMin(true);
    private defaultNumber: number = 0;
    private cachedSlidesOnOneSide: number = 1;

    private calendarSlideOptions: any;
    private isFirstDayMonday: boolean;
    private today: any;
    private perviousYearMonthText: any;
    private currentYearMonthText: any;
    private nextYearMonthText: any;
    private perviousMonthDaysArray: any;
    private currentMonthDaysArray: any;
    private nextMonthDaysArray: any;
    private perviousMonth: any;
    private currentMonth: any;
    private nextMonth: any;

    private selectedDay: any;
    private myUserID: string;
    private userID: string;

    private selectedOtherUserName: string;
    private isAdmin: boolean;

    private calendar: any;
    
    private moment: any;

    private isHtmlLoadCompleted: boolean;
    private isEventLoadCompleted: boolean;
    private specialDays: any;
    private events: any;
    private eventsByDays: any = new Map(Array());
    private specialDaysByDays: any = new Map(Array());

    constructor(private nav: NavController, private modalCtrl: ModalController, private translate: TranslateService, private scheduleService: ScheduleService, private userService: UserService, private appConfig: AppConfig) {
        this.calendarSlideOptions = {
            direction: 'horizontal',
            initialSlide: this.cachedSlidesOnOneSide
        };
        this.weekdays = moment.weekdaysMin(false);
        // In Japan,the first day of the week is Monday. In China and England, the first day of the week is Sunday.
        if (this.userLang === 'ja' || this.userLang === 'ja-jp') {
            this.isFirstDayMonday = true;
            let sunday = this.weekdays[0];
            this.weekdays.shift();
            this.weekdays.push(sunday);
        } else {
            this.isFirstDayMonday = false;
        }
        this.today = moment().format('YYYY/MM/D');
        this.currentMonth = moment().date(1);
        this.perviousMonth = moment(this.currentMonth).subtract(1, 'months');
        this.nextMonth = moment(this.currentMonth).add(1, 'months');
        this.currentYearMonthText = moment(this.currentMonth).format('YYYY-MM');
        this.perviousYearMonthText  = moment(this.perviousMonth).format('YYYY-MM');
        this.nextYearMonthText = moment(this.nextMonth).format('YYYY-MM');
        // this month
        this.selectedDay = this.today;

        // let userID =this.app.user.userID;
        let userID = this.userService.getUserID();
        this.myUserID = userID;
        this.userID = userID;
        this.selectedOtherUserName = '';
        this.getLocalsFromSetting().then(local => {
            this.showCalendar();
        });

        this.scheduleService.getIsAdmin().then((data: boolean) => {
            this.isAdmin = data;
        });
    }

    changeCalendar(event) {
        let yearMonth = moment({
            y: event.year.value,
            M: event.month.value - 1
        });
        // selected month
        this.currentMonth = moment(yearMonth);
        this.perviousMonth = moment(this.currentMonth).subtract(1, 'months');
        this.nextMonth = moment(this.currentMonth).add(1, 'months');
        this.currentYearMonthText = moment(this.currentMonth).format('YYYY-MM');
        this.perviousYearMonthText  = moment(this.perviousMonth).format('YYYY-MM');
        this.nextYearMonthText = moment(this.nextMonth).format('YYYY-MM');
        this.selectedDay = this.currentMonth.format('YYYY/MM/D');
        this.showCalendar();
    }

    showPreviousMonth() {
        this.currentMonth = moment(this.currentMonth).subtract(1, 'months');
        this.perviousMonth = moment(this.currentMonth).subtract(1, 'months');
        this.nextMonth = moment(this.currentMonth).add(1, 'months');
        this.currentYearMonthText = moment(this.currentMonth).format('YYYY-MM');
        this.perviousYearMonthText  = moment(this.perviousMonth).format('YYYY-MM');
        this.nextYearMonthText = moment(this.nextMonth).format('YYYY-MM');
        // selected month
        this.selectedDay = this.currentMonth.format('YYYY/MM/D');
        this.showCalendar();
    }

    showNextMonth() {
        this.currentMonth = moment(this.currentMonth).add(1, 'months');
        this.perviousMonth = moment(this.currentMonth).subtract(1, 'months');
        this.nextMonth = moment(this.currentMonth).add(1, 'months');
        this.currentYearMonthText = moment(this.currentMonth).format('YYYY-MM');
        this.perviousYearMonthText  = moment(this.perviousMonth).format('YYYY-MM');
        this.nextYearMonthText = moment(this.nextMonth).format('YYYY-MM');
        // selected month
        this.selectedDay = this.currentMonth.format('YYYY/MM/D');
        this.showCalendar();
    }

    showCalendar() {
        this.perviousMonthDaysArray = new Array();
        this.currentMonthDaysArray = new Array();
        this.nextMonthDaysArray = new Array();

        // the quantity of days in selected month
        let daysInPerviousMonth = this.perviousMonth.daysInMonth();
        let daysInCurrentMonth = this.currentMonth.daysInMonth();
        let daysInNextMonth = this.nextMonth.daysInMonth();
        

        // In Japan,the first day of the week is Monday. In China and England, the first day of the week is Sunday.
        let indexOfFirstDayInWeek = 0;
        let indexOfLastDayInWeek = 6;
        if (this.isFirstDayMonday) {
            indexOfFirstDayInWeek = 1;
            indexOfLastDayInWeek = 0;
        }

        // the weekday of the first day on this month
        let firstDayInWeek = this.currentMonth.format('d');
        // 
        if (indexOfFirstDayInWeek === 1 && firstDayInWeek === '0') {
            for (let i = indexOfFirstDayInWeek; i < 7; i++) {
                this.currentMonthDaysArray.push(moment(this.currentMonth).subtract(7 - i, 'days'));
            }
        } else {
            for (let i = indexOfFirstDayInWeek; i < firstDayInWeek; i++) {
                this.currentMonthDaysArray.push(moment(this.currentMonth).subtract(firstDayInWeek - i, 'days'));
            }
        }

        // the weekday of the first day on this month
        firstDayInWeek = this.perviousMonth.format('d');
        // 
        if (indexOfFirstDayInWeek === 1 && firstDayInWeek === '0') {
            for (let i = indexOfFirstDayInWeek; i < 7; i++) {
                this.perviousMonthDaysArray.push(moment(this.perviousMonth).subtract(7 - i, 'days'));
            }
        } else {
            for (let i = indexOfFirstDayInWeek; i < firstDayInWeek; i++) {
                this.perviousMonthDaysArray.push(moment(this.perviousMonth).subtract(firstDayInWeek - i, 'days'));
            }
        }

        // the weekday of the first day on this month
        firstDayInWeek = this.nextMonth.format('d');
        // 
        if (indexOfFirstDayInWeek === 1 && firstDayInWeek === '0') {
            for (let i = indexOfFirstDayInWeek; i < 7; i++) {
                this.nextMonthDaysArray.push(moment(this.nextMonth).subtract(7 - i, 'days'));
            }
        } else {
            for (let i = indexOfFirstDayInWeek; i < firstDayInWeek; i++) {
                this.nextMonthDaysArray.push(moment(this.nextMonth).subtract(firstDayInWeek - i, 'days'));
            }
        }

        for (let i = 0; i < daysInPerviousMonth; i++) {
            this.perviousMonthDaysArray.push(moment(this.perviousMonth).add(i, 'days'));
        }

        for (let i = 0; i < daysInCurrentMonth; i++) {
            this.currentMonthDaysArray.push(moment(this.currentMonth).add(i, 'days'));
        }

        for (let i = 0; i < daysInNextMonth; i++) {
            this.nextMonthDaysArray.push(moment(this.nextMonth).add(i, 'days'));
        }

        let lastDayWeek = moment(this.currentMonth).endOf('month').format('d');
        let lastDayInMonth = moment(this.currentMonth).endOf('month');
        if (Number(lastDayWeek) !== indexOfLastDayInWeek) {
            for (let i = 0; i < 6 - Number(lastDayWeek) + indexOfFirstDayInWeek; i++) {
                this.currentMonthDaysArray.push(moment(lastDayInMonth).add(i + 1, 'days'));
            }
        }

        lastDayWeek = moment(this.perviousMonth).endOf('month').format('d');
        lastDayInMonth = moment(this.perviousMonth).endOf('month');
        if (Number(lastDayWeek) !== indexOfLastDayInWeek) {
            for (let i = 0; i < 6 - Number(lastDayWeek) + indexOfFirstDayInWeek; i++) {
                this.perviousMonthDaysArray.push(moment(lastDayInMonth).add(i + 1, 'days'));
            }
        }

        lastDayWeek = moment(this.nextMonth).endOf('month').format('d');
        lastDayInMonth = moment(this.nextMonth).endOf('month');
        if (Number(lastDayWeek) !== indexOfLastDayInWeek) {
            for (let i = 0; i < 6 - Number(lastDayWeek) + indexOfFirstDayInWeek; i++) {
                this.nextMonthDaysArray.push(moment(lastDayInMonth).add(i + 1, 'days'));
            }
        }
        
        this.moment = moment().format('HH:mm');
        this.isHtmlLoadCompleted = true;
        this.searchEventsAndSpecialDaysByDisplayedMonth();

        // Workaround to make it work: no animation
        if (this.slider && this.slider.getSlider()) {
            this.slider.slideTo(1, 0);
        }
    }

    searchEventsAndSpecialDaysByDisplayedMonth() {
        this.isEventLoadCompleted = false;
        let startTimeOfMonth = moment(this.currentMonth).unix();
        let endTimeOfMonth = moment(this.currentMonth).add(1, 'months').subtract(1, 'seconds').unix();
        this.scheduleService.getSpecialDaysForMonthByStartTimeAndEndTimeAndLocal(this.locale, startTimeOfMonth, endTimeOfMonth).then((specialDaysByDays: any) => {
            this.scheduleService.searchEventsForMonthByStartTimeAndEndTimeAndUserID(startTimeOfMonth, endTimeOfMonth, this.userID).then((eventsByDays: any) => {
                this.eventsByDays = eventsByDays;
                this.specialDaysByDays = specialDaysByDays;
                this.getEventsAndSpecialDaysBySelectedDay(this.selectedDay);
            });
        });
    }

    getEventsAndSpecialDaysBySelectedDay(selectedDay) {
        this.selectedDay = selectedDay;
        let events = this.eventsByDays.get(this.selectedDay);
        if (events && events.length >= 2) {
            let tempEvent;
            for (let i = 0; i < events.length - 1; i++) {
                for (let j = 0; j < events.length - 1 - i; j++) {
                    if (events[j].startTime > events[j + 1].startTime) {
                        tempEvent = events[j];
                        events[j] = events[j + 1];
                        events[j + 1] = tempEvent;
                    }
                }
            }
        }
        this.events = events;
        this.specialDays = this.specialDaysByDays.get(this.selectedDay);
        this.isEventLoadCompleted = true;
    }

    getLocalsFromSetting() {
        return new Promise(resolve => {
            this.scheduleService.getUserLocaleSettings(this.userID).then((locale: string) => {
                this.locale = locale;
                resolve(locale);
            });
        });
    }

    // Dont use slide because there is a bug of Slides in ionic version beta10 
    changeMonth(swiper) {
        let swipeDirection = swiper.swipeDirection;
        if (swipeDirection) {
            if (swipeDirection === 'prev') {
                this.showPreviousMonth();
            } else {
                this.showNextMonth();
            }
        }
    }

    openEventDetail(event) {
        this.sendDataToShowOrDeleteEvent.selectedDay = this.selectedDay;
        this.sendDataToShowOrDeleteEvent.eventID = event.eventID;
        if (event.visibility === 'public' || this.isAdmin || event.isSelf === 'true') {
            this.nav.push(EventDetailPage, {
                'sendDataToShowOrDeleteEvent': this.sendDataToShowOrDeleteEvent
            });
        }
    }

    addEvent() {
        this.sendDataToAddEvent.selectedDay = this.selectedDay;
        this.nav.push(EditEventPage, {
            'sendDataToAddEvent': this.sendDataToAddEvent
        });
    }

    selectUser() {
        let selectUserModal = this.modalCtrl.create(SelectUserPage, { 'userID': this.myUserID });
        selectUserModal.onDidDismiss(data => {
            if (data) {
                this.userID = data.userID;
                // hidden my user name
                if (data.userId === this.myUserID) {
                    this.selectedOtherUserName = '';
                } else {
                    this.selectedOtherUserName = data.userName;
                }
                this.showCalendar();
            }
        });
        selectUserModal.present();
    }

    showToday() {
        this.today = moment().format('YYYY/MM/D');
        this.currentMonth = moment().date(1);
        this.perviousMonth = moment(this.currentMonth).subtract(1, 'months');
        this.nextMonth = moment(this.currentMonth).add(1, 'months');
        this.currentYearMonthText = moment(this.currentMonth).format('YYYY-MM');
        this.perviousYearMonthText  = moment(this.perviousMonth).format('YYYY-MM');
        this.nextYearMonthText = moment(this.nextMonth).format('YYYY-MM');
        // selected month
        this.selectedDay = this.today;
        this.showCalendar();
    }

    showMySchedule() {
        this.userID = this.myUserID;
        this.selectedOtherUserName = '';
        this.showCalendar();
    }

    ionViewWillEnter() {
        // enter page after deleting event
        let isRefreshFlag = this.sendDataToShowOrDeleteEvent.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.searchEventsAndSpecialDaysByDisplayedMonth();
            this.sendDataToShowOrDeleteEvent.isRefreshFlag = false;
        }
        // enter page after adding event
        let isRefreshFlagFromAddEvent = this.sendDataToAddEvent.isRefreshFlag;
        if (isRefreshFlagFromAddEvent === true) {
            this.searchEventsAndSpecialDaysByDisplayedMonth();
            this.sendDataToAddEvent.isRefreshFlag = false;
        }
    }
}