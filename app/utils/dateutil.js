export class DateUtil {
    constructor() {

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