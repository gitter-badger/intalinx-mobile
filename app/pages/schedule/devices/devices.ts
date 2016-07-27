// Third party library.
import {Component, ViewChild, ElementRef} from '@angular/core';
import * as moment from 'moment';
import {Alert, Content} from 'ionic-angular';
import {Brightness} from 'ionic-native';

// Config.
import {AppConfig} from '../../../appconfig';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ShareService} from '../../../providers/share-service';
import {ScheduleService} from '../../../providers/schedule-service';
import {UserService} from '../../../providers/user-service';

@Component({
    templateUrl: 'build/pages/schedule/devices/devices.html',
    providers: [
        Util,
        ScheduleService,
        UserService
    ]
})
export class DevicesPage {

    @ViewChild('pageContent') pageContent: Content;
    @ViewChild('ganttview') ganttview: ElementRef;
    @ViewChild('deviceList') deviceList: ElementRef;
    @ViewChild('deviceListHeader') deviceListHeader: ElementRef;
    @ViewChild('ganttviewSlide') ganttviewSlide: ElementRef;
    @ViewChild('ganttviewDayTimeHeader') ganttviewDayTimeHeader: ElementRef;
    @ViewChild('ganttviewFixedDate') ganttviewFixedDate: ElementRef;
    @ViewChild('nowLine') nowLine: ElementRef;


    // if nobody make an action, refresh whole page every 5 minutes.
    private refreshWholePageInterval: number = 60 * 5;
    // the width of one hour
    private oneHourWidth: number = 120;
    private eventHeight: number = 60;
    private deviceHeight: number = 60;
    private displayDaysNumber: number = 2;
    private ganttviewWidth: number;
    private fixedDateWidth: number;
    // start work at 7:00.
    private workStartTime: number = 7;

    // 
    private lastActionTime: number = moment().unix();
    private now: number = moment().unix();
    private isAdmin: boolean = false;
    private isLoadCompleted: boolean;
    private specialDays: any = new Array();
    private devices: any = new Array();
    private timeZone: string = 'UTC' + moment().format('Z');
    
    private displayDates: any;
    private fromDate: any;
    private fromDateTime: number;
    private toDate: any;
    private toDateTime: number;
    private showFixedDate: boolean = false;
    private fixedDate: any;
    private headerFixed: boolean = false;
    private isNeedShowNowLine: boolean = false;
    private nowLineStyle: any;
    private dateTimes: any = new Array();
    private minDisplayDate: string = this.appConfig.get('DATETIME_YEAR_MONTH_DAY_MIN');
    private maxDisplayDate: string = this.appConfig.get('DATETIME_YEAR_MONTH_DAY_MAX');

    constructor(private util: Util, 
        private share: ShareService,
        private scheduleService: ScheduleService, 
        private userService: UserService,
        private appConfig: AppConfig
        ) {
        
        if (typeof Brightness !== undefined) {
            Brightness.setBrightness(1);
            Brightness.setKeepScreenOn(true);
        }

        // initialize data
        this.initVariable();
        this.loadRemoteData();
        this.startAutoRefresh();
    }
    
    initVariable(): void {
        this.ganttviewWidth = 24 * this.displayDaysNumber * this.oneHourWidth;
        this.fromDate = this.getToday();
        this.setDisplayDates();     
        for (let j = 0; j < 24; j++) {
            this.dateTimes.push(j + ':00');
        }
        this.fixedDate = this.displayDates[0];
    }

    getToday(): string {
        return moment.unix(this.now).format('YYYY-MM-DD');
    }
    
