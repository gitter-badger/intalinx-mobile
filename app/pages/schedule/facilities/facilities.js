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
      pageContent: new ViewChild(Content)
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

        this.showFixedDate = false;
        this.timeZone = "UTC" + moment().format("Z");
        // the width of one hour
        this.oneHourWidth = 120;
        this.eventHeight = 60;
        this.facilityHeight = 60;
        this.displayDaysNumber = 3;
        this.dataGridWidth = 24 * this.displayDaysNumber * this.oneHourWidth;
        // start work at 7:00.
        this.workStartTime = 7;

        // Set the today to start date.
        this.today = moment().format("YYYY-MM-DD");
        this.fromDate = this.today;
        this.setDisplayDates();
        
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
                    this.fromDate = that.today;
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
            let ganttview = document.querySelector(".facilities .ganttview");
            let gantviewSlide = document.querySelector(".facilities .ganttview .ganttview-slide");
            let facilityList = document.querySelector(".facilities .facility-list");
            let facilitiesHeader = document.querySelector(".facilities .ganttview .facility-list-header");
            let dayTimeHeader = document.querySelector(".facilities .ganttview .ganttview-day-time-header");

            let toolbar = document.querySelector(".facilities-page .toolbar");
            if (this.scrollTop > ganttview.offsetTop) {
                facilitiesHeader.style.top = toolbar.clientHeight + "px";
                facilitiesHeader.className = "facility-list-header fixed-header";
                facilitiesHeader.style.width = facilityList.clientWidth + "px";

                dayTimeHeader.style.top = toolbar.clientHeight + "px";
                dayTimeHeader.style.width = gantviewSlide.clientWidth + "px";
                dayTimeHeader.className = "ganttview-day-time-header fixed-header";
            } else {
                facilitiesHeader.className = "facility-list-header";
                dayTimeHeader.className = "ganttview-day-time-header";
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
                    let ganttviewSlide = document.querySelector(".facilities .ganttview .ganttview-slide");
                    transFromNow = parseInt(transFromNow) - that.oneHourWidth * 2;
                    if (transFromNow > minScrollLeft) {
                        ganttviewSlide.scrollLeft = transFromNow;
                    } else {
                        ganttviewSlide.scrollLeft = minScrollLeft;
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
        let ganttviewSlide = document.querySelector(".facilities .ganttview .ganttview-slide");
        ganttviewSlide.scrollLeft = 0;
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
        this.displayFixedDate();
        this.syncGanttviewGridAndHeaderScrollLeft();
    }

    syncGanttviewGridAndHeaderScrollLeft() {
        if (document.querySelector(".facilities .fixed-header")) {
            let scrollableContainer = document.querySelector(".facilities .ganttview .ganttview-day-time-header");
            let ganttviewSlide = document.querySelector(".facilities .ganttview .ganttview-slide");
            let scrollToLeft = ganttviewSlide.scrollLeft; 
            scrollableContainer.scrollLeft = scrollToLeft;
        }
    }
    
    displayFixedDate() {
        let ganttviewSlide = document.querySelector(".facilities .ganttview .ganttview-slide");
        let scrollLeft = ganttviewSlide.scrollLeft; 
        
        let oneDayWidth = this.oneHourWidth * 24;
        if (scrollLeft > 0) {
            let i = Math.floor(scrollLeft / oneDayWidth);
            // when scroll to the end of the day, if the left width is smaller than fixedDateWidth, then hide fix date.
            // If do not do that, the fix date will cover the next day text.
            if (((i + 1)* oneDayWidth - scrollLeft) < this.fixedDateWidth) {
                this.showFixedDate = false;
            } else {
                this.showFixedDate = true;
                this.fixedDate = this.displayDates[i].displayDate;
                this.fixedDateWidth = document.querySelector(".facilities .ganttview .ganttview-slide .fixed-date").clientWidth;
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
