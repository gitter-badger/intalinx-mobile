import {Page, IonicApp, NavController, Alert, Content, Application} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../../utils/util';
import {ScheduleService} from '../../../providers/schedule-service';
import {UserService} from '../../../providers/user-service';

@Page({
  templateUrl: 'build/pages/schedule/facilities/facilities.html',
  providers: [
      Util,
      ScheduleService,
      UserService
  ],
  pipes: [TranslatePipe],
  queries: {
      pageContent: new ViewChild('pageContent'),
      ganttview: new ViewChild('ganttview'),
      facilityList: new ViewChild('facilityList'),
      facilityListHeader: new ViewChild('facilityListHeader'),
      ganttviewSlide: new ViewChild('ganttviewSlide'),
      ganttviewDayTimeHeader: new ViewChild('ganttviewDayTimeHeader'),
      ganttviewFixedDate: new ViewChild('ganttviewFixedDate')
  }
})
export class FacilitiesPage {
    static get parameters() {
        return [[IonicApp], [NavController], [Util], [ScheduleService], [UserService]];
    }

    constructor(app, nav, util, scheduleService, userService) {
        this.app = app;
        this.nav = nav;
        this.util = util;
        this.scheduleService = scheduleService;
        this.userService = userService;
        
        // initialize data
        this.initVariable();
        this.loadRemoteData();
        this.startAutoRefresh();
    }
    
    initVariable() {
        // if nobody make an action, refresh whole page every 5 minutes.
        this.refreshWholePageInterval = 60 * 5;
        this.lastActionTime = moment().unix();
        this.now = moment().unix();

        this.isAdmin = false;
        this.locale = "";
        this.specialDays = new Array();
        this.facilities = new Array();

        this.timeZone = "UTC" + moment().format("Z");
        // the width of one hour
        this.oneHourWidth = 120;
        this.eventHeight = 60;
        this.facilityHeight = 60;
        this.displayDaysNumber = 2;
        this.dataGridWidth = 24 * this.displayDaysNumber * this.oneHourWidth;
        // start work at 7:00.
        this.workStartTime = 7;

        // Set the today to start date.
        this.today = moment().format("YYYY-MM-DD");
        this.fromDate = this.today;
        this.setDisplayDates();
        this.showFixedDate = false;
        this.fixedDate = this.displayDates[0];

        this.headerFixed = false;
        
        this.dateTimes = new Array();
        for(let j = 0; j < 24; j++) {
            this.dateTimes.push(j + ":00");
        }
    }
    
    loadRemoteData() {
        this.isLoadCompleted = false;

        this.scheduleService.getIsAdmin().then(data => {
            this.isAdmin = data;
        });
        
        // to get user's settings.
        // Regardless the size of words, just to get the settings about locale. 
        this.userService.getUserId().then(userId => {
            this.scheduleService.getUserLocaleSettings(userId).then(data => {
                this.locale = data;
                this.getSpecialDays();
            });
        }); 
        
        this.scheduleService.getEventsForFacility(this.fromDateTime, this.toDateTime).then(data => {
            let facilitiesAndevents = data;
            this.facilities = facilitiesAndevents.facilities;
            let viewStartTime = this.fromDateTime;
          
            for(let i = 0; i < this.facilities.length; i++) {
                let lineEvents = this.facilities[i].events;
                for(let j = 0; j < lineEvents.length; j++) {
                    viewStartTime = this.fromDateTime;
                    if(j != 0) {
                        lineEvents[j].eventMarginTop = "-" + this.eventHeight + "px";
                    }
                    if(parseInt(lineEvents[j].startTime) > viewStartTime) {
                        viewStartTime = parseInt(lineEvents[j].startTime);
                    }
                    lineEvents[j].eventMarginLeft = this.calculateTimeWidth(this.fromDateTime, viewStartTime);
                    lineEvents[j].timeLength = this.calculateTimeWidth(viewStartTime, lineEvents[j].endTime);
                }
                this.facilities[i].events = lineEvents;
            }
            this.setGanttviewSlideScrollToNow();
        });
    }
  
    startAutoRefresh() {
        let refreshEvent = function(that) {
            return setInterval(function() {
                // if nobody make an action, refresh whole page every 5 minutes.
                that.now = moment().unix();
                let pastTime = that.now - that.lastActionTime;
                if(pastTime >= that.refreshWholePageInterval){
                    // reset fromDate to today.
                    that.fromDate = that.today;
                    that.refresh();
                }
            }, that.refreshWholePageInterval);
        }
        refreshEvent(this); 
    }
  
    getSpecialDays() {
        this.scheduleService.getSpecialDays(this.locale, this.fromDateTime, this.toDateTime).then(data => {
            for(let i = 0; i < this.displayDaysNumber; i++) {
                for(let k = 0; k < data.length; k++) {
                    let currentDay = moment.unix(data[k].startDay).format("YYYY-MM-DD");
                    if(currentDay == this.displayDates[i].date) {
                        this.displayDates[i].isSepcialDay = true;
                    }
                }
            }
        });
    }

