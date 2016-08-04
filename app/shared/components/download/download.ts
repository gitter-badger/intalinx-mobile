// Third party library.
import {Component, ViewChild, Injectable, Directive, Input, ElementRef} from '@angular/core';
import { NgForm }    from '@angular/forms';
import {FORM_DIRECTIVES} from 'angular2/common';
// Config.
import {AppConfig} from '../../../appconfig';

// Utils.
import {Util} from '../../../utils/util';

@Component({
  selector: 'im-download',
  // directives: [FORM_DIRECTIVES],
  templateUrl: 'build/shared/components/download/download.html'
})
@Injectable()

export class DownloadDirective {
  @ViewChild('downloadIframe') downloadIframe: ElementRef;
  @ViewChild('downloadForm') downloadForm: NgForm;
  @Input('file-name') fileName: string;
  @Input('soap-message') soapMessage: string;
  @Input('fsearch-path') searchPath: string;
  @Input('file-size') fileSize: string;

  private inline: string;
  private anonymous: any;
  private contentType: string;
  private timeOut: any;
  private openInNewWindow: string;
  private dispositionType: string;
  private onError: string;

  private organizationalContext: string;
  private decode: boolean;
  private action: string;
  private target: string;
  private iframeName: string;
  // private downloadModel: any;

  private downloadModel = {
      'soapMessage': this.soapMessage,
      'action': this.action,
      'searchPath': this.searchPath,
      'contentType': this.contentType,
      'organizationalContext': this.organizationalContext,
      'timeOut': this.timeOut,
      'openInNewWindow': this.openInNewWindow,
      // 'resultHtml': this.resultHtml,
      'decode': this.decode,
      'dispositionType': this.dispositionType,
      'iframeName': this.iframeName,
    }

  constructor(private appConfig: AppConfig, private util: Util) {
    this.setDefaultValue();
  }

  setDefaultValue() {
    if (!this.anonymous) {
      this.anonymous = false;
    }
    if (!this.timeOut) {
      this.timeOut = 30000;
    }
    if (!this.contentType) {
      this.contentType = 'application/octet-stream';
    }

    if (!this.dispositionType) {
      this.dispositionType = 'attachment';
    }
    this.organizationalContext = this.appConfig.get('ORGANIZATION_CONTEXT');
    this.decode = true;

    // let form = element.find('form')[0];
    if (!this.openInNewWindow) {
      let iframeName = this.util.getUUID();
      this.iframeName = iframeName;
      // this.downloadIframe.name = iframeName;
      // this.downloadIframe.contentWindow.name = iframeName;
      this.target = iframeName;
    } else {
      this.target = '_blank';
    }

    if (!this.anonymous) {
      this.util.getSAMLart().then(data => {
        this.action = this.appConfig.get('BASE_URL') + this.appConfig.get('DOWNLOAD_GATEWAY_URL') +
        '?' + this.appConfig.get('SAMLART_NAME') + '=' + data +
        '&language=' + this.appConfig.get('USER_LANG');
      });
    } else {
      this.action = this.appConfig.get('BASE_URL') + this.appConfig.get('DOWNLOAD_GATEWAY_URL') +
        '?language=' + this.appConfig.get('USER_LANG');
    }
  }

  downloadFile($event) {
      // if (xmlSource.document.readyState === 'complete') {
        let response = this.util.parseXml(this.soapMessage); 
        let namespaces = {
          'cordys': 'http://schemas.cordys.com/General/1.0/',
          'SOAP': 'http://schemas.xmlsoap.org/soap/envelope/'
        };
        this.util.setXMLNamespaces(response, namespaces);
        debugger
        if (this.util.selectXMLNode(response, '//SOAP:Fault', namespaces) || this.util.selectXMLNode(response, '//error', namespaces)) {

          var faultStringNode = this.util.selectXMLNode(response, '//faultstring', namespaces);
          var faultString = this.util.getTextContent(faultStringNode);
          this.util.presentModal(faultString);
        }
        this.downloadForm.ngSubmit;
        // this.downloadForm.submit();
        // this.util.callCordysWebserviceWithUrl(this.action, response);
    // form.submit();
  }

  // onSubmit(){}

  // getFileSize(fileSize) {
  //   fileSize = Number(fileSize);
  //   if (Math.round(fileSize / 1024 / 1024 / 1024) > 0) {
  //     fileSize = Math.round(fileSize / 1024 / 1024) + ' ' + 'GB';
  //   } else if (Math.round(fileSize / 1024 / 1024) > 0) {
  //     fileSize = Math.round(fileSize / 1024 / 1024) + ' ' + 'MB';
  //   } else if (Math.round(fileSize / 1024) > 0) {
  //     fileSize = Math.round(fileSize / 1024) + ' ' + 'KB';
  //   } else if (fileSize > 0) {
  //     fileSize = fileSize + ' ' + 'Byte';
  //   } else {
  //     fileSize = '';
  //   }
  //   return fileSize;
  // }
}