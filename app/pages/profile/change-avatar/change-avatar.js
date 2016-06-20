import {Page, IonicApp, NavController, Modal, Toast, Alert, NavParams, ViewController, Platform} from 'ionic-angular';
import {ViewChild} from '@angular/core'
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
        return [[IonicApp], [NavController], [NavParams], [ViewController], [Platform], [UserService]];
    }

    constructor(app, nav, params, view, platform, userService) {
        this.app = app;
        this.nav = nav;
        this.params = params;
        this.user = this.params.get("user");
        
        this.view = view;
        this.platform = platform;
        
        this.initAvatar = this.user.userAvatar;
        
        this.userAvatar = this.initAvatar;
        this.isSelectChange = false;
        this.selectedImageFile = "";

        this.userService = userService;
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isDisabled = null;
    }

    onFileInputChange(event) {
        let fileInput = event.currentTarget;
        debugger
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
            //获取照片本身的Orientation
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
                    //iphone横屏拍摄，此时home键在左侧
                    case 3:
                        degree = 180;
                        drawWidth=-width;
                        drawHeight=-height;
                        break;
                    //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
                    case 6:
                        canvas.width=height;
                        canvas.height=width; 
                        degree=90;
                        drawWidth=width;
                        drawHeight=-height;
                        break;
                    //iphone竖屏拍摄，此时home键在上方
                    case 8:
                        canvas.width=height;
                        canvas.height=width; 
                        degree=270;
                        drawWidth=-width;
                        drawHeight=height;
                        break;
                }
                //使用canvas旋转校正
                context.rotate(degree * Math.PI / 180);
                context.drawImage(image, 0, 0, drawWidth, drawHeight);
                if (file.size <= 500 * 1024) {
                    quality = 100;
                } else if(file.size > 500 * 1024 && file.size <= 1 * 1024 * 1024) {
                    quality = 50;
                } else if(file.size > 1 * 1024 * 1024 && file.size <= 2 * 1024 * 1024) {
                    quality = 40;
                } else if(file.size > 2 * 1024 * 1024 && file.size <= 5 * 1024 * 1024) {
                    quality = 10;
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
                
                let base64 = canvas.toDataURL("image/jpeg", quality);
                other.userAvatar = base64;

                other.isSelectChange = true;
            };
            image.src = src;
        });
    }
    
    changeUserAvatar() {
        this.isDisabled = true;
        this.userService.changeUserAvatar(this.userAvatar).then(data => {
            if (data == "true") {
                 this.app.translate.get(["app.profile.message.success.changeAvatar"]).subscribe(message => {
                    let content = message['app.profile.message.success.changeAvatar'];
                    let toast = Toast.create({
                        message: content,
                        duration: 3000,
                        position: 'middle'
                    });
                    this.nav.present(toast);
                 });
                this.isSelectChange = false;
                this.fileInput.nativeElement.value = '';
            }
            this.isDisabled = null;
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
    
    presentPreviewAvatar() {
        let previewAvatar = Modal.create(PreviewAvatar);
        this.nav.present(previewAvatar);
    }
    
    resetUserAvatar() {
        this.userAvatar = this.initAvatar;
        this.fileInput.nativeElement.value = '';
        this.isSelectChange = false;
    }
}
