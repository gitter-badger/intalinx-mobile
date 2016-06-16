export class DateUtil {

    static transferCordysDateStringToUTC(sValue) {
        var fields = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(sValue);
        --fields[2]; // month is zero based
        return new Date(Date.UTC(fields[1], fields[2], fields[3], fields[4], fields[5], fields[6]));
    }

    static getUTCDate() {
        let oDate = new Date();

        // handle date part
        let dateSep = "-";
        let day = oDate.getUTCDate();
        let month = oDate.getUTCMonth() + 1;
        let sDay = (day < 10) ? '0' + day : day;
        let sMonth = (month < 10) ? '0' + month : month;
        let sValue = oDate.getUTCFullYear() + dateSep + sMonth + dateSep + sDay + "T";

        // handle time part
        let timeSep = ":";
        let hours = oDate.getUTCHours();
        let minutes = oDate.getUTCMinutes();
        let seconds = oDate.getUTCSeconds();
        let sHours = (hours < 10) ? '0' + hours : hours;
        let sMinutes = (minutes < 10) ? '0' + minutes : minutes;
        let sSeconds = (seconds < 10) ? '0' + seconds : seconds;
        sValue += sHours + timeSep + sMinutes + timeSep + sSeconds + "Z";

        return sValue;
    }
    
    static fromNow(cordysDate, translateService) {
        return DateUtil.fromNowCoreLogic(cordysDate, translateService);
    }
    
    static fromNowForNotification(cordysDate, translateService) {
        return DateUtil.fromNowCoreLogic(cordysDate, translateService, true);
    }

    static fromNowCoreLogic(cordysDate, translateService, hideTime) {
        return new Promise(resolve => {
            let date = moment(cordysDate, 'YYYY/MM/DDTHH:mm:ss.SSS');
            if (cordysDate.indexOf('T') < 0) {
                date = moment(cordysDate, 'YYYY/MM/DD HH:mm:ss');
            }
            
            // clone date and set 12:00 am
            let dateWithoutTime = moment(date).startOf('day');
            // today 12:00 am
            let nowWithoutTime = moment().startOf('day');
            
            // after today 12:00 am
            if (nowWithoutTime.isSame(dateWithoutTime)) {
                if (hideTime) {
                    translateService.get('app.date.today').subscribe(message => {
                        resolve(message);
                        console.log("message")
                    });
                } else {
                    resolve(date.fromNow());
                }
            }

            // after yesterday 12:00 am
            // 昨日 12:00 / 昨天 12:00 / Yesterday 12:00
            if (moment(nowWithoutTime).subtract(1, 'days').isSame(dateWithoutTime)) {
                translateService.get('app.date.yesterday').subscribe(message => {
                    if (hideTime) {
                        resolve(message);
                    } else {
                        resolve(message + date.format('H:mm'));
                    }
                });
            }

            // yesterday 12:00am ~ last week 12:00 am
            // X曜日 / 星期X / Mon.
            if (moment(nowWithoutTime).subtract(1, 'days').isAfter(dateWithoutTime) &&
                (moment(nowWithoutTime).subtract(7, 'days').isSame(dateWithoutTime) ||
                moment(nowWithoutTime).subtract(7, 'days').isBefore(dateWithoutTime))) {
                resolve(date.weekdays());
            }

            // 182days(half of a year) before 12:00am ~ last week 12:00 am
            // M月d日 / M月d日 / Mnd/d
            if (moment(nowWithoutTime).subtract(7, 'days').isAfter(dateWithoutTime) &&
                (moment(nowWithoutTime).subtract(182, 'days').isSame(dateWithoutTime) || 
                moment(nowWithoutTime).subtract(182, 'days').isBefore(dateWithoutTime))) {
                let parameter = {
                    "MM": (date.month() + 1),
                    "DD": date.date()
                };
                translateService.get('app.date.MMDD', parameter).subscribe(message => {
                    resolve(message);
                });
            }

            // 183days before 12:00am
            if (moment(nowWithoutTime).subtract(183, 'days').isAfter(dateWithoutTime)) {
                let parameter = {
                    "YYYY" : date.year(),
                    "MM": (date.month() + 1)
                };
                translateService.get('app.date.YYYYMM', parameter).subscribe(message => {
                    resolve(message);
                });
            }
        });
    }
}