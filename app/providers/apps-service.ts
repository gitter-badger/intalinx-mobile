// Third party library.
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Badge} from 'ionic-native';
import {Platform} from 'ionic-angular';

// Services.
import {ShareService} from './share-service';
import {BlogService} from './blog-service';
import {NotificationService} from './notification-service';

@Injectable()
export class AppsService {

    constructor(private http: Http, 
        private platform: Platform,
        private share: ShareService, 
        private blogService: BlogService, 
        private notificationService: NotificationService) {

    }

    load() {
        // don't have the data yet
        return new Promise(resolve => {
            if (this.platform.is('cordova')) {
                // Clear badge.
                Badge.clear();
            }

            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/appsservice/load.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    let items = Array.from(data);
                    this.getNewInformationCount();
                    resolve(items);
                });
        });
    }

    getNewInformationCount() {
        this.blogService.getNotReadCommunityCountBySelf().then((data: string) => {
            if (data) {
                this.share.blogNewInformationCount = Number(data);
            }
        });
        this.notificationService.getNotReadNotificationCountBySelf().then((data: string) => {
            if (data) {
                this.share.notificationNewInformationCount = Number(data);
            }
        });
    }
}

