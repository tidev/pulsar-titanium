'use babel'

export default {
 
    /**
     * iOS provisioning profile matches App ID
     * 
     * @param {String} profileAppId 
     * @param {String} appId 
     * @return {Boolean}
     */
    iOSProvisioinngProfileMatchesAppId(profileAppId, appId) {

        // allow wildcard
        if (profileAppId === '*') return true;

        // allow explicit match
        if (profileAppId === appId) return true;

        // limited wildcard
        if (profileAppId.indexOf('*') == profileAppId.length-1) {
            const profileAppIdPrefix = profileAppId.substr(0, profileAppId.length-1);
            if (appId.indexOf(profileAppIdPrefix) == 0) return true;
        }

        return false;
    }

}