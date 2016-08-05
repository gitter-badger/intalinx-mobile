// Third party library.
import {ViewChild, Component, NgZone, ElementRef} from '@angular/core';
import {NavController, Loading, Modal, Toast, NavParams, ViewController, Platform} from 'ionic-angular';
import {TRANSLATE_PROVIDERS, TranslateService, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
/// <reference path="./exif-ts/exif.d.ts" />
import * as EXIF from 'exif-ts/exif';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';

// Pages.
import {BlogIndexPage} from '../index/index';
import {PreviewBlogPage} from '../preview-blog/preview-blog';
import {SelectParticipantsPage} from '../../schedule/select-participants/select-participants';

@Component({
  templateUrl: 'build/pages/blog/add-blog/add-blog.html',
  providers: [
    BlogService,
    Util,
    SelectParticipantsPage
  ]
})
export class AddBlogPage {
  private loading: any;
  private isDisabled: boolean = true;
  private pictureName: string = 'picture';
  private pictureCount: number = 0;
  private blog: any = {
    'title': '',
    'selectedUsers': '',
    'content': ''
  }
  private picture: any;
  private pictures: any = new Array();
  private readLimit = {
    'readLimitType': 'allUsers',
    'readLimitTypeName': ''
  };
  private sendDataToSelectReadLimitTypePage: any = {
    'isSelected': false,
    'readLimit': '',
    'selectedUsers': ''
  };

  constructor(private nav: NavController,
    private params: NavParams,
    private view: ViewController,
    private zone: NgZone,
    private platform: Platform,
    private blogService: BlogService,
    private translate: TranslateService,
    private util: Util) {
  }

  addPicture() {
    this.translate.get(['app.profile.message.loading.avatarLoading']).subscribe(message => {
      let content = message['app.profile.message.loading.avatarLoading'];
      this.loading = Loading.create({
        spinner: 'ios',
        content: content
      });
      this.nav.present(this.loading);
    });
    let a = event.bubbles;
    // There we used the (<any>param) to change the type of EventTarget to any. This should be re-discussion.
    let fileInput = (<any>event.currentTarget);
    for (let i = 0; i < fileInput.files.length; i++) {
      let file = fileInput.files[i];
      if (file) {
        if (file.type && !/image/i.test(file.type)) {
          return false;
        }
        let reader = new FileReader();
        let wholeThis = this;
        reader.onload = function (e) {
          // There we used the (<any>param) to change the type of EventTarget to any. This should be re-discussion.
          wholeThis.render(file, (<any>e.target).result, wholeThis);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  render(file, src, other) {
    EXIF.getData(file, function () {
      // get the Orientation of avatar.
      let orientation = EXIF.getTag(this, 'Orientation');

      let image = new Image();
      image.onload = function () {
        var degree = 0, drawWidth, drawHeight, width, height;
        drawWidth = image.naturalWidth;
        drawHeight = image.naturalHeight;
        let quality = 0;
        let canvas = document.createElement('canvas');

        canvas.width = width = drawWidth;
        canvas.height = height = drawHeight;
        let context = canvas.getContext('2d');

        switch (orientation) {
          // take photo when home key is on the left of iphone
          case 3:
            degree = 180;
            drawWidth = -width;
            drawHeight = -height;
            break;
          // take photo when home key is on the bottom of iphone
          case 6:
            canvas.width = height;
            canvas.height = width;
            degree = 90;
            drawWidth = width;
            drawHeight = -height;
            break;
          // take photo when home key is on the top of iphone
          case 8:
            canvas.width = height;
            canvas.height = width;
            degree = 270;
            drawWidth = -width;
            drawHeight = height;
            break;
        }
        // //user canvas to rotate the picture
        context.rotate(degree * Math.PI / 180);
        context.drawImage(image, 0, 0, drawWidth, drawHeight);
        if (file.size <= 200 * 1024) {
          quality = 1;
        } else if (file.size > 200 * 1024 && file.size <= 500 * 1024) {
          quality = 0.5;
        } else if (file.size > 500 * 1024 && file.size <= 1 * 1024 * 1024) {
          quality = 0.3;
        } else if (file.size > 1 * 1024 * 1024 && file.size <= 2 * 1024 * 1024) {
          quality = 0.1;
        } else if (file.size > 2 * 1024 * 1024 && file.size <= 5 * 1024 * 1024) {
          quality = 0.01;
        } else {
          other.loading.dismiss();
          other.translate.get('app.profile.message.error.avatarTooLarge').subscribe(message => {
            other.util.presentModal(message);
          });
          other.isSelectChange = false;
          return false;
        }
        other.zone.run(() => {
          let base64 = canvas.toDataURL('image/jpeg', quality);
          other.pictureCount = other.pictureCount + 1;
          other.picture = {
            'pictureName': other.pictureName + other.pictureCount.toString(),
            'pictureSrc': base64
          };
          other.pictures.push(other.picture);
          other.isSelectChange = true;
          other.isLoadCompleted = true;
          other.loading.dismiss();
        });
      };
      image.src = src;
    });
  }

  previewBlog() {
    let content = this.getRealContent();
    let previewBlog: any = {
      'title': this.blog.title,
      'selectedUsers': this.blog.selectedUsers,
      'content': content
    }
    let previewModal = Modal.create(PreviewBlogPage, { 'previewBlog': previewBlog });
    this.nav.present(previewModal);
  }

  saveBlog() {
    let content = this.getRealContent();
    let saveBlog: any = {
      'title': this.blog.title,
      'selectedUsers': this.blog.selectedUsers,
      'content': content,
      'allMemberFlag': this.blog.allMemberFlag,
      'actionFlag': 'PUBLISH'
    };
    // this.saveBlog.selectedUsers.push();
    this.blogService.insertCommunity(saveBlog).then(data => {
      if (data === 'true') {
        this.nav.pop();
      }
    });
  }

  getRealContent(): string {
    let content = this.util.replaceHtmlTagCharacter(this.blog.content);
    for (let i = 0; i < this.pictures.length; i++) {
      content = content + '<img src=' + this.pictures[i].pictureSrc + ' />';
    }
    return content;
  }

  selectReadLimitType() {
    this.sendDataToSelectReadLimitTypePage.readLimit = this.readLimit;
    this.nav.push(SelectReadLimitTypePage, { 'sendDataToSelectReadLimitTypePage': this.sendDataToSelectReadLimitTypePage });
  }

  changeBlog() {
    if (this.blog.title && this.blog.content && (this.blog.allMemberFlag === 'TRUE' || this.sendDataToSelectReadLimitTypePage.selectedUsers.length > 0)) {
      this.isDisabled = null;
    } else {
      this.isDisabled = true;
    }
  }

  ionViewWillEnter(): void {
    if (this.sendDataToSelectReadLimitTypePage.isSelected) {
      this.readLimit = this.sendDataToSelectReadLimitTypePage.readLimit;
      if (this.readLimit.readLimitType === 'selectUsers') {
        this.blog.allMemberFlag = 'FALSE';

        this.readLimit.readLimitTypeName = '指定';
      } else {
        this.blog.allMemberFlag = 'TRUE';
        this.readLimit.readLimitTypeName = '全員';
      }
    } else {
      this.blog.allMemberFlag = 'TRUE';
      this.readLimit.readLimitTypeName = '全員';
    }
  }
}

@Component({
  template: `
  <ion-header>
    <ion-navbar>
      <ion-title>{{"閲覧権限" | translate}}</ion-title>
      <ion-buttons end>
          <button (click)="setReadLimitType()">{{ "選択" | translate }}</button>
      </ion-buttons>
      </ion-navbar>
  </ion-header>
  <ion-content>
      <ion-list radio-group [(ngModel)]="readLimitType" (ionChange)="changeReadLimit()">
        <ion-item>
          <ion-label>全員</ion-label>
          <ion-radio value="allUsers"></ion-radio>
        </ion-item>
        <button ion-item>
          <ion-label>指定<span [hidden]="!selectedUsers || selectedUsers.length<0">{{selectedUsers.length}}人</span></ion-label>
          <ion-radio value="selectUsers">
          </ion-radio>
        </button>
      </ion-list>
    </ion-content>
  `
})
class SelectReadLimitTypePage {
  private readLimitType: string = '';
  private readLimitTypeName: string = '';
  private selectedUsers: any;
  private sendDataToSelectReadLimitTypePage: any;
  private isFirstTimeEnterPage: boolean = true;
  constructor(private nav: NavController, private params: NavParams, private translate: TranslateService, private util: Util) {
    this.sendDataToSelectReadLimitTypePage = this.params.get('sendDataToSelectReadLimitTypePage');
    this.readLimitType = this.sendDataToSelectReadLimitTypePage.readLimit.readLimitType;
    this.selectedUsers = this.sendDataToSelectReadLimitTypePage.selectedUsers;
    this.sendDataToSelectReadLimitTypePage.isSelected = false;
  }

  setReadLimitType(): void {
    if (this.readLimitType === 'selectUsers' && (!this.selectedUsers || this.selectedUsers.length <= 0)) {
      this.translate.get('指定の場合').subscribe(message => {
          this.util.presentModal(message);
      });
    } else {
      this.sendDataToSelectReadLimitTypePage.isSelected = true;
      this.sendDataToSelectReadLimitTypePage.readLimit.readLimitType = this.readLimitType;
      this.sendDataToSelectReadLimitTypePage.readLimit.readLimitTypeName = this.readLimitTypeName;
      this.sendDataToSelectReadLimitTypePage.selectedUsers = this.selectedUsers;
      this.nav.pop();
    }
  }

  changeReadLimit(): void {
    if (!this.isFirstTimeEnterPage) {
      if (this.readLimitType === 'selectUsers') {
        this.readLimitTypeName = '指定';
        this.chooseUsers();
      } else {
        this.readLimitTypeName = '全員';
        this.selectedUsers = '';
      }
    }
    this.isFirstTimeEnterPage = false;
  }

  chooseUsers(): void {
    let participantsModal = Modal.create(SelectParticipantsPage, { 'participants': this.selectedUsers });
    participantsModal.onDismiss(data => {
      this.selectedUsers = data;
    });
    this.nav.present(participantsModal);
  }
}




