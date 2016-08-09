// Third party library.
import {Injectable} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {NavController} from 'ionic-angular';

// Config.
import {AppConfig} from '../appconfig';

import {ShareService} from './share-service';

// Utils.
import {Util} from '../utils/util';

@Injectable()
export class UserService {

    constructor(private translate: TranslateService, 
        private nav: NavController, 
        private appConfig: AppConfig, 
        private util: Util,
        private shareService: ShareService) {
    }

    loggedOn(): Promise<boolean> {
        return this.util.loggedOn();
    }

    enableAutoLogin(loginID, password, server) {
        this.util.enableAutoLogin(loginID, password, server);
    }

    disableAutoLogin() {
        this.util.disableAutoLogin();
    }

    authenticate(loginID, password): Promise<any> {
        return new Promise(resolve => {
            this.util.authenticate(loginID, password).then(authenticationResult => {
                resolve(authenticationResult);
            });
        });
    }

    updateProfile(user): Promise<any> {
        return new Promise(resolve => {
            if (this.validateUserPassword(user.newPassword, user.confirmPassword)) {

                this.util.getRequestXml('./assets/requests/set_password.xml').then((req: string) => {
                    let objRequest = this.util.parseXml(req);
                    this.util.setNodeText(objRequest, './/*[local-name()=\'OldPassword\']', user.oldPassword);
                    this.util.setNodeText(objRequest, './/*[local-name()=\'NewPassword\']', user.newPassword);
                    req = this.util.xml2string(objRequest);

                    this.util.callCordysWebservice(req, true).then(data => {
                        resolve(true);
                    }, err => {
                        let errResponse = this.util.parseXml(err.text());
                        let errMsg = this.util.getNodeText(errResponse, './/*[local-name()=\'faultstring\']');
                        if (this.appConfig.get('USER_LANG').toLowerCase() === 'zh-cn' && errMsg.indexOf('does not match the current password') >= 0) {
                            this.translate.get('app.profile.message.error.mismatchCurrentPassword').subscribe(message => {
                                this.util.presentModal(message);
                            });
                        } else {
                            this.util.presentModal(errMsg);
                        }
                    });
                });
            }
        });
    }

    validateUserPassword(newPassword, confirmPassword): boolean {
        let passwordEmptyFault = newPassword === '' && confirmPassword === '';
        let arePasswordsSame = newPassword === confirmPassword;
        if (passwordEmptyFault) {
            this.translate.get('app.profile.message.error.emptyPassword').subscribe(message => {
                this.util.presentModal(message);
            });
        } else if (!arePasswordsSame) {
            this.translate.get('app.profile.message.error.mismatchPassword').subscribe(message => {
                this.util.presentModal(message);
            });
        }
        return !passwordEmptyFault && arePasswordsSame;
    }

    getUserDetails(): Promise<any> {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_user_details.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);
                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);
                    let userOutput = this.util.selectXMLNode(objResponse, './/*[local-name()=\'User\']');
                    let originalUser = this.util.xml2json(userOutput).User;
                    let userAvatar = originalUser.ContactInformation.address;
                    if (!userAvatar) {
                        userAvatar = this.appConfig.get('USER_DEFAULT_AVATAR_IMAGE_URL');
                    }
                    let user = {
                        'userID': originalUser.UserName,
                        'userName': originalUser.Description,
                        'email': originalUser.ContactInformation.email,
                        'phone': originalUser.ContactInformation.phone,
                        'fax': originalUser.ContactInformation.fax,
                        'userAvatar': userAvatar,
                        'company': originalUser.ContactInformation.company
                    };
                    resolve(user);
                });
            });
        });
    }

    setUserDetails(user): Promise<any> {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/set_user_details.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, './/*[local-name()=\'Description\']', user.userName);
                this.util.setNodeText(objRequest, './/*[local-name()=\'email\']', user.email);
                this.util.setNodeText(objRequest, './/*[local-name()=\'phone\']', user.phone);
                this.util.setNodeText(objRequest, './/*[local-name()=\'fax\']', user.fax);
                this.util.setNodeText(objRequest, './/*[local-name()=\'address\']', user.userAvatar);
                this.util.setNodeText(objRequest, './/*[local-name()=\'company\']', user.company);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    resolve(user);
                });
            });
        });
    }

    changeUserAvatar(userAvatar): Promise<any> {
        return new Promise(resolve => {
            this.getUserDetails().then((user: any) => {
                user.userAvatar = userAvatar;
                this.setUserDetails(user).then(user => {
                    resolve(user);
                });
            });
        });
    }
    
    getUserID(): string {
        return this.shareService.user.userID
    }

    getUser(): any[] {
        return this.shareService.user;
    }

    getOrganizationList(): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/user/get_organanization_list.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);
                    let organizationOutputs = this.util.selectXMLNodes(objResponse, './/*[local-name()=\'OrganizationOutput\']');
                    let orgs = new Array();
                    for (let i = 0; i < organizationOutputs.length; i++) {
                        orgs.push(this.util.xml2json(organizationOutputs[i]).OrganizationOutput);
                    }

                    orgs.forEach(function (element) {
                        if (element.parentOrganizationCode && element.parentOrganizationCode !== '') {
                            let curParentOrganizationCode = element.parentOrganizationCode;
                            for (let index = 0; index < orgs.length; index++) {
                                if (orgs[index].organizationCode === curParentOrganizationCode) {
                                    let parentOrganizationName = orgs[index].organizationName;
                                    let curOrganizationName = element.organizationName;
                                    element.organizationName = parentOrganizationName
                                        + '・' + curOrganizationName;
                                    break;
                                }
                            }
                        }
                    }, this);

                    resolve(orgs);
                });
            });
        });
    }

    getHumanResourceUserInfoList(): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/user/get_human_resource_user_info_list.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);
                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);

                    let userOutputs = this.util.selectXMLNodes(objResponse, './/*[local-name()=\'UserOutput\']');
                    let usrs = new Array();
                    for (let i = 0; i < userOutputs.length; i++) {
                        let userOutput = this.util.xml2json(userOutputs[i]).UserOutput;
                        let user = userOutput;
                        user['isSelected'] = false;
                        user['userID'] = userOutput.userId;
                        usrs.push(user);
                    }
                    resolve(usrs);
                });
            });
        });
    }
}