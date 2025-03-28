import {LookThroughSettings} from './look-through-settings.model';
import {CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('LookThroughSettingsModel', () => {
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });
    it('should create an instance', () => {
        expect(new LookThroughSettings()).toBeTruthy();
    });

    it('tests Serialize/Deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const ltSettings: LookThroughSettings = getLookThroughSettings();
        expectAfter(ltSettings);
        const serialize = ltSettings.serialize();
        expectAfter(new LookThroughSettings(serialize));
    });

    it('tests Deserialize - with source having selectedProxyTypes instead of ltProxies', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const ltSettings: LookThroughSettings = new LookThroughSettings();
        expectBefore(ltSettings);
        const sourceToDeserializeFrom: any = getLookThroughSettings().serialize();
        // deleted ltProxies field
        delete sourceToDeserializeFrom.ltProxies;
        // added selectedProxyTypes field
        sourceToDeserializeFrom.selectedProxyTypes = 'DEF,FED';
        ltSettings.deserialize(sourceToDeserializeFrom);
        expectAfter(ltSettings);
    });

    it('tests Deserialize - with source as ltSettings object', () => {
        const ltSettings: LookThroughSettings = new LookThroughSettings();
        expectBefore(ltSettings);
        ltSettings.deserialize(getLookThroughSettings());
        expectAfter(ltSettings);
    });

    it('Tests doCopyFrom - ltSettings is defined', () => {
        const copiedLtSettings: LookThroughSettings = new LookThroughSettings();
        expectBefore(copiedLtSettings);
        copiedLtSettings.copyFrom(getLookThroughSettings());
        expectAfter(copiedLtSettings);
    });

    it('Tests doCopyFrom - ltSettings is not defined', () => {
        const copiedLtSettings: LookThroughSettings = new LookThroughSettings();
        copiedLtSettings.copyFrom(undefined);
        expectBefore(copiedLtSettings);
    });

    it('Tests doCopyFrom - ltSettings is null', () => {
        const copiedLtSettings: LookThroughSettings = new LookThroughSettings();
        copiedLtSettings.copyFrom(null);
        expectBefore(copiedLtSettings);
    });

    it('Tests isAnyLookthroughEnabled method', () => {
        const ltSettings: LookThroughSettings = new LookThroughSettings();
        // Should return false if no lookthrough is enabled
        expect(ltSettings.isAnyLookthroughEnabled()).toBeFalsy();

        // Enable bench lookthrough
        ltSettings.isBenchLookThroughEnabled = true;
        expect(ltSettings.isAnyLookthroughEnabled()).toBeTruthy();

        // Enable lookthrough
        ltSettings.isLookThroughEnabled = true;
        expect(ltSettings.isAnyLookthroughEnabled()).toBeTruthy();
    });

    it('tests addLookThroughSettingsToRequest', () => {
        const ltSettings: LookThroughSettings = getLookThroughSettings();
        const requestParams: any = {};
        ltSettings.addRequestParams(requestParams);
        expect(requestParams.isLookthroughEnabled).toEqual(true);
        expect(requestParams.ltSecurityTypes).toEqual('ABC,CBA');
        expect(requestParams.ltSecurityProxyTypes).toEqual('DEF,FED');
    });

    it('tests addLookThroughSettingsToRequest - with new ltSettings object', () => {
        const ltSettings: LookThroughSettings = new LookThroughSettings();
        ltSettings.isLookThroughEnabled = true;
        ltSettings.ltProxies =  ['proxy1', 'proxy2'];
        ltSettings.ltSecurityTypes = ['secType1', 'secType2'];
        const requestParams: any = {};
        ltSettings.addRequestParams(requestParams);
        expect(requestParams).toEqual({
            isLookthroughEnabled: true,
            isBenchLookthroughEnabled: false,
            ltSecurityTypes: 'secType1,secType2',
            ltSecurityProxyTypes: 'proxy1,proxy2'
        });
    });

    it('tests addLookThroughSettingsToRequest - with only bench enabled', () => {
        const ltSettings: LookThroughSettings = new LookThroughSettings();
        ltSettings.isLookThroughEnabled = false;
        ltSettings.isBenchLookThroughEnabled = true;
        ltSettings.ltProxies =  ['proxy1', 'proxy2'];
        ltSettings.ltSecurityTypes = ['secType1', 'secType2'];
        const requestParams: any = {};
        ltSettings.addRequestParams(requestParams);
        expect(requestParams).toEqual({
            isLookthroughEnabled: false,
            isBenchLookthroughEnabled: true,
            ltSecurityTypes: 'secType1,secType2',
            ltSecurityProxyTypes: 'proxy1,proxy2'
        });
    });

    /**
     * expect statements before 'method in test' execution
     */
    function expectBefore(ltSettings: LookThroughSettings): void {
        expect(ltSettings.isLookThroughEnabled).toBeFalsy();
        expect(ltSettings.isBenchLookThroughEnabled).toBeFalsy();
        expect(ltSettings.ltProxies.length).toBe(0);
        expect(ltSettings.ltSecurityTypes.length).toBe(0);
    }

    /**
     * expect statements after 'method in test' execution
     */
    function expectAfter(ltSettings: LookThroughSettings): void {
        expect(ltSettings.isLookThroughEnabled).toBeTruthy();
        expect(ltSettings.isBenchLookThroughEnabled).toBeTruthy();
        expect(ltSettings.ltProxies.length).toBe(2);
        expect(ltSettings.ltSecurityTypes.length).toBe(2);
    }

    /**
     * Function to create LookThrough settings for testing.
     */
    function getLookThroughSettings(): LookThroughSettings {
        const ltSettings: LookThroughSettings = new LookThroughSettings();
        ltSettings.isLookThroughEnabled = true;
        ltSettings.isBenchLookThroughEnabled = true;
        ltSettings.ltSecurityTypes.push('ABC');
        ltSettings.ltSecurityTypes.push('CBA');
        ltSettings.ltProxies.push('DEF');
        ltSettings.ltProxies.push('FED');

        return ltSettings;
    }
});
