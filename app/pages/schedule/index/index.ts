// Third party library.
import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content, Slides, Modal} from 'ionic-angular';
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
    // private numbers: any;
    private isFirstDayMonday: boolean;
    private today: any;
    private yearMonth: any;
    private selectedDay: any;
    private myUserID: string;
    private userID: string;
    private selectedOtherUserName: string;
    private isAdmin: boolean;

    private calendar: any;
    private timeline: any;
    private moment: any;
    private calendarHeight: number;

    private isHtmlLoadCompleted: boolean;
    private isEventLoadCompleted: boolean;
    private specialDays: any;
    private events: any;
    private eventsByDays: any = new Map(Array());
    private specialDaysByDays: any = new Map(Array());

    constructor(private nav: NavController, private translate: TranslateService, private scheduleService: ScheduleService, private userService: UserService, private appConfig: AppConfig) {
        this.calendarSlideOptions = {
            direction: 'vertical',
            initialSlide: this.cachedSlidesOnOneSide
        };
        // this.numbers = this.initNumbers(this.defaultNumber, this.cachedSlidesOnOneSide);
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
        this.yearMonth = moment().format('YYYY-MM');
        // this month
        let firstDateWeek = moment(this.yearMonth);
        this.selectedDay = this.today;

        // let userID =this.app.user.userID;
        this.userService.getUserID().then((userID: string) => {
            this.myUserID = userID;
            this.userID = userID;
            this.selectedOtherUserName = '';
            this.getLocalsFromSetting().then(local => {
                this.showCalendar(firstDateWeek);
            });
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
        let firstDateWeek = moment(yearMonth);
        this.selectedDay = firstDateWeek.format('YYYY/MM/D');
        this.showCalendar(firstDateWeek);
    }

    lastMonth() {
        this.yearMonth = moment(this.yearMonth).subtract(1, 'months').format('YYYY-MM');
        // last month
        let firstDateWeek = moment(this.yearMonth);
        this.selectedDay = firstDateWeek.format('YYYY/MM/D');
        this.showCalendar(firstDateWeek);
    }

    nextMonth() {
        this.yearMonth = moment(this.yearMonth).add(1, 'months').format('YYYY-MM');
        // next month
        let firstDateWeek = moment(this.yearMonth);
        this.selectedDay = firstDateWeek.format('YYYY/MM/D');
        this.showCalendar(firstDateWeek);
    }

    showCalendar(firstDateWeek) {
        // the quantity of days in selected month
        let daysInMonth = firstDateWeek.daysInMonth();
        // the weekday of the first day on this month
        let firstDayWeek = firstDateWeek.format('d');

        // In Japan,the first day of the week is Monday. In China and England, the first day of the week is Sunday.
        let indexOfFirstDayInWeek = 0;
        let indexOfLastDayInWeek = 6;
        if (this.isFirstDayMonday) {
            indexOfFirstDayInWeek = 1;
            indexOfLastDayInWeek = 0;
        }
        this.timeline = new Array();
        // when the first day of the week is Sunday.
        if (indexOfFirstDayInWeek === 1 && firstDayWeek === '0') {
            for (let i = indexOfFirstDayInWeek; i < 7; i++) {
                this.timeline.push(moment(firstDateWeek).subtract(7 - i, 'days'));
            }
        } else {
            for (let i = indexOfFirstDayInWeek; i < firstDayWeek; i++) {
                this.timeline.push(moment(firstDateWeek).subtract(firstDayWeek - i, 'days'));
            }
        }
        for (let i = 0; i < daysInMonth; i++) {
            this.timeline.push(moment(firstDateWeek).add(i, 'days'));
        }
        let lastDayWeek = moment(firstDateWeek).endOf('month').format('d');
        let lastDateInMonth = moment(firstDateWeek).endOf('month');
        if (Number(lastDayWeek) !== indexOfLastDayInWeek) {
            for (let i = 0; i < 6 - Number(lastDayWeek) + indexOfFirstDayInWeek; i++) {
                this.timeline.push(moment(lastDateInMonth).add(i + 1, 'days'));
            }
        }
        let rowCount = Math.ceil(this.timeline.length / 7);
        this.calendarHeight = rowCount * 46;

        this.moment = moment().format('HH:mm');
        this.isHtmlLoadCompleted = true;
        this.searchEventsAndSpecialDaysByDisplayedMonth(this.yearMonth);
    }

    searchEventsAndSpecialDaysByDisplayedMonth(yearMonth) {
        this.isEventLoadCompleted = false;
        let startTimeOfMonth = moment(yearMonth).unix() + moment().utcOffset() * 60;
        let endTimeOfMonth = moment(yearMonth).add(1, 'months').subtract(1, 'seconds').unix() + moment().utcOffset() * 60;
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
        this.events = this.eventsByDays.get(this.selectedDay);
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

    /**
       * Makes an initial array of numbers to slide, based on the cache size specified
       */
    // initNumbers(defaultNumber: number, cachedSlidesOnOneSide: number): any {
    //     let length = 2 * cachedSlidesOnOneSide + 1;
    //     let numbers = new Array(length);
    //     numbers[cachedSlidesOnOneSide] = defaultNumber;
    //     let pushedNumber = defaultNumber;
    //     for (let i = cachedSlidesOnOneSide - 1; i >= 0; i--) {
    //         pushedNumber--;
    //         numbers[i] = pushedNumber;
    //     }
    //     pushedNumber = defaultNumber;
    //     for (let i = cachedSlidesOnOneSide + 1; i < length; i++) {
    //         pushedNumber++;
    //         numbers[i] = pushedNumber;
    //     }
    //     return numbers;
    // }

    // Dont use slide because there is a bug of Slides in ionic version beta10 
    // changeMonth(swiper) {
    //     let swipeDirection = swiper.swipeDirection;
    //     if (swipeDirection) {
    //         let newIndex = this.slider.getActiveIndex();
    //         if (swipeDirection === 'prev') {
    //             while (newIndex < this.cachedSlidesOnOneSide) {
    //                 newIndex++;
    //                 this.numbers.unshift(this.numbers[0] - 1);
    //                 this.numbers.pop();
    //                 this.lastMonth();
    //             }
    //         } else {
    //             while (newIndex > this.cachedSlidesOnOneSide) {
    //                 newIndex--;
    //                 this.numbers.push(this.numbers[this.numbers.length - 1] + 1);
    //                 this.numbers.shift();
    //                 this.nextMonth();
    //             }
    //         }
    //         // Workaround to make it work: breaks the animation
    //         this.slider.slideTo(newIndex, 0, false);
    //     }
    // }

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
        let selectUserModal = Modal.create(SelectUserPage, {'userID': this.myUserID});
        selectUserModal.onDismiss(data => {
            if (data) {
                this.userID = data.userID;
                // hidden my user name
                if (data.userId === this.myUserID) {
                    this.selectedOtherUserName = '';
                } else {
                    this.selectedOtherUserName = data.userName;
                }
                this.showCalendar(moment(this.yearMonth));
            }
        });
        this.nav.present(selectUserModal);
    }

    showToday() {
        this.selectedDay = this.today;
        this.yearMonth = moment().format('YYYY-MM');
        // this month
        let firstDateWeek = moment(this.yearMonth);
        this.showCalendar(moment(this.yearMonth));
    }

    showMySchedule() {
        this.userID = this.myUserID;
        this.selectedOtherUserName = '';
        this.showCalendar(moment(this.yearMonth));
    }

    ionViewWillEnter() {
        // enter page after deleting event
        let isRefreshFlag = this.sendDataToShowOrDeleteEvent.isRefreshFlag;
        if (isRefreshFlag === true) {
            let yearMonth = moment(this.sendDataToShowOrDeleteEvent.selectedDay).format('YYYY-MM');
            this.searchEventsAndSpecialDaysByDisplayedMonth(yearMonth);
            this.sendDataToShowOrDeleteEvent.isRefreshFlag = false;
        }
        // enter page after adding event
        let isRefreshFlagFromAddEvent = this.sendDataToAddEvent.isRefreshFlag;
        if (isRefreshFlagFromAddEvent === true) {
            let yearMonth = moment(this.sendDataToAddEvent.selectedDay).format('YYYY-MM');
            this.searchEventsAndSpecialDaysByDisplayedMonth(yearMonth);
            this.sendDataToAddEvent.isRefreshFlag = false;
        }
    }
}
