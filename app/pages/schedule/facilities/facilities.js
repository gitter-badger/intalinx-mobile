import {Page, IonicApp, NavController, Platform, Alert, Content, Application} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../../utils/util';
import {ScheduleService} from '../../../providers/schedule/schedule-service/schedule-service';

/*
  Generated class for the FacilitiesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/schedule/facilities/facilities.html',
  providers: [
      Util,
      ScheduleService
  ],
  pipes: [TranslatePipe],
  queries: {
      pageContent: new ViewChild(Content)
  }
})
export class FacilitiesPage {
  static get parameters() {
    return [[IonicApp], [NavController], [Platform], [Util], [ScheduleService]];
  }

  constructor(app, nav, platform, util, scheduleService) {
    this.app = app;
    this.nav = nav;
    this.platform = platform;
    this.util = util;
    this.scheduleService = scheduleService;
    
    this.timeZone = "UTC" + moment().format("Z");
    // 画面表示イベントとトップまでの距離と左までの距離
    this.paddingWithOneHour = 100;
    this.paddingWithOneDevice = 48;
    this.paddingWithOneDeviceLine = 60;
    this.wholeDataGrid = 24 * 3 * this.paddingWithOneHour;
    // this.deviceColors = ["pink", "green", "purple", "yellow", "red", "blue", "lightcoral"];
    // いままで施設一覧画面が使っている色を使います。
    this.deviceColors = ["rgb(210, 80, 127)", "rgb(100, 149, 237)", "rgb(153, 50, 204)", 
                         "rgb(241, 169, 160)", "rgb(255, 140, 0)", "rgb(46, 139, 87)", 
                         "rgb(105, 105, 105)", "rgb(249, 191, 59)"];
    // 横向きモードの判断
    this.isLandscape = platform.isLandscape();
    // 今登録しているユーザーが管理人かどうかを判断する
    this.isAdmin = false;
    this.locale = "";
    
    this.standardMoment = moment().unix();
    this.now = moment().unix();
    // 選択したデータを今日に設定します。
    this.giStart = moment().hour(0).minute(0).second(0).unix();
    this.giEnd = moment.unix(this.giStart).add(2, "d").unix();
    // ここで注意しなければならないことはion-datetimeが「/」で区別する時間格式を認識できません。
    this.firstDate = {
        date: moment.unix(this.giStart).format("YYYY-MM-DD"),
        isSepcialDay: false,
        isSaturday: false,
        isSunday: false
    };
    this.secondDate = {
        date: moment.unix(this.giStart).add(1, "d").format("YYYY-MM-DD"),
        isSepcialDay: false,
        isSaturday: false,
        isSunday: false
    }
    this.thirdDate = {
        date: moment.unix(this.giStart).add(2, "d").format("YYYY-MM-DD"),
        isSepcialDay: false,
        isSaturday: false,
        isSunday: false
    };
    
    // this.events = [];
    
    
    this.specialDays = new Array();
    
    this.facilities = new Array();
    this.dateTimes = ["12 am","1 am","2 am","3 am","4 am","5 am", 
                      "6 am","7 am","8 am","9 am","10 am","11 am", 
                      "12 pm","1 pm","2 pm","3 pm","4 pm","5 pm", 
                      "6 pm", "7 pm","8 pm","9 pm","10 pm","11 pm"];
     // 初期データ取得
     this.initData();
     
     // リフレッシュ関係の変数
     // 5秒ごと更新関数をやります
     this.refreshInterval = 1000*5;
     // 最新動きの2分後再定位をやって、最新情報を取得します
     this.refreshScrollAndEventsTime = 60*2;
     
     this.refresh = this.refreshEvent(this);
     this.isFirstLoad = true;
     this.isNeedShowNowLine = false;
     this.headerHeight = 100;
     this.navHeaderHeight = 80;
  }
  
  onPageLoaded () {
      this.isLoadCompleted = false;
  }
  
  // 初期データ取得
  initData() {
      // 今登録しているユーザーが管理人かどうかを判断する
      this.scheduleService.getIsAdmin().then(data => {
          this.isAdmin = data;
      });
     
      // ユーザー設定を取得する
      // 字体大きさはとりあえずほっどいて、localeをしゅとくする
      let userId =this.app.user.userName; // this.app.user.userId;
      this.scheduleService.getUserLocaleSettings(userId).then(data => {
          this.locale = data;
          this.getSpecialDays();
      });
      this.getEvents();
  }
  
  getEvents() {
       // 取得時間帯の予定データを取得する
      let eventInputForDeviceAndGroup = {
          startTime: this.giStart,  // 8桁数字
          endTime: this.giEnd,  // 8桁数字
          selType: "device"
      }
      this.scheduleService.getEventsForDevice(eventInputForDeviceAndGroup).then(data => {
          let devicesAndevents = data;
          this.facilities = devicesAndevents.facilities;
          let viewStartTime = this.giStart;
          
          for(let i = 0; i < this.facilities.length; i++) {
              let lineEvents = this.facilities[i].events;
              for(let j = 0; j < lineEvents.length; j++) {
                  viewStartTime = this.giStart;
                  if(j != 0) {
                      lineEvents[j].eventMarginTop = "-" + this.paddingWithOneDevice + "px";
                  }
                  if(parseInt(lineEvents[j].startTime) > viewStartTime) {
                      viewStartTime = parseInt(lineEvents[j].startTime);
                  }
                  
                  lineEvents[j].eventMarginLeft = this.calculateTimeSpece(this.giStart, viewStartTime);
                  lineEvents[j].timeLength = this.calculateTimeSpece(viewStartTime, lineEvents[j].endTime);
              }
              this.facilities[i].deviceColor = this.deviceColors[i%this.deviceColors.length];;
              this.facilities[i].events = lineEvents;
          }
          this.isLoadCompleted = true;
      });
  }
  
  getSpecialDays() {
      let getSpecialDaysRequeset = {
          locale: this.locale,  // ユーザー選択した地区
          start: this.giStart,  // 8桁数字
          end: this.giEnd,  // 8桁数字
      };
      this.scheduleService.getSpecialDays(getSpecialDaysRequeset).then(data => {
          this.specialDays = data;
          this.checkSpecialDays();
      });
  }
  
  // 週末と祝日で特別のCSSを追加する
  checkSpecialDays() {
      //background-color satuday rgb(235, 240, 246)
      // background-color sunday & holiday rgb(255, 239, 229)
      // 三つの日は土曜日か日曜日か祝日かを初期「ない」に設定します。
      this.firstDate.isSaturday = false;
      this.firstDate.isSunday = false;
      this.firstDate.isSepcialDay = false;
      this.secondDate.isSaturday = false;
      this.secondDate.isSunday = false;
      this.secondDate.isSepcialDay = false;
      this.thirdDate.isSaturday = false;
      this.thirdDate.isSunday = false;
      this.thirdDate.isSepcialDay = false;
      
      let curDay = "";
      if(moment(this.firstDate.date).day() == 6) {
          this.firstDate.isSaturday = true;
      } else if(moment(this.firstDate.date).day() == 0) {
          this.firstDate.isSunday = true;
      } else {
          for(let k = 0; k < this.specialDays.length; k++) {
              curDay = moment.unix(this.specialDays[k].startDay).format("YYYY-MM-DD");
              if(curDay == this.firstDate.date) {
                  this.firstDate.isSepcialDay = true;
              }
          }
      }
      
      if(moment(this.secondDate.date).day() == 6) {
          this.secondDate.isSaturday = true;
      } else if(moment(this.secondDate.date).day() == 0) {
          this.secondDate.isSunday = true;
      } else {
          for(let k = 0; k < this.specialDays.length; k++) {
              curDay = moment.unix(this.specialDays[k].startDay).format("YYYY-MM-DD");
              if(curDay == this.secondDate.date) {
                  this.secondDate.isSepcialDay = true;
              }
          }
      }
      
      if(moment(this.thirdDate.date).day() == 6) {
          this.thirdDate.isSaturday = true;
      } else if(moment(this.thirdDate.date).day() == 0) {
          this.thirdDate.isSunday = true;
      } else {
          for(let k = 0; k < this.specialDays.length; k++) {
              curDay = moment.unix(this.specialDays[k].startDay).format("YYYY-MM-DD");
              if(curDay == this.thirdDate.date) {
                  this.thirdDate.isSepcialDay = true;
              }
          }
      }
  }
  
  refreshEvent(that) {
      return setInterval(function() {
        that.regularRefresh();
    }, that.refreshInterval);
  }
  
  regularRefresh() {
      this.now = moment().unix();
      let pastTime = this.now - this.standardMoment;
      var nowLine = document.querySelector(".facilities .contents .date-grid-container .now-line");
      nowLine.style.marginLeft = this.calculateTimeSpece(this.giStart, this.now);
      
      if(this.isFirstLoad) {
          // var facilityList = document.querySelector(".facilities .contents .device-grid .device-use-grid");
          nowLine.style.height = (this.paddingWithOneDeviceLine * this.facilities.length) + "px";
          this.setTransverseScroll();
          var contentsHeader = document.querySelector(".facilities .contents .header");
          var navHeader = document.querySelector(".toolbar");
          this.navHeaderHeight = navHeader.offsetHeight;
          this.headerHeight = contentsHeader.offsetTop;
          this.isFirstLoad = false;
      } else if(pastTime >= this.refreshScrollAndEventsTime){
          let today = moment().format("YYYY-MM-DD");
          if(this.firstDate.date != today) {
              this.firstDate.date = today;
              this.changeFirstDate();
          }
          this.getSpecialDays();
          this.getEvents();
          this.setTransverseScroll();
      }
  }
  
  setTransverseScroll() {
      let transverseScroll = 7 * this.paddingWithOneHour;
      let transFromNow = this.calculateTimeSpece(this.giStart, this.now);
      transFromNow = parseInt(transFromNow.substring(0, transFromNow.indexOf("px")));
      if(this.isFirstLoad) {
          if(transFromNow != 0 && transFromNow < this.wholeDataGrid) {
              this.isNeedShowNowLine = true;
          }
      }
      
      // スクロールの位置は現在時点の二時間前に設定します。
      transFromNow = transFromNow - 2 * this.paddingWithOneHour;
      if(transFromNow > transverseScroll && transFromNow < this.wholeDataGrid) {
          transverseScroll = transFromNow;
      }
      var dateGrid = document.querySelector(".facilities .contents .date-grid-container");
      dateGrid.scrollLeft = transverseScroll;
  }
  
  
  calculateTimeSpece(startMoment, endMoment) {
      let widthForPeroid = 0;
      if(startMoment < endMoment) {
          let secondsOfOneHour =  60*60;
          let spanMinutes = endMoment - startMoment;
          widthForPeroid = spanMinutes / secondsOfOneHour * this.paddingWithOneHour;
      }
      widthForPeroid = widthForPeroid + "px";
      return widthForPeroid;
  }
  
//   onPageLoaded () {
//       debugger
//       this.setTransverseScroll();
//   }
  
  ngAfterViewInit() {
      this.pageContent.addScrollListener(this.scrollHeader(this));
  }
    
  resetToToday() {
      this.firstDate.date = moment().format("YYYY-MM-DD");
      this.changeFirstDate();
  }
  pickOneDayBefore() {
      this.firstDate.date = moment.unix(this.giStart).add(-1, "d").format("YYYY-MM-DD");
      this.changeFirstDate();
  }
  
  pickOneDayAfter() {
      this.firstDate.date = moment.unix(this.giStart).add(1, "d").format("YYYY-MM-DD");
      this.changeFirstDate();
  }
  
  changeFirstDate() {
      this.standardMoment = moment().unix();
      this.isFirstLoad = true;
      this.isLoadCompleted = false;
      this.isNeedShowNowLine = false;
      this.giStart = moment(this.firstDate.date).hour(0).minute(0).second(0).unix();
      this.giEnd = moment.unix(this.giStart).add(2, "d").unix();
      
      this.secondDate.date = moment.unix(this.giStart).add(1, "d").format("YYYY-MM-DD");
      this.thirdDate.date = moment.unix(this.giStart).add(2, "d").format("YYYY-MM-DD");
      
      this.getEvents();
      this.getSpecialDays();
  }
  
  
  showDetail(eventInfo) {
      this.standardMoment = moment().unix();
      let alert = Alert.create({
          subTitle: eventInfo.title,
          message: "予定詳細画面の実装を待っています......",
          buttons: ["ok"]
      });
      this.nav.present(alert);
  }
  
  scrollEvents() {
      this.standardMoment = moment().unix();
      var daysPeriod = document.querySelector(".facilities .days-period-container");
      var dateGrid = document.querySelector(".facilities .contents .date-grid-container");
      daysPeriod.scrollLeft = dateGrid.scrollLeft;
  }
  
  scrollHeader(that) {
      return function() {
          that.standardMoment = moment().unix();
          var contentsHeader = document.querySelector(".facilities .contents .header");
          var contentsHeader = document.querySelector(".facilities .contents .header");
          if (this.scrollTop > that.headerHeight) {
              contentsHeader.style.top=that.navHeaderHeight + "px";
              contentsHeader.style.position= "fixed";
              contentsHeader.style.background = "#FFFFFF";
              // z-indexを設定すると、エラーを報告します。
              // contentsHeader.style.z-index = 10;
          } else {
              contentsHeader.removeAttribute("style");
          }
      }       
  }
}
