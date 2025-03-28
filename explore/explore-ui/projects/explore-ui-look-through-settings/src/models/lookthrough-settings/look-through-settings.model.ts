import {cloneDeep, isEmpty, isObject} from 'lodash';
import {
    AbstractFavoriteConfig,
    FavoriteDisplayEnum,
    RequestParamsCreator,
    SerializeFavoriteType
} from '@blk/explore-ui-core';

/**
 * Model class to hold LT settings at portfolio level.
 */
export class LookThroughSettings extends AbstractFavoriteConfig implements RequestParamsCreator {
    isLookThroughEnabled = false; // Flag to hold if LookThrough is enabled or not.
    isBenchLookThroughEnabled = false; // Flag to hold if Bench LookThrough is enabled or not.
    ltSecurityTypes: string[] = []; // Selected Security types for Look Through.
    ltProxies: string[] = []; // Selected Look Through Proxy Types.
    isLookThroughInheritanceEnabled = false; // Flag to hold if Lookthrough inheritance is enabled or not

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Returns true if either port lookthrough or bench lookthrough is enabled
     */
    isAnyLookthroughEnabled(): boolean {
        return this.isLookThroughEnabled || this.isBenchLookThroughEnabled;
    }

    /**
     * Function to add Look through settings to request params.
     */
    addRequestParams(requestParams: any): void {
        // Add request params only port or bench look through is enable.
        if (!this.isAnyLookthroughEnabled()) {
            return;
        }

        requestParams.isLookthroughEnabled = this.isLookThroughEnabled;
        requestParams.isBenchLookthroughEnabled = this.isBenchLookThroughEnabled;
        if (!isEmpty(this.ltSecurityTypes)) {
            requestParams.ltSecurityTypes = this.ltSecurityTypes.join(',');
        }
        if (!isEmpty(this.ltProxies)) {
            requestParams.ltSecurityProxyTypes = this.ltProxies.join(',');
        }
        if (this.isLookThroughInheritanceEnabled) {
            requestParams.isLookThroughInheritanceEnabled = this.isLookThroughInheritanceEnabled;
        }
    }

    /**
     * converts into java script object that get serialized as json.
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};
        data.isLookThroughEnabled = this.isLookThroughEnabled;
        data.isBenchLookThroughEnabled = this.isBenchLookThroughEnabled;
        if (this.isLookThroughInheritanceEnabled) {
            data.isLookThroughInheritanceEnabled = this.isLookThroughInheritanceEnabled;
        }
        data.ltSecurityTypes = this.ltSecurityTypes.join(',');
        data.ltProxies = this.ltProxies.join(',');
        return data;
    }

    /**
     * Deserialize information store in favorite into object.
     */
    protected doDeserialize(data: any): void {
        this.isLookThroughEnabled = data.isLookThroughEnabled;
        this.isBenchLookThroughEnabled = data.isBenchLookThroughEnabled;
        this.isLookThroughInheritanceEnabled = !!data.isLookThroughInheritanceEnabled;

        if (data instanceof LookThroughSettings) {
            // this happens when new Portfolio object is created it's create with actual instances of these objects.
            this.ltSecurityTypes = data.ltSecurityTypes;
            this.ltProxies = data.ltProxies;

        } else {
            const secTypes = data.ltSecurityTypes;
            if (secTypes && secTypes.length !== 0) {
                this.ltSecurityTypes = secTypes.split(',');
            }

            // in old favorites proxy types were stored as selected proxy types.
            // if nothing return from old favorite check for new favorite key
            const proxies = data.selectedProxyTypes ? data.selectedProxyTypes : data.ltProxies;
            if (proxies && proxies.length !== 0) {
                this.ltProxies = proxies.split(',');
            }
        }
    }

    /**
     * Return the config type
     */
    protected getConfigType(): string {
        return 'LT_SETTINGS_MODEL';
    }

    /**
     * Copy the fields from source to this object
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof LookThroughSettings)) {
            return;
        }

        this.ltProxies = cloneDeep(source.ltProxies);
        this.ltSecurityTypes = cloneDeep(source.ltSecurityTypes);
        this.isLookThroughEnabled = source.isLookThroughEnabled;
        this.isBenchLookThroughEnabled = source.isBenchLookThroughEnabled;
        this.isLookThroughInheritanceEnabled = source.isLookThroughInheritanceEnabled;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.LOOK_THROUGH_RULE;
    }
}
