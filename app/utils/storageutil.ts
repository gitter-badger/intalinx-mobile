export class StorageUtil {

    constants: any = {
        NOT_ON_OR_AFTER: 'notOnOrAfter'
    };

    constructor() {

    }

    getStorage() {
        return sessionStorage;
    }

    setSAMLart(key, value, notOnOrAfter) {
        this.getStorage().setItem(key, value);
        this.getStorage().setItem(this.constants.NOT_ON_OR_AFTER, notOnOrAfter);
    }

    getSAMLart(key) {
        if (this.hasSAMLart(key)) {
            return this.getStorage().getItem(key);
        }
    }

    getSAMLartExpireDate(key) {
        if (this.getStorage().getItem(key)) {
            return this.getStorage().getItem(this.constants.NOT_ON_OR_AFTER);
        }
    }

    removeSAMLart(key) {
        this.getStorage().removeItem(key);
        this.getStorage().removeItem(this.constants.NOT_ON_OR_AFTER);
    }

    hasSAMLart(key) {
        let hasSAMLart = true;
        if (this.getSAMLartExpireDate(key) && new Date(this.getSAMLartExpireDate(key)) < new Date()) {
            this.removeSAMLart(key);
            hasSAMLart = false;
        }
        return hasSAMLart;
    }
}