import {Injectable} from '@angular/core';

@Injectable()
export class AppConfig {
    private config: any = {
        // 'BASE_URL': 'https://iscsys.intasect.co.jp/home/InternalSystem/',
        'BASE_URL': 'http://192.168.11.29/home/intalinxcloud/',
        'GATEWAY_URL': 'com.eibus.web.soap.Gateway.wcp',
        'PRE_LOGIN_INFO_URL': 'com.eibus.sso.web.authentication.PreLoginInfo.wcp',
        'SAMLART_NAME': 'SAMLart',
        'SAML_ARTIFACT_STORAGE_NAME': 'defaultinst_SAMLart',
        'SAML_NOT_ON_AFTER_STORAGE_NAME': 'notOnAfter',
        'AUTO_LOGIN_STORAGE_NAME': 'autoLogin',
        'LOGIN_ID_STORAGE_NAME': 'loginID',
        'PASSWORD_STORAGE_NAME': 'password',
        USER_DEFAULT_AVATAR_IMAGE_URL: 'img/default',
        'PGYER_ANDROID_URL' : 'https://www.pgyer.com/MMHC',
        'PGYER_IOS_URL' : 'https://www.pgyer.com/MMHB',
        'USER_LANG': 'en-US'
    };
    get(key: string): string {
        return this.config[key];
    }
    set(key: string, value: string): void {
        this.config[key] = value;
    }
}
