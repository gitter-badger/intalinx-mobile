// Third party library.
import {ViewChild, Component, NgZone, ElementRef} from '@angular/core';
import {NavController, Loading, Modal, Toast, NavParams, ViewController, Platform} from 'ionic-angular';
import {TRANSLATE_PROVIDERS, TranslateService, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
/// <reference path="./exif-ts/exif.d.ts" />
import * as EXIF from 'exif-ts/exif';


// Utils.
import {Util} from '../../../utils/util';

// Pages.
import {BlogIndexPage} from '../index/index';
import {PreviewBlogPage} from '../preview-blog/preview-blog';

@Component({
  templateUrl: 'build/pages/blog/add-blog/add-blog.html',
})
export class AddBlogPage {
  private loading: any;
  private pictureName: string = 'picture';
  private pictureCount: number = 0;
  private blog: any = {
    'title': '',
    'replyList': '',
    'content': ''
  }
  private picture: any;
  private pictures: any = new Array();

  constructor(private nav: NavController,
    private params: NavParams,
    private view: ViewController,
    private zone: NgZone,
    private platform: Platform,
    private translate: TranslateService,
    private util: Util) {
  }

  changeTitle() {

  }

  changeContent(event) {

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
    let file = fileInput.files[0];

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
          other.blog.content = other.blog.content + '{{' + other.picture.pictureName + '}}';
          // other.blog.content = other.blog.content + '<img src=' + base64 + ' />';
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
      'replyList': this.blog.replyList,
      'content': content
    }
    let previewModal = Modal.create(PreviewBlogPage, { 'previewBlog': previewBlog });
    this.nav.present(previewModal);
  }

  getHoverPosition(event) {
    // debugger
  }

  saveBlog() {
    let content = this.getRealContent();

  }

  getRealContent(): string {
    let content = this.blog.content;
    for (let i = 0; i < this.pictures.length; i++) {
      let pictureName = '{{' + this.pictures[i].pictureName + '}}';
      if (content.indexOf(pictureName)) {
        content = content.replace(pictureName, '<img src=' + this.pictures[i].pictureSrc + ' />');
      }
    }
    return content;
  }

}
