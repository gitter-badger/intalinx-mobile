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

    constructor(app, nav, util, viewCtrl, platform, params, scheduleService) {
        this.app = app;
        this.nav = nav;
        this.util = util;
        this.viewCtrl = viewCtrl;
        this.platform = platform;
        this.params = params;
        this.scheduleService = scheduleService;

        this.originUsers = this.params.get("participants");
        this.getOrganizationAndUsers().then(data => {
            this.selectedUsersCount = 0;
            this.setOriginSelectedUsers();
        });
    }

    getOrganizationAndUsers() {
        return new Promise(resolve => {
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
                    resolve("true");
                });
            });
        });
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
            this.selectedUsers.push(user);
            this.selectedUsersCount++;
        } else {
            let index = this.selectedUsers.indexOf(user);
            if (index != -1) {
                this.selectedUsers.splice(index, 1);
            }
            this.selectedUsersCount--;
        }
    }

    setOriginSelectedUsers() {
        this.selectedUsers = new Array();
        for (let i = 0; i < this.originUsers.length; i++) {
            for (let j = 0; j < this.allUsers.length; j++) {
                if (this.originUsers[i].userID == this.allUsers[j].userId) {
                    this.allUsers[j].isSelected = true;
                    this.selectedUsersCount++;
                    this.selectedUsers.push(this.allUsers[j]);
                }
            }
        }
    }

    close() {
        this.viewCtrl.dismiss(this.originUsers);
    }

    selectUsers() {
        let sendUsers = new Array();
        this.selectedUsers.forEach(function(selectedUser) {
            let user = {
                "userID": selectedUser.userId,
                "userName": selectedUser.userName
            }
            sendUsers.push(user);
        });
        this.viewCtrl.dismiss(sendUsers);
    }
}
