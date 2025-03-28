import {CoreAppUtils} from "./core.app.utils";

describe('test isExternalBENClient', () => {

    const originalWindowLocation = window.location;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: new URL(window.location.href),
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: originalWindowLocation,
        });
    });

    it('should return true if location.hostname is BEN_DOMAIN_NAME', () => {
        window.location.href = 'https://www.blackrock.com';
        expect(CoreAppUtils.isExternalBENClient()).toBeTruthy();
    });

    it('should return true if location.hostname is TST_BEN_DOMAIN_NAME', () => {
        window.location.href = 'https://test3.blackrock.com';
        expect(CoreAppUtils.isExternalBENClient()).toBeTruthy();
    });

    it('should return true if location.hostname is BENDMZ_DOMAIN_NAME', () => {
        window.location.href = 'https://bendmz.blackrock.com';
        expect(CoreAppUtils.isExternalBENClient()).toBeTruthy();
    });

    it('should return true if location.hostname is BEN_EU_DMZ_DOMAIN_NAME', () => {
        window.location.href = 'https://eu.blackrock.com';
        expect(CoreAppUtils.isExternalBENClient()).toBeTruthy();
    });

    it('should return false if location.hostname is not BEN_DOMAIN_NAME, TST_BEN_DOMAIN_NAME, BENDMZ_DOMAIN_NAME or BEN_EU_DMZ_DOMAIN_NAME', () => {
        window.location.href = 'https://www.example.com';
        expect(CoreAppUtils.isExternalBENClient()).toBeFalsy();
    });
});
