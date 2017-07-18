import {Injectable} from '@angular/core';

@Injectable()
export class AppConfig {
    private config: any = {
        'IS_TABLET': false,
        'BASE_URL': 'https://iscsys.intasect.co.jp/home/InternalSystem/',
        'BASE_URL_JAPAN': 'https://iscsys.intasect.co.jp/home/InternalSystem/',
        'BASE_URL_CHINA': 'http://www.intalinx.cn/home/intalinxcloud/',
        'BIZNAVI_URL_JAPAN': 'https://iscsys.intasect.co.jp/biznavi/#/login?SAMLart=',
        'BIZNAVI_URL_CHINA': 'http://www.intalinx.cn/biznavi/#/login?SAMLart=',
        'DOWNLOAD_GATEWAY_URL': 'com.eibus.web.tools.download.Download.wcp',
        'GATEWAY_URL': 'com.eibus.web.soap.Gateway.wcp',
        'PRE_LOGIN_INFO_URL': 'com.eibus.sso.web.authentication.PreLoginInfo.wcp',
        'SAMLART_NAME': 'SAMLart',
        'SAML_ARTIFACT_STORAGE_NAME': 'defaultinst_SAMLart',
        'SAML_NOT_ON_AFTER_STORAGE_NAME': 'notOnAfter',
        'AUTO_LOGIN_STORAGE_NAME': 'autoLogin',
        'LOGIN_ID_STORAGE_NAME': 'loginID',
        'PASSWORD_STORAGE_NAME': 'password',
        'SERVER_STORAGE_NAME': 'server',
        'USER_DEFAULT_AVATAR_IMAGE_URL': 'assets/img/default',
        'DOWNLOAD_URL_JAPAN' : 'https://intasect.github.io',
        'DOWNLOAD_URL_CHINA' : 'https://intalinx.oschina.io',
        'USER_LANG': 'en-US',
        'GOOGLE_ANALYTICS_TRACK_ID': 'UA-81438804-1',
        'GOOGLE_ANALYTICS_TRACK_ID_JAPAN': 'UA-81438804-1',
        'GOOGLE_ANALYTICS_TRACK_ID_CHINA': 'UA-81699991-1',
        'DATETIME_YEAR_MONTH_DAY_MIN': '2014-01-01',
        'DATETIME_YEAR_MONTH_DAY_MAX': '2020-12-31',
        'DATETIME_MINUTE_VALUES': '00, 15, 30, 45'
    };
    get(key: string): string {
        return this.config[key];
    }
    set(key: string, value: string): void {
        this.config[key] = value;
    }
}