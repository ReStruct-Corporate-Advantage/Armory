export class CoreAppUtils {
    // External BEN domain name
    static readonly BEN_DOMAIN_NAME = 'www.blackrock.com';

    // External BENDMZ domain name
    static readonly BENDMZ_DOMAIN_NAME =  'bendmz.blackrock.com';

    // TST BEN domain name
    static readonly TST_BEN_DOMAIN_NAME = 'test3.blackrock.com';

    // BENEUDMZ domain name
    static readonly BEN_EU_DMZ_DOMAIN_NAME = 'eu.blackrock.com';

    /**
     * Checks if the app is launched at an external BEN client
     */
    static isExternalBENClient(): boolean {
        return (
            location.hostname === CoreAppUtils.BEN_DOMAIN_NAME ||
            location.hostname === CoreAppUtils.TST_BEN_DOMAIN_NAME ||
            location.hostname === CoreAppUtils.BENDMZ_DOMAIN_NAME ||
            location.hostname === CoreAppUtils.BEN_EU_DMZ_DOMAIN_NAME
        );
    }
}
