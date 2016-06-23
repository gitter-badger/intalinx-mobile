import {Page, NavController, Component, Platform} from 'ionic-angular';
//import {Component} from '@angular/core';

/*
  Generated class for the FacilitiesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/schedule/facilities/facilities.html',
})
export class FacilitiesPage {
  static get parameters() {
    return [[NavController], [Platform]];
  }

  constructor(nav, platform) {
    this.nav = nav;
    this.platform = platform;
    this.isLandscape = platform.isLandscape();
    
    this.pickedDate = "";
    this.events = [
        {
            eventName: "test left",
            width: "20px",
            background: "pink",
            eventMarginLeft: "2px",
            eventMarginTop: "4px"
        },
        {
            eventName: "test right",
            width: "50px",
            background: "green",
            eventMarginLeft: "230px",
            eventMarginTop: "34px"
        },
        {
            eventName: "test bottom",
            width: "80px",
            background: "red",
            eventMarginLeft: "47px",
            eventMarginTop: "155px"
        }
    ];
    
    this.facilities = ["a","b","c","d","e","f","g"];
    this.dateTimes = ["12 am","1 am","2 am","3 am","4 am","5 am", 
                      "6 am","7 am","8 am","9 am","10 am","11 am", 
                      "12 pm","1 pm","2 pm","3 pm","4 pm","5 pm", 
                      "6 pm", "7 pm","8 pm","9 pm","10 pm","11 pm"];
                      
    
  }
  
  changePickedDate() {
      
  }
}
