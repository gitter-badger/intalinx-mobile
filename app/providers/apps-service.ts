// Third party library.
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

// Services.
import {ShareService} from './share-service';
import {BlogService} from './blog-service';
import {NotificationService} from './notification-service';

@Injectable()
export class AppsService {

    constructor(private http: Http, private share: ShareService, private blogService: BlogService, private notificationService: NotificationService) {
    }

    load() {
        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/appsservice/load.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    let items = Array.from(data);
                    items.forEach(function(element) {
                       this.getNewInformationCount(element);
                    }, this);
                    
                    resolve(items);
                });
        });
    }

    getNewInformationCount(item) {
        if (item.componentsId === 'blog') {
            this.blogService.getNotReadCommunityCountBySelf().then(data => {
                if (data) {
                    this.share.blogNewInformationCount = data;
                }
            });
        }
        if (item.componentsId === 'notification') {
            this.notificationService.getNotReadNotificationCountBySelf().then(data => {
                if (data) {
                    this.share.notificationNewInformationCount = data;
                }
            });
        }
    }
}

