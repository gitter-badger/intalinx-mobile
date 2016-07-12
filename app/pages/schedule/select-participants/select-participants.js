import {Page, IonicApp, NavController, Content, Modal, ViewController, Platform, NavParams, Alert} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../../utils/util';
import {ScheduleService} from '../../../providers/schedule-service';

@Page({
    templateUrl: 'build/pages/schedule/select-participants/select-participants.html',
    providers: [Util,
        ScheduleService],
    pipes: [TranslatePipe]
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
        this.scheduleService = scheduleService;

        this.getOrganizationAndUsers();
        this.selectedUserCount = 0;
        this.selectedUser = new Array();
    }

    getOrganizationAndUsers() {
        this.scheduleService.getOrganizationList().then(orgs => {

            this.scheduleService.getHumanResourceUserInfoList().then(users => {
                // all users
                this.allUsers = users;
                
                this.orgsWithUsers = new Array();
                for (let i = 0; i < orgs.length; i++) {
                    let usersInOrg = new Array();
                    for (let j = 0; j < users.length; j++) {
                        if (orgs[i].organizationCode == users[j].assignOrgCd) {
                            usersInOrg.push(users[j]);
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

    close() {
        this.viewCtrl.dismiss();
    }

    findUsers(event) {
        this.isSearching = true;
        let userName = event.value;

        this.foundUserMembers = this.allUsers;
        if (userName && userName.trim() != '') {
            this.foundUserMembers = this.foundUserMembers.filter((user) => {
                return (user.userName.toLowerCase().indexOf(userName.toLowerCase()) > -1);
            })
        } else {
            this.isSearching = false;
        }
    }
    changeSelectedUser(user) {
        if (user.isSelected == true) {
            this.selectedUser.push(user);
            this.selectedUserCount++;
        } else {
            let index = this.selectedUser.indexOf(user);
            if (index != -1) {
                this.selectedUser.splice(index, 1);
            }
            this.selectedUserCount--;
        }
    }

    selectUsers() {
        this.viewCtrl.dismiss(this.selectedUser);
    }
}
