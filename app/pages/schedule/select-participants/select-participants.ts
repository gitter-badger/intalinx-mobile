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
    templateUrl: 'build/pages/schedule/select-participants/select-participants.html',
    providers: [Util,
        ScheduleService]
})
export class SelectParticipantsPage {

    private originUsers: any;
    private selectedUsers: any = new Array();
    private selectedUsersCount: number;
    private allUsers: any;
    private orgsWithUsers: any = new Array();
    private isSearching:  boolean;
    private foundUserMembers: any;

    constructor(private nav: NavController, private viewCtrl: ViewController, private util: Util, private params: NavParams, private scheduleService: ScheduleService) {
        this.originUsers = this.params.get('participants');
        this.getOrganizationAndUsers().then(data => {
            this.selectedUsersCount = 0;
            this.setOriginSelectedUsers();
        });
    }

    getOrganizationAndUsers() {
        return new Promise(resolve => {
            this.scheduleService.getOrganizationList().then((orgs: any[]) => {

                this.scheduleService.getHumanResourceUserInfoList().then((users: any[]) => {
                    // all users
                    this.allUsers = users;

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
            this.selectedUsers.push(user);
            this.selectedUsersCount++;
        } else {
            let index = this.selectedUsers.indexOf(user);
            if (index !== -1) {
                this.selectedUsers.splice(index, 1);
            }
            this.selectedUsersCount--;
        }
    }

    setOriginSelectedUsers() {
        for (let i = 0; i < this.originUsers.length; i++) {
            for (let j = 0; j < this.allUsers.length; j++) {
                if (this.originUsers[i].userID === this.allUsers[j].userID) {
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
                'userID': selectedUser.userID,
                'userName': selectedUser.userName
            }
            sendUsers.push(user);
        });
        this.viewCtrl.dismiss(sendUsers);
    }
}
