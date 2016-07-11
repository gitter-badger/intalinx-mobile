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
    
    this.orgs = this.getOrganizationList();
    this.users = this.getHumanResourceUserInfoList();
    this.selectedUserIDs = new Array();
    this.curSelectUser = "";
    this.orgUsers = new Array();
    
    // for test
    // this.orgUsers = this.users;
  }
  
  getOrganizationList() {
      this.scheduleService.getOrganizationList().then(data => {
          this.orgs = data;
      });
  }
  
  getHumanResourceUserInfoList() {
      this.scheduleService.getHumanResourceUserInfoList().then(data => {
          this.users = data;
      });
  }
  
  openOrgUsers(orgId) {
      let orgName="test";
      this.getOrgUsers(orgId);
      let alert = Alert.create();
      alert.setTitle(orgName);
      let curUsers = this.orgUsers;
      for(let i = 0; i < curUsers.length; i++)
      {
          let curUser = curUsers[i];
          alert.addInput({
            type: 'checkbox',
            label: curUser.userName,
            value: curUser.userId
          });
      }
      this.app.translate.get(["app.action.cancel", "app.action.ok"]).subscribe(message => {
      let ok = message['app.action.ok'];
      let cancel = message['app.action.cancel'];
      alert.addButton(cancel);
      alert.addButton({
          text: ok,
          handler: data => {
            for(let i=0; i < data.length; i++) {
                this.selectedUserIDs.push(data[i]);
            };
          }
      });
      this.nav.present(alert);
      });
  }
  selectedUpdated() {
      this.getOrgUsers(orgId);
  }
  
  getOrgUsers(orgId) {
      let usersInOrg = new Array();
      let allUsers = this.users;
      for(let i = 0; i < allUsers.length; i++) {
          let curUser = allUsers[i];
          // if(curUser.orgId == orgId) {
              usersInOrg.push(curUser);
          // }
      }
      this.orgUsers = usersInOrg;
  }
  
  dismiss() {
      this.viewCtrl.dismiss(this.selectedUserIDs);
  }
}