    loadRemoteData(): void {
        this.isLoadCompleted = false;

        this.scheduleService.getIsAdmin().then((data: boolean) => {
            this.isAdmin = data;
        });
        
        // to get user's settings.
        // Regardless the size of words, just to get the settings about locale. 
        this.userService.getUserID().then((userID: string) => {
            return userID;
        }).then((userID: string) => {
            return this.scheduleService.getUserLocaleSettings(userID);
        }).then((locale: string) => {
            this.getSpecialDays(locale);
        }); 
        
        this.scheduleService.getEventsForDevice(this.fromDateTime, this.toDateTime).then((data: any) => {
            let devicesAndevents = data;
            this.devices = devicesAndevents.devices;
            let viewStartTime = this.fromDateTime;
          
            for (let i = 0; i < this.devices.length; i++) {
                let lineEvents = this.devices[i].events;
                for (let j = 0; j < lineEvents.length; j++) {
                    viewStartTime = this.fromDateTime;
                    if (j !== 0) {
                        lineEvents[j].eventMarginTop = '-' + this.eventHeight + 'px';
                    }
                    if (parseInt(lineEvents[j].startTime) > viewStartTime) {
                        viewStartTime = parseInt(lineEvents[j].startTime);
                    }
                    lineEvents[j].eventMarginLeft = this.calculateTimeWidth(this.fromDateTime, viewStartTime);
                    lineEvents[j].timeLength = this.calculateTimeWidth(viewStartTime, lineEvents[j].endTime);
                }
                this.devices[i].events = lineEvents;
            }

            this.setGanttviewSlideScrollToNow();
        });
    }
  
    startAutoRefresh(): void {
        let refreshEvent = function(that: any) {
            return setInterval(function() {
                // if nobody make an action, refresh whole page every 5 minutes.
                that.now = moment().unix();
                let pastTime = that.now - that.lastActionTime;
                if (pastTime >= that.refreshWholePageInterval) {
                    // reset fromDate to today.
                    that.fromDate = that.getToday();
                    that.refresh();
                }
            }, that.refreshWholePageInterval);
        };

        let refreshNowLine = function(that: any) {
            return setInterval(function() {
                that.setNowLineStyles();
            }, 1000 * 1);
        };
        refreshEvent(this);
        refreshNowLine(this);
    }
  
    getSpecialDays(locale: string): void {
        this.scheduleService.getSpecialDays(locale, this.fromDateTime, this.toDateTime).then((data: any) => {
            for (let i = 0; i < this.displayDaysNumber; i++) {
                for (let k = 0; k < data.length; k++) {
                    let currentDay = moment.unix(data[k].startDay).format('YYYY-MM-DD');
                    if (currentDay === this.displayDates[i].date) {
                        this.displayDates[i].isSepcialDay = true;
                    }
                }
            }
        });
    }

    setNowLineStyles(): any {
        if (this.getToday() === this.fromDate) {
            this.nowLine.nativeElement.style.marginLeft = this.calculateTimeWidth(this.fromDateTime, this.now);
            this.nowLine.nativeElement.style.height = this.deviceHeight * this.devices.length + 'px';
        }
    }
    
    refresh(): void {
        this.lastActionTime = moment().unix();
        this.setDisplayDates();
        this.loadRemoteData();
    }
    
    ionViewLoaded(): void {
        this.isLoadCompleted = false;
    }
    
    ngAfterViewInit(): void {
        this.pageContent.addScrollListener(this.displayFixedHeader(this));
    }

    displayFixedHeader(that): any {
        return function() {
            that.lastActionTime = moment().unix();
            if (this.scrollTop > that.ganttview.nativeElement.offsetTop) {
                that.deviceListHeader.nativeElement.style.top = that.pageContent.getContentDimensions().contentTop + 'px';
                that.deviceListHeader.nativeElement.className = 'device-list-header fixed-header';
                that.deviceListHeader.nativeElement.style.width = that.deviceList.nativeElement.clientWidth + 'px';

                that.ganttviewDayTimeHeader.nativeElement.style.top = that.pageContent.getContentDimensions().contentTop + 'px';
                that.ganttviewDayTimeHeader.nativeElement.style.width = that.ganttviewSlide.nativeElement.clientWidth + 'px';
                that.ganttviewDayTimeHeader.nativeElement.className = 'ganttview-day-time-header fixed-header';

                that.ganttviewFixedDate.nativeElement.style.position = 'fixed';
                that.headerFixed = true;
            } else {
                that.deviceListHeader.nativeElement.className = 'device-list-header';
                that.ganttviewDayTimeHeader.nativeElement.className = 'ganttview-day-time-header';
                that.ganttviewFixedDate.nativeElement.style.position = 'absolute';
                that.headerFixed = false;
            }

            that.onGanttviewSlideScrollLeft();
        };   
    }

