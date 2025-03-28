import {isUndefined} from 'lodash';
import {UserMetaDataUtils} from '../../user-meta-data/user-meta-data.utils';
import {CoreDefinitionStore} from '../core-definition.store';

export class TokenUtils {
    /**
     * Checks if the Feature is enabled based on the token value passed in
     */
    static isFeatureEnabled(tokenName: string): boolean {
        const tokenValue = CoreDefinitionStore.tokens[tokenName];
        if (!tokenValue) {
            return false;
        }
        if (tokenValue.includes('true') || tokenValue.includes('false')) {
            return tokenValue === 'true';
        }
        return tokenValue === 'Y';
    }

    /**
     * checks if an option is enabled based on token and user perm passed in
     */
    static isOptionEnabledBasedOnTokenOrUserPerm(tokenToCheck: string, userPermToCheck?: string): boolean {
        let isEnabled = true;
        // check if there is token
        if (!isUndefined(tokenToCheck)) {
            isEnabled = TokenUtils.isFeatureEnabled(tokenToCheck);
        }

        // check if it's disabled/enabled by user perms. User perm can override token. even if token is disabled
        // for environment a particular widget can be enabled via user perms.
        if (!isEnabled && !isUndefined(userPermToCheck)) {
            isEnabled = UserMetaDataUtils.getUserPerm(userPermToCheck);
        }

        return isEnabled;
    }

    /**
     * Check if multi-manager options are enabled for a specific widget
     */
    static isValueDelimitedFeatureEnabled(tokenName: string, delimiter: string, delimitedValue: string): boolean {
        // Taken value will be a pipe seperated string of widget types, for eg: RNE|PGS|FBA
        const tokenValue: string[] = CoreDefinitionStore.tokens[tokenName]?.split(delimiter);

        if (!tokenValue || tokenValue[0] === 'N') {
            return false;
        }
        return tokenValue.includes(delimitedValue);
    }
}
