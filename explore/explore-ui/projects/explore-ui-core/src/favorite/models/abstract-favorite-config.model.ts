import {isNil, isNumber, isUndefined, isString} from 'lodash';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {FavoriteDisplayEnum, SerializeFavoriteType} from '../enums';
import {ConfigTypeFactory} from '../factories';
import {CoreFavoriteUtils} from '../utils';
import {Favorite} from './favorite.model';
import {CoreFavoriteConstants, FavoriteStatus} from '../constants';
import {CoreUserMetaDataStore} from '../../user-meta-data/core-user-meta-data.store';
import momentTz from 'moment-timezone';
import {TokenUtils} from '../../definition/token/token.utils';
import {TokenConstants} from '../../definition/token/token.constants';

/**
 * Class used as the base class for any favorites item that can be saved as a favorites.
 * This adds the id, title and owner attributes.
 */
export abstract class AbstractFavoriteConfig extends AbstractConfig {

    static dateTimeRegex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} [A-Z]{3}$/;

    // Sybase favorites have number ID, ADL favorites have UUID (string)
    id: number|string;
    // An Alias ID refers to another ID that this favorite can refer to (Migrated favorites will have a UUID)
    aliasId: string;
    title: string;
    owner: string;
    tool: string;
    // timestamp of when favorite was last updated (or favorite version created)
    dateLastUpdated: string;
    // user who last updated favorite (or created favorite version)
    lastUpdatedBy: string;
    // permission groups who own enterprise favorite
    userPermGrps: string[];

    // ADL specific fields //
    // summary of the change being made when favorite saved
    changeSummary: string;
    // detailed summary of the change being made when favorite saved
    changeSummaryDetail: string;
    // version number of the favorite
    versionNumber: number;
    // ID of the latest version of the favorite
    latestFavoriteVersion: string;
    // ID of the current version of the favorite
    currentFavoriteVersion: string;
    // description of the enterprise favorite
    enterpriseDescription: string;

    statusTag: FavoriteStatus;

    /**
     * Returns the human-readable text for the type of favorite
     */
    static getDisplayName(displayType: FavoriteDisplayEnum): string {
        return CoreFavoriteConstants.FAVORITE_DISPLAY_NAMES[displayType];
    }

    /**
     * Serialize the config to json.
     *
     * NOTE:  This should be a final method to ensure that the nested fav is handled correctly.
     */
    serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): any {
        // If the favorites is nested and we have an id then we should return a nested favorites config instead.
        // NOTE: The ordering of the key value pairs is importing as the middleware depends on it to parse linked favorites.
        // The global flag should be placed before favId.
        let saveLinkedFav = this.saveLinkedFavorite(isNested);
        if (shouldSaveLinkedFav) {
            saveLinkedFav = saveLinkedFav || shouldSaveLinkedFav(this);
        }
        if (saveLinkedFav) {
            return {
                isGlobalFav: CoreFavoriteUtils.isGlobalFavorite(this.owner),
                favId: this.id,
                configType: this.getConfigType()
            };
        }

        // If we got here with the SERIALIZE_FAVORITE type then we need to switch this to
        // SERIALIZE_LINKED_FAV after the first favorite as we want linked favorites from
        // that point on.
        if (SerializeFavoriteType.SERIALIZE_FAVORITE === isNested) {
            isNested = SerializeFavoriteType.SERIALIZE_LINKED_FAV;
        } else if (SerializeFavoriteType.FAVORITE_CHANGE_DETECTION === isNested) {
            // after serializing the top favorite, any nested favorites we just want to serialize the link to
            isNested = SerializeFavoriteType.FAVORITE_CHANGE_DETECTION_LINK;
        }

        // Serialize the data within this fav.
        const data: any = this.doSerialize(isNested, shouldSaveLinkedFav);

        // Add the title to the data if there is anything.
        if (data) {
            data.title = this.title;
        }

        return data;
    }

    /**
     * Deserialize the config to json.
     *
     * NOTE:  This should be a final method to ensure that the nested fav is handled correctly.
     */
    deserialize(data: any): void {
        // If the data has the favId then we need to load the favorite from the favorite service.
        if (data.favId) {
            const linkedFav: AbstractFavoriteConfig = ConfigTypeFactory.getFavoriteConfig(data.favId, data.isGlobalFav);

            // If the data is null or undefined then just get out of here.
            if (isNil(linkedFav)) {
                console.log('Linked favorite not found:', data);
                // In Report we adjust id to favId but if nothing was found with it in db, we want to delete it since if we resave this favorite which might actually have content we want to persist that content and not the id.
                delete data.id;
            } else {
                // We got a fav so set the data as the linked fav.
                data = linkedFav;
            }
        }

        // Set the title if it exists.
        if (data.title) {
            this.title = data.title;
        }

        // Sybase favorites contain favorite details within data object.
        // Try to initialize fields here, later they will be overwritten by ADL fields (if present)
        if (data.id) {
            this.id = data?.id;
            this.owner = data?.owner;
        }

        if (data.userPermGrps) {
            this.userPermGrps = data?.userPermGrps;
        }

        if (data.enterpriseDescription) {
            this.enterpriseDescription = data.enterpriseDescription;
        }

        if (data?.statusTag) {
            this.statusTag = data.statusTag;
        }

        if (data.lastUpdatedBy) {
            this.lastUpdatedBy = data?.lastUpdatedBy;
            this.dateLastUpdated = data?.dateLastUpdated;
            // we are doing this because for migrated favs the format is come as same as that we return for ADL favs
            if (this.dateLastUpdated && !AbstractFavoriteConfig.dateTimeRegex.test(this.dateLastUpdated)) {
                this.dateLastUpdated = momentTz.utc(this.dateLastUpdated).local().tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
            }
        }

        return this.doDeserialize(data);
    }

    /**
     * Deserializes the attributes in Favorite onto AbstractFavoriteConfig
     */
    public deserializeFavoriteAttributes(favorite: Favorite): void {
        this.id = favorite.id;
        if (favorite.aliasId) {
            this.aliasId = favorite.aliasId;
        }
        this.title = favorite.title;
        this.owner = favorite.owner;
        this.tool = favorite.tool;

        // ADL fields //
        // these fields exist in Sybase (within favorite data) and ADL (unique fields)
        // overwrite any fields that were present in Sybase favorite data, with those from ADL
        const isADLFavorite = isNaN(+favorite.id);
        if (isADLFavorite) {
            this.userPermGrps = favorite.permissionTags;
            // favorites returned from ADL have creationTime in UTC.  Convert from UTC to user's local time and time zone.
            this.dateLastUpdated = momentTz.utc(favorite.creationTime).local().tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
            this.lastUpdatedBy = favorite.creator;
            this.changeSummary = favorite.changeSummary;
            this.changeSummaryDetail = favorite.changeSummaryDetail;
            this.versionNumber = favorite.versionNumber;
            this.latestFavoriteVersion = favorite.latestFavoriteVersion;
            this.currentFavoriteVersion = favorite.currentFavoriteVersion;
            this.enterpriseDescription = favorite.enterpriseDescription;
            this.statusTag = favorite.statusTag;
        }
    }

    /**
     * Figures out if we should save the linked favorite content or allow the full favorite to be saved.
     * @param isNested an optional parameter to indicate that the favorite is a nested one.
     *        When boolean:
     *          true  = when the nested config is a favorite it will serialize a link to the favorite
     *          false = Save the full content of the favorite.
     *
     *        When number:
     *          0 = false handling above.
     *          1 = true handling above.
     *          2 = Always save the full favorite content without any links.  Will happen for anything other than 0 and 1.
     */
    private saveLinkedFavorite(isNested: boolean | number): boolean {
        // If there is no favorite id then always save full content.
        if (!this.id) {
            return false;
        }

        // Handle the number scenario.
        if (isNumber(isNested)) {
            return isNested === SerializeFavoriteType.SERIALIZE_LINKED_FAV || isNested === SerializeFavoriteType.FAVORITE_CHANGE_DETECTION_LINK;
        }

        // Must be a boolean so return based on that.
        return isNested === true;
    }

    /**
     * Function to copy the contents of another config object into this one.
     */
    copyFrom(sourceConfig: AbstractFavoriteConfig): void {
        if (sourceConfig == null) {
            return;
        }

        this.id = sourceConfig.id;
        if (sourceConfig.aliasId) {
            this.aliasId = sourceConfig.aliasId;
        }
        this.title = sourceConfig.title;
        this.owner = sourceConfig.owner;
        this.userPermGrps = sourceConfig.userPermGrps;
        this.lastUpdatedBy = sourceConfig.lastUpdatedBy;
        this.dateLastUpdated = sourceConfig.dateLastUpdated;
        this.changeSummary = sourceConfig.changeSummary;
        this.changeSummaryDetail = sourceConfig.changeSummaryDetail;
        this.versionNumber = sourceConfig.versionNumber;
        this.latestFavoriteVersion = sourceConfig.latestFavoriteVersion;
        this.currentFavoriteVersion = sourceConfig.currentFavoriteVersion;
        this.enterpriseDescription = sourceConfig.enterpriseDescription;
        this.statusTag = sourceConfig.statusTag;
        this.doCopyFrom(sourceConfig);
    }

    /**
     * Creates a favorite object for this favorite.
     * @returns favorite object
     */
    createFavorite(type: string, id?: number|string, title?: string, description?: string, changeSummaryDetails?: string, changeSummary?: string, userPermGrps?: string[], owner?: string, enterpriseDescription?: string, statusTag?: FavoriteStatus): Favorite {
        // If the id is null then we need to clear the change summary fields. SAVE AS Scenario
        if (id === null) {
            this.changeSummary = '';
            this.changeSummaryDetail = '';
        } else {
            this.changeSummary = isNil(changeSummary) ? this.changeSummary : changeSummary;
            this.changeSummaryDetail = isNil(changeSummaryDetails) ? this.changeSummaryDetail : changeSummaryDetails;
        }
        this.enterpriseDescription = enterpriseDescription || this.enterpriseDescription;
        this.statusTag = statusTag || this.statusTag;
        this.userPermGrps = userPermGrps || this.userPermGrps;
        this.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
        this.dateLastUpdated = momentTz.tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
        const fav: Favorite = new Favorite();
        fav.tool = this.tool;
        fav.owner = owner || this.owner;
        fav.type = type;
        fav.title = !isUndefined(title) ? title : this.title;
        fav.id = !isUndefined(id) ? id : this.id;
        const serializedData = this.serialize(SerializeFavoriteType.SERIALIZE_FAVORITE);

        // Enterprise favorite and favorite versioning enabled, favorite is saved to ADL so we add fields directly to favorite object
        if (CoreFavoriteUtils.isADLFavorite(type, fav.owner)) {
            fav.creator = this.lastUpdatedBy;
            fav.creationTime = this.dateLastUpdated;
            fav.permissionTags = this.userPermGrps;
            // only supported in ADL
            fav.changeSummary = this.changeSummary;
            fav.changeSummaryDetail = this.changeSummaryDetail;
            fav.enterpriseDescription = this.enterpriseDescription;
            fav.statusTag = this.statusTag;
        } else {
            // Favorite saved to Sybase, persist fields in data
            serializedData.lastUpdatedBy = this.lastUpdatedBy;
            serializedData.dateLastUpdated = this.dateLastUpdated;
            // only add user perms for enterprise favorites
            if (fav.owner === CoreFavoriteConstants.ADMIN && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS)) {
                serializedData.userPermGrps = this.userPermGrps;
            }
        }
        fav.data = JSON.stringify(serializedData);


        if (description) {
            fav.description = description;
        }
        return fav;
    }

    /**
     * Function to remove the favorite fields from this instance so it is no longer treated as a favorite.
     */
    public unlinkFavorite(): void {
        this.id = undefined;
        this.owner = undefined;
        this.title = undefined;
        this.userPermGrps = undefined;
        this.lastUpdatedBy = undefined;
        this.dateLastUpdated = undefined;
        this.changeSummary = undefined;
        this.changeSummaryDetail = undefined;
        this.versionNumber = undefined;
        this.latestFavoriteVersion = undefined;
        this.currentFavoriteVersion = undefined;
        this.enterpriseDescription = undefined;
        this.statusTag = undefined;
    }

     /**
     * Checks if the favorite is an ADL favorite.
     * @returns boolean - True if the favorite is an ADL favorite, false otherwise.
     */
     public isADLFavorite(): boolean {
        return isString(this.id);
     }

    /**
     * Serialize the full favorite content to JSON without any of the linked favorites.
     */
    serializeFullContent(): any {
        return this.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE);
    }

    /**
     * Function to copy the contents of another config object into this one.
     * @param source - to copy from
     */
    protected abstract doCopyFrom(source: AbstractFavoriteConfig): void;

    /**
     * This function is used to serialize the implementation favorite.
     * @param isNested an optional parameter to indicate that the favorite is a nested one.
     *        When boolean:
     *          true  = when the nested config is a favorite it will serialize a link to the favorite
     *          false = Save the full content of the favorite.
     *
     *        When number:
     *          0 = false handling above.
     *          1 = true handling above.
     *          2 = Always save the full favorite content without any links.  Will happen for anything other than 0 and 1.
     * @param shouldSaveLinkedFav - a function that will be called to determine if a linked favorite should be saved.
     */
    protected abstract doSerialize(isNested: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractFavoriteConfig) => boolean): any;

    /**
     * This function is used to deserialize the implementation favorite.
     */
    protected abstract doDeserialize(data: any): void;

    /**
     * Gets the favorite type for this config.
     */
    protected abstract getConfigType(): string;

    /**
     * Returns the display type of the favorite
     * @param parent?? The parent object that contains the favorite
     */
    abstract getDisplayType(parent?: any): FavoriteDisplayEnum;

    /**
     * Clear any flags that were set in order to detect changes to the favorite (ie column option)
     */
    resetChangeDetectionFlags(): void {
        // UNIMPLEMENTED
    }
}