    setGanttviewSlideScrollToNow() {
        if (this.getToday() === this.fromDate) {
            let minScrollLeft = (this.workStartTime - 2) * this.oneHourWidth;
            let transFromNow = this.calculateTimeWidth(this.fromDateTime, this.now);
            transFromNow = parseInt(transFromNow) - this.oneHourWidth * 2;
            if (transFromNow > minScrollLeft) {
                this.ganttviewSlide.nativeElement.scrollLeft = (transFromNow);
            } else {
                this.ganttviewSlide.nativeElement.scrollLeft = (minScrollLeft);
            }   
        }
        this.isLoadCompleted = true;
    }

    resetGanttviewSlideScroll() {
        this.ganttviewSlide.nativeElement.scrollLeft = 0;
    }
    
    resetToToday() {
        this.fromDate = moment().format('YYYY-MM-DD');
        this.refresh();
    }
    
    selectPerviousDay() {
        this.fromDate = moment.unix(this.fromDateTime).add(-1, 'd').format('YYYY-MM-DD');
        this.refresh();
    }
    
    selectNextDay() {
        this.fromDate = moment.unix(this.fromDateTime).add(1, 'd').format('YYYY-MM-DD');
        this.refresh();
    }
    
    setDisplayDates() {
        this.isNeedShowNowLine = false;
        this.fromDateTime = moment(this.fromDate).hour(0).minute(0).second(0).unix();
        this.toDateTime = moment.unix(this.fromDateTime).add(this.displayDaysNumber - 1, 'd').unix();

        this.displayDates = new Array();
        for (let i = 0; i < this.displayDaysNumber; i++) {
            let date = moment.unix(this.fromDateTime).add(i, 'd');
            let displayDate = {
                date: date.format('YYYY-MM-DD'),  // ion-datetime cannot recognize '/', so should use '-' here.
                displayDate: moment(date).format('YYYY/MM/DD') + '(' + moment(date).format('ddd') + ')', 
                isSepcialDay: false,
                isSaturday: moment(date).day() === 6,
                isSunday: moment(date).day() === 0
            };
            this.displayDates.push(displayDate);
        }
        
        this.toDate = this.displayDates[this.displayDaysNumber - 1].date;

        // if not display today, then reset scroll to 0. 
        if (this.fromDate !== this.getToday()) {
            this.resetGanttviewSlideScroll();
        }
    }

    onGanttviewSlideScrollLeft() {
        this.lastActionTime = moment().unix();
        this.syncGanttviewGridAndHeaderScrollLeft();
        this.displayFixedDate();
    }

    syncGanttviewGridAndHeaderScrollLeft() {
        if (this.headerFixed) {
            this.ganttviewDayTimeHeader.nativeElement.scrollLeft = this.ganttviewSlide.nativeElement.scrollLeft;
        }
    }
    
    displayFixedDate() {
        let scrollLeft = this.ganttviewSlide.nativeElement.scrollLeft; 
        let oneDayWidth = this.oneHourWidth * 24;
        if (scrollLeft > 0) {
            let i = Math.floor(scrollLeft / oneDayWidth);
            // when scroll to the end of the day, if the left width is smaller than fixedDateWidth, then hide fix date.
            // If do not do that, the fix date will cover the next day text.
            if (((i + 1) * oneDayWidth - scrollLeft) < this.fixedDateWidth) {
                this.showFixedDate = false;
            } else {
                this.showFixedDate = true;
                this.fixedDate = this.displayDates[i];
                this.fixedDateWidth = this.ganttviewFixedDate.nativeElement.clientWidth;
            }
        } else {
            this.showFixedDate = false;
        }
    }

    calculateTimeWidth(startTimestamp, endTimestamp) {
        let peroidWidth: any = 0;
        if (startTimestamp < endTimestamp) {
            let secondsOfOneHour =  60 * 60;
            let spanMinutes = endTimestamp - startTimestamp;
            peroidWidth = spanMinutes / secondsOfOneHour * this.oneHourWidth;
            if (peroidWidth > this.ganttviewWidth) {
                peroidWidth = this.ganttviewWidth;
            }
        }
        peroidWidth = peroidWidth + 'px';
        return peroidWidth;
    }

    showDetail(eventInfo) {
        // this.lastActionTime = moment().unix();
        // let alert = Alert.create({
        //     subTitle: eventInfo.title,
        //     message: '予定詳細画面の実装を待っています......',
        //     buttons: ['ok']
        // });
        // this.share.nav.present(alert);
    }
}
