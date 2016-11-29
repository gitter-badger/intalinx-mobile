import {Badge} from 'ionic-native';
import {Platform} from 'ionic-angular';

export class ShareService {
    
    public platform: Platform;
    private _notificationNewInformationCount: number = 0;
    private _blogNewInformationCount: number = 0;
    private _surveyNewInformationCount: number = 0;

    public initializeMenu: any;
    public initializeUser: any;
    public redirectLoginPage: any;
    public showMenu: any;
    public alertForSystemError: any;
    public nav: any;
    public user: any;
    
    constructor() {

    }

    set notificationNewInformationCount(count: number) {
        this._notificationNewInformationCount = count;
        if (this.platform.is('cordova')) {
            Badge.clear();
            Badge.set(this._notificationNewInformationCount + this._blogNewInformationCount);
        }
    }

    get notificationNewInformationCount(): number {
        return this._notificationNewInformationCount;
    }

    set blogNewInformationCount(count: number) {
        this._blogNewInformationCount = count;
        if (this.platform.is('cordova')) {
            Badge.clear();
            Badge.set(this._notificationNewInformationCount + this._blogNewInformationCount);
        }
    }

    get blogNewInformationCount(): number {
        return this._blogNewInformationCount;
    }
    
    set surveyNewInformationCount(count: number) {
        this._surveyNewInformationCount = count;
        if (this.platform.is('cordova')) {
            Badge.clear();
            Badge.set(this._surveyNewInformationCount + this._surveyNewInformationCount);
        }
    }

    get surveyNewInformationCount(): number {
        return this._surveyNewInformationCount;
    }
}