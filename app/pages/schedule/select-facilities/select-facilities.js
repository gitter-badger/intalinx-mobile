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

    constructor(app, nav, util, viewCtrl, platform, params, scheduleService) {
        this.app = app;
        this.nav = nav;
        this.util = util;
        this.viewCtrl = viewCtrl;
        this.platform = platform;
        this.params = params;
        this.scheduleService = scheduleService;

        this.originFacilities = this.params.get("devices");
        this.getFacilities().then(data => {
            this.selectedFacilityCount = 0;
            this.setOriginSelectedFacilities();
        });

        this.selectedFacilities = new Array();
    }

    getFacilities() {
        return new Promise(resolve => {
            this.scheduleService.getDeviceListForSelect().then(devices => {
                this.facilities = devices;
                resolve(this.facilities);
            });

        });
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

    setOriginSelectedFacilities() {
        this.selectedUser = new Array();
        for (let i = 0; i < this.originFacilities.length; i++) {
            for (let j = 0; j < this.facilities.length; j++) {
                if (this.originFacilities[i].deviceID == this.facilities[j].facilityId) {
                    this.facilities[j].isSelected = true;
                    this.selectedFacilityCount++;
                    this.selectedFacilities.push(this.facilities[j]);
                }
            }

        }
    }

    close() {
        this.viewCtrl.dismiss(this.originFacilities);
    }

    selectFacilities() {
        let sendFacilities = new Array();
        this.selectedFacilities.forEach(function(selectedFacility) {
            let facility = {
                "deviceID": selectedFacility.facilityId,
                "deviceName": selectedFacility.facilityName
            }
            sendFacilities.push(facility);
        });
        this.viewCtrl.dismiss(sendFacilities);
    }

}