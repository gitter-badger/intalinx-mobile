import {Page, IonicApp, NavController, Loading, Modal, Toast, Alert, NavParams, ViewController, Platform} from 'ionic-angular';
import {ViewChild, NgZone} from '@angular/core'
import * as EXIF from 'exif-js';

import {UserService} from '../../../providers/user-service/user-service';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {Util} from '../../../utils/util';

@Page({
    templateUrl: 'build/pages/profile/change-avatar/change-avatar.html',
    providers: [
        UserService,
        Util
    ],
    pipes: [TranslatePipe],
    queries: {
        fileInput: new ViewChild('fileInput')
    }
})
export class ChangeAvatarPage {
    
    static get parameters() {
        return [[IonicApp], [NavController], [NavParams], [ViewController], [NgZone], [Platform], [UserService]];
    }

    constructor(app, nav, params, view, zone, platform, userService) {
        this.app = app;
        this.nav = nav;
        this.params = params;
        this.user = this.params.get("user");
        this.isLoadCompleted = true;
        this.zone = zone;
        this.view = view;
        this.platform = platform;
        
        this.initAvatar = this.user.userAvatar;
        
        this.userAvatar = this.initAvatar;
        this.isSelectChange = false;
        this.selectedImageFile = "";

        this.userService = userService;
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    onFileInputChange() {
        this.isLoadCompleted = false;
        this.app.translate.get(["app.profile.message.loading.avatarLoading"]).subscribe(message => {
            let content = message['app.profile.message.loading.avatarLoading'];
            this.loading = Loading.create({
                spinner: 'ios',
                content: content
            });
            this.nav.present(this.loading);
        });
        let fileInput = event.currentTarget;
        let file = fileInput.files[0];
        
        if (file) {
            if (file.type && !/image/i.test(file.type)) {
                return false;
            }
            let reader = new FileReader();
            let wholeThis = this;
            reader.onload = function(e) {
                wholeThis.render(file, e.target.result, wholeThis);
            };
            reader.readAsDataURL(file);
        }
    }

    render(file, src, other) {
        EXIF.getData(file, function() {
            //get the Orientation of avatar
            let orientation = EXIF.getTag(this, "Orientation");

            let image = new Image();
            image.onload = function() {
                var degree = 0, drawWidth, drawHeight, width, height;
                drawWidth = image.naturalWidth;
                drawHeight = image.naturalHeight;
                let quality = 0;
                let canvas = document.createElement('canvas');

                canvas.width = width = drawWidth;
                canvas.height = height = drawHeight;
                let context = canvas.getContext('2d');

                switch (orientation) {
                    //thake photo when home key is on the left of iphone
                    case 3:
                        degree = 180;
                        drawWidth=-width;
                        drawHeight=-height;
                        break;
                    //thake photo when home key is on the bottom of iphone
                    case 6:
                        canvas.width=height;
                        canvas.height=width; 
                        degree=90;
                        drawWidth=width;
                        drawHeight=-height;
                        break;
                    //thake photo when home key is on the top of iphone
                    case 8:
                        canvas.width=height;
                        canvas.height=width; 
                        degree=270;
                        drawWidth=-width;
                        drawHeight=height;
                        break;
                }
                // //user canvas to rotate the picture
                context.rotate(degree * Math.PI / 180);
                context.drawImage(image, 0, 0, drawWidth, drawHeight);
                if (file.size <= 200 * 1024) {
                    quality = 1;
                } else if(file.size > 200 * 1024 && file.size <= 500 * 1024) {
                    quality = 0.5;
                } else if(file.size > 500 * 1024 && file.size <= 1 * 1024 * 1024) {
                    quality = 0.3;
                } else if(file.size > 1 * 1024 * 1024 && file.size <= 2 * 1024 * 1024) {
                    quality = 0.1;
                } else if(file.size > 2 * 1024 * 1024 && file.size <= 5 * 1024 * 1024) {
                    quality = 0.01;
                } else {
                    other.app.translate.get(["app.blog.message.error.title", "app.profile.message.error.avatarTooLarge", "app.action.ok"]).subscribe(message => {
                        let title = message['app.blog.message.error.title'];
                        let ok = message['app.action.ok'];
                        let content = message['app.profile.message.error.avatarTooLarge'];
                        let alert = Alert.create({
                            title: title,
                            subTitle: content,
                            buttons: [ok]
                        });
                        other.nav.present(alert);
                    });
                    other.isSelectChange = false;
                    return false;
                }
                other.zone.run(() => {
                    let base64 = canvas.toDataURL("image/jpeg", quality);
                    other.userAvatar = base64;
                    other.isSelectChange = true;
                    other.isLoadCompleted = true;
                    other.loading.dismiss();
                }); 
            };
            image.src = src;
        });
    }
    
    changeUserAvatar() {
        this.isLoadCompleted = false;
        this.app.translate.get(["app.profile.message.loading.avatarUploading"]).subscribe(message => {
            let content = message['app.profile.message.loading.avatarUploading'];
            let upLoading = Loading.create({
                spinner: 'ios',
                content: content
            });
             this.nav.present(upLoading).then(() => {
                this.userService.changeUserAvatar(this.userAvatar).then(data => {
                    if (data == "true") {
                        this.app.translate.get(["app.profile.message.success.changeAvatar"]).subscribe(message => {
                            let content = message['app.profile.message.success.changeAvatar'];
                            let toast = Toast.create({
                                message: content,
                                duration: 3000,
                                cssClass: 'middle'
                            });
                            // this.nav.present(toast);
                        });
                        this.isSelectChange = false;
                        this.fileInput.nativeElement.value = '';
                    }
                    upLoading.dismiss();
                    this.isLoadCompleted = true;
                });
            });
        });
    }

    onPageWillEnter() {
        if (this.platform.is('ios')) {
            this.app.translate.get(["app.action.back"]).subscribe(message => {
                let title = message['app.action.back'];
                this.view.setBackButtonText(title);
            });
        }
    }
    
    resetUserAvatar() {
        this.userAvatar = this.initAvatar;
        this.fileInput.nativeElement.value = '';
        this.isSelectChange = false;
    }
}
