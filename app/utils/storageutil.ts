export class StorageUtil {
    
    static get constants() {
        return {
            NOT_ON_OR_AFTER: "notOnOrAfter"
        }
    }
    
    constructor() {
        
    }
    
    static getStorage() {
        return sessionStorage;
    }
    
    static setSAMLart(key, value, notOnOrAfter) {
        this.getStorage().setItem(key, value);
        this.getStorage().setItem(this.constants.NOT_ON_OR_AFTER, notOnOrAfter);
    }
    
    static getSAMLart(key) {
        if (this.hasSAMLart(key)) {
            return this.getStorage().getItem(key);
        }
    }
    
    static getSAMLartExpireDate(key) {
        if (this.getStorage().getItem(key)) {
            return this.getStorage().getItem(this.constants.NOT_ON_OR_AFTER);
        }
    }
    
    static removeSAMLart(key) {
        this.getStorage().removeItem(key);
        this.getStorage().removeItem(this.constants.NOT_ON_OR_AFTER);
    }
    
    static hasSAMLart(key) {
        let hasSAMLart = true;
        if (this.getSAMLartExpireDate(key) && new Date(this.getSAMLartExpireDate(key)) < new Date()) {
            this.removeSAMLart(key);
            hasSAMLart = false;
        }
        return hasSAMLart;
    }
}