import {Serializable} from '../../core/interfaces';
import {CoreFavoriteUtils} from '../utils';
import {FavoriteCacheKey} from './favorite-cache-key.model';
import {CommonUtils} from '../../core/utils';
import {FavoriteStatus} from '../constants';

/**
 * Class used for saving and loading favorite information.
 */
export class Favorite implements Serializable {

    // Sybase favorites have number ID, ADL favorites have UUID (string)
    id: number|string;
    // An Alias ID refers to another ID that this favorite can refer to (Migrated favorites will have a UUID)
    aliasId: string;
    tool: string;
    title: string;
    type: string;
    listOrder: number;
    owner: string;
    description: string;
    data: string;
    flagid: FavoriteCacheKey; // Stores the favorite's id and global flag as a pair

    // ADL specific fields //
    creator: string;  // userId of the user that created the version of the favorite
    changeSummary: string; // high-level summary of favorite change
    changeSummaryDetail: string; // detailed explanation of favorite change
    versionNumber: number;
    creationTime: string;  // time that the favorite version was saved
    permissionTags: string[];
    latestFavoriteVersion: string;
    currentFavoriteVersion: string;
    enterpriseDescription: string;
    statusTag: FavoriteStatus;

    /**
     * Constructor for the favorite.
     */
    constructor(data?: any) {
        if (data) {
            this.deserialize(data);
        }
    }

    /**
     * Checks if this favorite is a Prism one or from Explore.
     */
    isPrismFavorite(): boolean {
        // If the tool contains the name Prism then it has been saved in Prism.
        return this.tool ? this.tool.indexOf('Prism') >= 0 : false;
    }

    /**
     * Serialize the config to json.
     */
    serialize(): any {
        return {
            tool: this.tool,
            title: this.title,
            type: this.type,
            id: this.id,
            listOrder: this.listOrder,
            owner: this.owner,
            description: this.description,
            data: this.data,
            creator: this.creator,
            changeSummary: this.changeSummary,
            changeSummaryDetail: this.changeSummaryDetail,
            versionNumber: this.versionNumber,
            creationTime: this.creationTime,
            permissionTags: this.permissionTags,
            latestFavoriteVersion: this.latestFavoriteVersion,
            currentFavoriteVersion: this.currentFavoriteVersion,
            enterpriseDescription: this.enterpriseDescription,
            statusTag: this.statusTag
        };
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.tool = data.tool;
        this.title = data.title;
        this.type = data.type;
        this.id = data.id;
        if (data.aliasId) {
            this.aliasId = data.aliasId;
        }
        this.listOrder = data.listOrder;
        this.owner = data.owner;
        this.description = data.description;
        this.data = data.data?.endsWith?.('::compressed')
            ? CommonUtils.decompressResponse(data.data.slice(0, -'::compressed'.length), false)
            : data.data;
        this.flagid = CoreFavoriteUtils.getFavoriteKey(CoreFavoriteUtils.isGlobalFavorite(this.owner), this.id);

        // ADL fields
        this.creator = data.creator;
        this.changeSummary = data.changeSummary;
        this.changeSummaryDetail = data.changeSummaryDetail;
        this.versionNumber = data.versionNumber;
        this.creationTime = data.creationTime;
        this.permissionTags = data.permissionTags;
        this.latestFavoriteVersion = data.latestFavoriteVersion;
        this.currentFavoriteVersion = data.currentFavoriteVersion;
        this.enterpriseDescription = data.enterpriseDescription;
        this.statusTag = data.statusTag;
    }
}
