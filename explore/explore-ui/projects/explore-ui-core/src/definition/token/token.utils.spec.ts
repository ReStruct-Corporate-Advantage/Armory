import {CoreUserMetaDataStore} from '../../user-meta-data/core-user-meta-data.store';
import {UserMetaData} from '../../user-meta-data/user-meta-data.model';
import {CoreDefinitionStore} from '../core-definition.store';
import {TokenUtils} from './token.utils';
import {TokenConstants} from './token.constants';

describe('TokenUtils', () => {

    const delimiter = '|';
    const tokenName = 'dummyToken';
    const widgetType = 'RNE';

    beforeEach(() => {
        // Reset tokens before each test
        CoreDefinitionStore.tokens = {};
    });
    /**
     * Test case for method isOptionEnabledBasedOnTokenOrUserPerm
     */
    it('Test isOptionEnabledBasedOnTokenOrUserPerm', function () {
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_PERF_ATTR] = 'Y';
        expect(TokenUtils.isOptionEnabledBasedOnTokenOrUserPerm(TokenConstants.ENABLE_PERF_ATTR, TokenConstants.PERF_DATA_ACCESS)).toBe(true);

        CoreDefinitionStore.tokens[TokenConstants.ENABLE_PERF_ATTR] = 'N';
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData[TokenConstants.PERF_DATA_ACCESS] = true;
        expect(TokenUtils.isOptionEnabledBasedOnTokenOrUserPerm(TokenConstants.ENABLE_PERF_ATTR, TokenConstants.PERF_DATA_ACCESS)).toBe(true);

        CoreUserMetaDataStore.userMetaData[TokenConstants.PERF_DATA_ACCESS] = false;
        expect(TokenUtils.isOptionEnabledBasedOnTokenOrUserPerm(TokenConstants.ENABLE_PERF_ATTR, TokenConstants.PERF_DATA_ACCESS)).toBe(false);
    });

    /**
     * Test case for method isFeatureEnabled
     */
    it('Test isFeatureEnabled', function () {
        const tokenName = 'dummyToken';

        // Token value not set
        expect(TokenUtils.isFeatureEnabled(tokenName)).toBe(false);

        CoreDefinitionStore.tokens[tokenName] = 'Y';
        expect(TokenUtils.isFeatureEnabled(tokenName)).toBe(true);

        CoreDefinitionStore.tokens[tokenName] = 'N';
        expect(TokenUtils.isFeatureEnabled(tokenName)).toBe(false);

        CoreDefinitionStore.tokens[tokenName] = 'true';
        expect(TokenUtils.isFeatureEnabled(tokenName)).toBe(true);

        CoreDefinitionStore.tokens[tokenName] = 'false';
        expect(TokenUtils.isFeatureEnabled(tokenName)).toBe(false);
    });


    it('should return false if tokenValue is null', () => {
        CoreDefinitionStore.tokens[tokenName] = null;
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, delimiter, widgetType)).toBe(false);
    });

    it('should return false if tokenValue is undefined', () => {
        CoreDefinitionStore.tokens[tokenName] = undefined;
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, delimiter, widgetType)).toBe(false);
    });

    it('should return false if tokenValue is "N"', () => {
        CoreDefinitionStore.tokens[tokenName] = 'N';
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, delimiter, widgetType)).toBe(false);
    });

    it('should return false if tokenValue does not include the widget type token', () => {
        CoreDefinitionStore.tokens[tokenName] = 'PGS|FBA';
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, delimiter, widgetType)).toBe(false);
    });

    it('should return true if tokenValue includes the widget type token', () => {
        CoreDefinitionStore.tokens[tokenName] = 'RNE|PGS';
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, delimiter, widgetType)).toBe(true);
    });

    it('should return true if tokenValue includes the widget type token and delimiter is different', () => {
        const customDelimiter = ',';
        CoreDefinitionStore.tokens[tokenName] = 'RNE,PGS';
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, customDelimiter, widgetType)).toBe(true);
    });

    it('should return false if tokenValue does not include the widget type token and delimiter is different', () => {
        const customDelimiter = ',';
        CoreDefinitionStore.tokens[tokenName] = 'PGS,FBA';
        expect(TokenUtils.isValueDelimitedFeatureEnabled(tokenName, customDelimiter, widgetType)).toBe(false);
    });
});