    setNowLineStyles() {
        if (this.today == this.fromDate) {
            let styles = {
                'margin-left': this.calculateTimeWidth(this.fromDateTime, this.now),
                'height': this.facilityHeight * this.facilities.length + "px"
            }
            return styles;
        }
    }
    
    refresh() {
        this.lastActionTime = moment().unix();
        this.setDisplayDates();
        this.loadRemoteData();
    }
    
    onPageLoaded () {
        this.isLoadCompleted = false;
    }
    
    ngAfterViewInit() {
        this.pageContent.addScrollListener(this.displayFixedHeader(this));
    }

    displayFixedHeader(that) {
        return function() {
            that.lastActionTime = moment().unix();
            if (this.scrollTop > that.ganttview.nativeElement.offsetTop) {
                that.facilityListHeader.nativeElement.style.top = that.pageContent.getContentDimensions().contentTop + "px";
                that.facilityListHeader.nativeElement.className = "facility-list-header fixed-header";
                that.facilityListHeader.nativeElement.style.width = that.facilityList.nativeElement.clientWidth + "px";

                that.ganttviewDayTimeHeader.nativeElement.style.top = that.pageContent.getContentDimensions().contentTop + "px";
                that.ganttviewDayTimeHeader.nativeElement.style.width = that.ganttviewSlide.nativeElement.clientWidth + "px";
                that.ganttviewDayTimeHeader.nativeElement.className = "ganttview-day-time-header fixed-header";

                that.ganttviewFixedDate.nativeElement.style.position = "fixed";
                that.headerFixed = true;
            } else {
                that.facilityListHeader.nativeElement.className = "facility-list-header";
                that.ganttviewDayTimeHeader.nativeElement.className = "ganttview-day-time-header";
                that.ganttviewFixedDate.nativeElement.style.position = "absolute";
                that.headerFixed = false;
            }

            that.onGanttviewSlideScrollLeft();
        }       
    }

    setGanttviewSlideScrollToNow() {
        if (this.today == this.fromDate) {
            let realScroll = function(that){
                return function() {
                    let minScrollLeft = (that.workStartTime - 2) * that.oneHourWidth;
                    let transFromNow = that.calculateTimeWidth(that.fromDateTime, that.now);
                    transFromNow = parseInt(transFromNow) - that.oneHourWidth * 2;
                    if (transFromNow > minScrollLeft) {
                        that.ganttviewSlide.nativeElement.scrollLeft = (transFromNow);
                    } else {
                        that.ganttviewSlide.nativeElement.scrollLeft = (minScrollLeft);
                    }
                    that.isLoadCompleted = true;
                }
            }
            setTimeout(realScroll(this), 1000);
        } else {
            this.isLoadCompleted = true;
        }
    }

    resetGanttviewSlideScroll() {
        this.ganttviewSlide.nativeElement.scrollLeft = 0;
    }
    
    resetToToday() {
        this.fromDate = moment().format("YYYY-MM-DD");
        this.refresh();
    }
    
    selectPerviousDay() {
        this.fromDate = moment.unix(this.fromDateTime).add(-1, "d").format("YYYY-MM-DD");
        this.refresh();
    }
    
    selectNextDay() {
        this.fromDate = moment.unix(this.fromDateTime).add(1, "d").format("YYYY-MM-DD");
        this.refresh();
    }
    
    setDisplayDates() {
        this.isNeedShowNowLine = false;
        this.fromDateTime = moment(this.fromDate).hour(0).minute(0).second(0).unix();
        this.toDateTime = moment.unix(this.fromDateTime).add(this.displayDaysNumber - 1, "d").unix();

        this.displayDates = new Array();
        for(let i = 0; i < this.displayDaysNumber; i++) {
            let date = moment.unix(this.fromDateTime).add(i, "d");
            let displayDate = {
                date: date.format("YYYY-MM-DD"),  // ion-datetime cannot recognize '/', so should use '-' here.
                displayDate: moment(date).format("YYYY/MM/DD") + "(" + moment(date).format("ddd") + ")", 
                isSepcialDay: false,
                isSaturday: moment(date).day() == 6,
                isSunday: moment(date).day() == 0
            }
            this.displayDates.push(displayDate);
        }
        this.toDate = this.displayDates[this.displayDaysNumber - 1].date;

        // if not display today, then reset scroll to 0. 
        if (this.fromDate != this.today) {
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
            if (((i + 1)* oneDayWidth - scrollLeft) < this.fixedDateWidth) {
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
        let peroidWidth = 0;
        if(startTimestamp < endTimestamp) {
            let secondsOfOneHour =  60 * 60;
            let spanMinutes = endTimestamp - startTimestamp;
            peroidWidth = spanMinutes / secondsOfOneHour * this.oneHourWidth;
            if (peroidWidth > this.dataGridWidth) {
                peroidWidth = this.dataGridWidth;
            }
        }
        peroidWidth = peroidWidth + "px";
        return peroidWidth;
    }

    showDetail(eventInfo) {
        this.lastActionTime = moment().unix();
        let alert = Alert.create({
            subTitle: eventInfo.title,
            message: "予定詳細画面の実装を待っています......",
            buttons: ["ok"]
        });
        this.nav.present(alert);
    }
}
