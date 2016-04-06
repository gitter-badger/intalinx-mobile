export class DateUtil {
    constructor() {

    }

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
    
    
}