import {Page, IonicApp, NavController, Content, Modal, ViewController, Platform, NavParams, Alert} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../../utils/util';
import {ScheduleService} from '../../../providers/schedule-service';

@Page({
    templateUrl: 'build/pages/schedule/select-facilities/select-facilities.html',
    providers: [Util,
        ScheduleService],
    pipes: [TranslatePipe]
})
export class SelectFacilitiesPage {
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

        this.getFacilities();
        this.selectedFacilityCount = 0;
        this.selectedFacilities = new Array();
    }

    getFacilities() {
        this.scheduleService.getDeviceListForSelect().then(devices => {
            this.facilities = devices;
        });
    }

    close() {
        this.viewCtrl.dismiss();
    }

    findFacilities(event) {
        this.isSearching = true;
        let facilityName = event.value;

        this.foundFacilities = this.facilities;
        if (facilityName && facilityName.trim() != '') {
            this.foundFacilities = this.foundFacilities.filter((facility) => {
                return (facility.facilityName.toLowerCase().indexOf(facilityName.toLowerCase()) > -1);
            })
        } else {
            this.isSearching = false;
        }
    }

    changeSelectedFacility(facility) {
        if (facility.isSelected == true) {
            this.selectedFacilities.push(facility);
            this.selectedFacilityCount++;
        } else {
            let index = this.selectedFacilities.indexOf(facility);
            if (index != -1) {
                this.selectedFacilities.splice(index, 1);
            }
            this.selectedFacilityCount--;
        }
    }

    selectFacilities() {
        this.viewCtrl.dismiss(this.selectedFacilities);
    }
}
