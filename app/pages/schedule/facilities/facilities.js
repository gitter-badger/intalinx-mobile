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
        this.initControlData();
        this.loadData();
        this.startAutoRefresh();
    }
    
    initControlData() {
        this.showFixedDate = false;
        this.timeZone = "UTC" + moment().format("Z");
        // the width of one hour
        this.oneHourWidth = 100;
        this.eventHeight = 48;
        this.facilityHeight = 60;
        this.displayDays = 3; 
        this.dataGridWidth = 24 * this.displayDays * this.oneHourWidth;
        
        // Set the today to start date.
        this.fromDate = moment().format("YYYY-MM-DD");
        this.changeShowDates();
        
        this.dateTimes = new Array();
        for(let j = 0; j < 24; j++) {
            this.dateTimes.push(j+":00");
        }
    }
    
    loadData() {
        this.isAdmin = false;
        this.locale = "";
        this.specialDays = new Array();
        this.facilities = new Array();
        
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
        
        this.getEvents();
        // to get the orientation of facility.
        // let orientation = window.screen.orientation;
    }
  
    startAutoRefresh() {
        // 5 seconds
        this.refreshInterval = 1000*5;
        // refresh whole page every 5 minutes.
        this.refreshScrollAndEventsTime = 60*5;
        this.isFirstLoad = true;
        this.isNeedShowNowLine = false;
        this.headerHeight = 100;
        this.navHeaderHeight = 80;
        this.animateId = "";
        this.hadScrolled = 0;
        this.hadScrolledFromTop = 0;
        
        this.lastActionTime = moment().unix();
        this.now = moment().unix();
        let refreshEvent = function(that) {
            return setInterval(function() {
                that.refresh();
            }, that.refreshInterval);
        }
        
        this.refreshIntervalID  = refreshEvent(this); 
    }
    
    getEvents() {
        let eventInputForFacilityAndGroup = {
            startTime: this.giStart,  // 8-digit number
            endTime: this.giEnd,  // 8-digit number
            selType: "device" // facility
        }
        this.scheduleService.getEventsForFacility(eventInputForFacilityAndGroup).then(data => {
            let facilitiesAndevents = data;
            this.facilities = facilitiesAndevents.facilities;
            let viewStartTime = this.giStart;
          
            for(let i = 0; i < this.facilities.length; i++) {
                let lineEvents = this.facilities[i].events;
                for(let j = 0; j < lineEvents.length; j++) {
                    viewStartTime = this.giStart;
                    if(j != 0) {
                        lineEvents[j].eventMarginTop = "-" + this.eventHeight + "px";
                    }
                    if(parseInt(lineEvents[j].startTime) > viewStartTime) {
                        viewStartTime = parseInt(lineEvents[j].startTime);
                    }
                  
                    lineEvents[j].eventMarginLeft = this.calculateTimeWidth(this.giStart, viewStartTime);
                    lineEvents[j].timeLength = this.calculateTimeWidth(viewStartTime, lineEvents[j].endTime);
                }
                
                this.facilities[i].events = lineEvents;
            }
            this.isLoadCompleted = true;
        });
    }
  
    getSpecialDays() {
        let getSpecialDaysRequeset = {
            locale: this.locale,  // locale settings
            start: this.giStart,  // 8-digit number
            end: this.giEnd,  // 8-digit number
        };
        this.scheduleService.getSpecialDays(getSpecialDaysRequeset).then(data => {
            this.specialDays = data;
            this.setSpecialDays();
        });
    }
  
    // Adding special background color to Sat. Sun. and public holiday.
    setSpecialDays() {
        for(let i = 0; i < this.displayDays; i++) {
            this.showDates[i].isSaturday = false;
            this.showDates[i].isSunday = false;
            this.showDates[i].isSepcialDay = false;
            
            let currentDay = "";
            if(moment(this.showDates[i].date).day() == 6) {
                this.showDates[i].isSaturday = true;
            } else if(moment(this.showDates[i].date).day() == 0) {
                this.showDates[i].isSunday = true;
            } else {
                for(let k = 0; k < this.specialDays.length; k++) {
                    currentDay = moment.unix(this.specialDays[k].startDay).format("YYYY-MM-DD");
                    if(currentDay == this.showDates[i].date) {
                        this.showDates[i].isSepcialDay = true;
                    }
                }
            }
        }
    }
    
    refresh() {
        this.now = moment().unix();
        let pastTime = this.now - this.lastActionTime;
        var nowLine = document.querySelector(".facilities .contents .data-grid-container .current-line");
        nowLine.style.marginLeft = this.calculateTimeWidth(this.giStart, this.now);
        
        if(this.isFirstLoad) {
            nowLine.style.height = (this.facilityHeight * this.facilities.length) + "px";
            this.setTransverseScroll();
            var contentsHeaderGrid = document.querySelector(".facilities .contents .header-grid");
            var navHeader = document.querySelector(".toolbar");
            this.navHeaderHeight = navHeader.offsetHeight;
            this.headerHeight = contentsHeaderGrid.offsetTop;
            this.isFirstLoad = false;
        } else if(pastTime >= this.refreshScrollAndEventsTime){
            let today = moment().format("YYYY-MM-DD");
            if(this.showDates[0].date != today) {
                this.showDates[0].date = today;
                this.changeStartDate();
            }
            this.getSpecialDays();
            this.getEvents();
            this.setTransverseScroll();
            this.lastActionTime = moment().unix();
        }
    }
    
    onPageLoaded () {
        this.isLoadCompleted = false;
    }
    
    ngAfterViewInit() {
        this.pageContent.addScrollListener(this.fixHeaderOnScrollY(this));
    }
    
    resetToToday() {
        this.fromDate = moment().format("YYYY-MM-DD");
        this.changeStartDate();
    }
    
    selectPerviousDay() {
        this.fromDate = moment.unix(this.giStart).add(-1, "d").format("YYYY-MM-DD");
        this.changeStartDate();
    }
    
    selectNextDay() {
        this.fromDate = moment.unix(this.giStart).add(1, "d").format("YYYY-MM-DD");
        this.changeStartDate();
    }
    
    changeStartDate() {
        this.lastActionTime = moment().unix();
        this.isFirstLoad = true;
        this.isLoadCompleted = false;
        this.isNeedShowNowLine = false;
        
        this.changeShowDates();
        this.getEvents();
        this.getSpecialDays();
    }
    
    changeShowDates() {
        this.giStart = moment(this.fromDate).hour(0).minute(0).second(0).unix();
        this.giEnd = moment.unix(this.giStart).add(this.displayDays - 1, "d").unix();
        
        this.showDates = new Array();
        for(let i = 0; i < this.displayDays; i++) {
            let date = moment.unix(this.giStart).add(i, "d");
            let showDate = {
                date: date.format("YYYY-MM-DD"),  // ion-datetime cannot recognize '/', so should use '-' here.
                showDate: moment(date).format("YYYY/MM/DD") + "(" + moment(date).format("ddd") + ")", 
                isSepcialDay: false,
                isSaturday: false,
                isSunday: false
            }
            this.showDates.push(showDate);
        }
        this.toDate = this.showDates[this.displayDays - 1].date;
    }
    
    fixHeaderOnScrollY(that) {
        return function() {
            that.lastActionTime = moment().unix();
            var pageDataBody = document.querySelector(".facilities .contents .body");
            var contentsHeaderGrid = document.querySelector(".facilities .contents .header-grid");
            var contentsHeader = document.querySelector(".facilities .header"); 
            if (this.scrollTop > that.headerHeight) {
                contentsHeaderGrid.style.top=that.navHeaderHeight + "px";
                contentsHeaderGrid.style.position= "fixed";
                contentsHeaderGrid.style.background = "white";
                contentsHeader.style.width = pageDataBody.offsetWidth + "px";
                contentsHeaderGrid.style.zIndex = 10;
            } else {
                contentsHeaderGrid.removeAttribute("style");
                contentsHeader.style.width = "100%";
            }
        }       
    }
    
    syncBodyAndHeaderScrollLeft() {
        this.lastActionTime = moment().unix();
        var daysPeriod = document.querySelector(".facilities .days-period-container");
        var dataGrid = document.querySelector(".facilities .contents .data-grid-container"); 
        var fixedDate = document.querySelector(".facilities .header .fixed-date"); 
        let scrollToLeft = dataGrid.scrollLeft; 
        daysPeriod.scrollLeft = scrollToLeft;
        let wholeDayWidth = this.oneHourWidth * 24;
        for(let i = 0; i < this.displayDays; i++) {
            let scrollWholeDayWidth = wholeDayWidth * i;
            if(scrollToLeft > (scrollWholeDayWidth + this.oneHourWidth) 
              && scrollToLeft < (scrollWholeDayWidth + wholeDayWidth - this.oneHourWidth)) {
                this.showFixedDate = true;
                fixedDate.innerHTML = this.showDates[i].showDate;
                break;
            } else {
                this.showFixedDate = false;
            }
        }
    }
  
    setTransverseScroll() {
        let transverseScroll = 7 * this.oneHourWidth;
        let transFromNow = this.calculateTimeWidth(this.giStart, this.now);
        transFromNow = parseInt(transFromNow.substring(0, transFromNow.indexOf("px")));
        if(this.isFirstLoad) {
            if(transFromNow != 0 && transFromNow < this.dataGridWidth) {
                this.isNeedShowNowLine = true;
            }
        }
        
        // Setting the position of scroll bar to two hours before now.
        transFromNow = transFromNow - 2 * this.oneHourWidth;
        if(transFromNow > transverseScroll && transFromNow < this.dataGridWidth) {
            transverseScroll = transFromNow;
        }
        var dataGrid = document.querySelector(".facilities .contents .data-grid-container");
        // dataGrid.scrollLeft = transverseScroll;
        let hadBeenScrolled = dataGrid.scrollLeft;
        this.animateId = this.addScrollLeftInterval(this, transverseScroll, hadBeenScrolled); 
    }
    
    calculateTimeWidth(startTimestamp, endTimestamp) {
        let peroidWidth = 0;
        if(startTimestamp < endTimestamp) {
            let secondsOfOneHour =  60*60;
            let spanMinutes = endTimestamp - startTimestamp;
            peroidWidth = spanMinutes / secondsOfOneHour * this.oneHourWidth;
        }
        peroidWidth = peroidWidth + "px";
        return peroidWidth;
    }
    
    addScrollLeftInterval(that, transverseScroll, hadBeenScrolled) {
        this.hadScrolled = hadBeenScrolled;
        if(hadBeenScrolled < transverseScroll) {
            return setInterval(function() {
                that.animateScrollRight(transverseScroll);
            }, 1);
        } else {
            return setInterval(function() {
                that.animateScrollLeft(transverseScroll);
            }, 1);
        }
    }
  
    animateScrollLeft(scrollWidth) {
        var dataGrid = document.querySelector(".facilities .contents .data-grid-container");
        if(this.hadScrolled <= scrollWidth) {
            clearInterval(this.animateId);
        } else {
            this.hadScrolled -= 10;
            dataGrid.scrollLeft = this.hadScrolled;
        }
    }
    
    animateScrollRight(scrollWidth) {
        var dataGrid = document.querySelector(".facilities .contents .data-grid-container");
        if(this.hadScrolled >= scrollWidth) {
            clearInterval(this.animateId);
        } else {
            this.hadScrolled += 10;
            dataGrid.scrollLeft = this.hadScrolled;
        }
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
