import {Page, IonicApp, NavController, Content, Modal, ViewController, Platform, NavParams, Alert} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../../utils/util';
import {ScheduleService} from '../../../providers/schedule-service';

@Page({
  templateUrl: 'build/pages/schedule/select-participants/select-participants.html',
  providers:[Util,
             ScheduleService],
  pipes:[TranslatePipe]
})
export class SelectParticipantsPage {
  static get parameters() {
    return [[IonicApp], [NavController], [Util], [ViewController], [Platform], [NavParams], [ScheduleService]];
  }

  constructor(app, nav, util, viewCtrl, platform, navParams, scheduleService) {
    this.app = app;
    this.nav = nav;
    this.util = util;
    this.viewCtrl = viewCtrl;
    this.platform = platform;
    this.navParams = navParams;
    this.scheduleService = scheduleService
    
    this.orgs = this.getOrganizationAndUsers();
    this.selectedUserIDs = new Array();
    this.curSelectUser = "";
    this.selectedUserCount = 0;
    this.selectUser = new Array();
  }
  
  getOrganizationAndUsers() {
      this.scheduleService.getOrganizationList().then(orgs => {
          
          this.scheduleService.getHumanResourceUserInfoList().then(users => {
            this.orgsWithUsers = new Array();
            for (let i = 0; i < orgs.length; i++) {
                let usersInOrg = new Array();
                for (let j = 0; j < users.length; j++) {
                    if (orgs[i].organizationCode == users[j].assignOrgCd) {
                        let user = {
                            "userId": users[j].userId,
                            "userName": users[j].userName,
                            "assignOrgCd": users[j].assignOrgCd,
                            "isSelected": false,
                        }
                        usersInOrg.push(user);
                    }
                }
                let orgWithUsers = {
                    organizationCode: orgs[i].organizationCode,
                    organizationName: orgs[i].organizationName,
                    users: usersInOrg
                }
                this.orgsWithUsers.push(orgWithUsers);
            }
          });
      });
  }
  
  dismiss() {
      this.viewCtrl.dismiss(this.selectedUserIDs);
  }
  
   searchUsers() {
      
  }
  
  changeSelectedUser(user) {
      if (user.isSelected == true) {
          this.selectUser.push(user);
          this.selectedUserCount++;
      } else {
          let index = this.selectUser.indexOf(user);
          if(index != -1) {
              this.selectUser.splice(index, 1);
          }
          this.selectedUserCount--;
      }
  }
}
