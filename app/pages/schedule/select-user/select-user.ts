// Third party library.
import {Injectable, Component} from '@angular/core';
import {NavController, NavParams, Content, Slides, Modal, ViewController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Config.
import {AppConfig} from '../../../appconfig';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ScheduleService} from '../../../providers/schedule-service';
import {UserService} from '../../../providers/user-service';

// Pages.
import {EventDetailPage} from '../event-detail/event-detail';
import {EditEventPage} from '../edit-event/edit-event';

@Component({
    templateUrl: 'build/pages/schedule/select-user/select-user.html',
    providers: [Util,
        ScheduleService]
})
export class SelectUserPage {

    private selectedUserCount = 0;
    private selectedUser: any = new Array();
    private allUsers: any;
    private orgsWithUsers: any = new Array();
    private isSearching: boolean;
    private foundUserMembers: any;

    constructor(private nav: NavController, private viewCtrl: ViewController, private util: Util, private params: NavParams, private scheduleService: ScheduleService) {
        this.getOrganizationAndUsers();
    }

    getOrganizationAndUsers() {
        return new Promise(resolve => {
            this.scheduleService.getOrganizationList().then((orgs: any[]) => {

                this.scheduleService.getHumanResourceUserInfoList().then((users: any[]) => {
                    // all users
                    this.allUsers = users;
                    // this.foundUserMembers = this.allUsers;
                    for (let i = 0; i < orgs.length; i++) {
                        let usersInOrg = new Array();
                        for (let j = 0; j < users.length; j++) {
                            if (orgs[i].organizationCode === users[j].assignOrgCd) {
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
                    resolve('true');
                });
            });
        });
    }

    findUsers(event: any) {
        this.isSearching = true;
        let userName = event.value;

        this.foundUserMembers = this.allUsers;
        if (userName && userName.trim() !== '') {
            this.foundUserMembers = this.foundUserMembers.filter((user) => {
                return (user.userName.toLowerCase().indexOf(userName.toLowerCase()) > -1);
            })
        } else {
            this.isSearching = false;
        }
    }

    changeSelectedUser(user: any) {
        if (user.isSelected === true) {
            this.allUsers.forEach(function (everyuser) {
                if (user.userId !== everyuser.userId && everyuser.isSelected === true) {
                    everyuser.isSelected = false;
                }
            });
            this.selectedUser = user;
            this.selectedUserCount = 1;
        } else {
            this.selectedUser = '';
            this.selectedUserCount = 0;
        }
    }

    close() {
        this.viewCtrl.dismiss();
    }

    selectUsers() {
        this.viewCtrl.dismiss(this.selectedUser);
    }
}
