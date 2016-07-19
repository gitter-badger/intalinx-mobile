import {Injectable} from '@angular/core';

@Injectable()
export class AppConfig {
    _config: any = {
        // 'BASE_URL': 'https://iscsys.intasect.co.jp/home/InternalSystem/',
        'BASE_URL': 'http://192.168.11.29/home/InternalSystem/',
        'GATEWAY_URL': 'com.eibus.web.soap.Gateway.wcp',
        'PRE_LOGIN_INFO_URL': 'com.eibus.sso.web.authentication.PreLoginInfo.wcp',
        'SAMLART_NAME': 'SAMLart',
        'SAML_ARTIFACT_STORAGE_NAME': 'defaultinst_SAMLart',
        USER_DEFAULT_AVATAR_IMAGE_URL: 'img/default',
        'PGYER' : {
            'ANDROID' : {
                'url' : 'https://www.pgyer.com/MMHC'
            },
            'IOS' : {
                'url' : 'https://www.pgyer.com/MMHB'
            }
        },
        'USER_LANG': 'en-US'
    };
    get(key: string): string {
        return this._config[key];
    }
    set(key: string, value: string): void {
        this._config[key] = value;
    }
}
