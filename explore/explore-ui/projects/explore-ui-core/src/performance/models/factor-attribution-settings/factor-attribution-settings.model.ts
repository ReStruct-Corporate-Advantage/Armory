import {isNil} from 'lodash';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {RequestParamsCreator} from '../../../core/interfaces';
import {CoreFavoriteUtils} from '../../../favorite/utils';
import {SerializeFavoriteType} from '../../../favorite/enums';
import {TokenUtils} from '../../../definition/token/token.utils';
import {TokenConstants} from '../../../definition/token/token.constants';

/**
 * Model class for Attribution Settings
 */
export class FactorAttributionSettings extends AbstractConfig implements RequestParamsCreator {

    private _factorAttributionType: string;
    // used for change detection in favorites that did not previously contain this field
    // must track the default/previous value of the field to determine if it is newly added and/or modified
    originalFactorAttributionType: string;

    get factorAttributionType(): string {
        return this._factorAttributionType;
    }

    set factorAttributionType(value: string) {
        this._factorAttributionType = value;
    }

    constructor(data?: any) {
        super();
        if (data) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.factorAttributionType = data.factorAttributionType;
        this.originalFactorAttributionType = data.factorAttributionType;
    }


    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const dataToSave: any = {};
        if (!isNil(this._factorAttributionType)) {
            dataToSave.factorAttributionType = this.factorAttributionType;
        }

        if (CoreFavoriteUtils.isFavoriteChangeDetection(_isNested)) {
            this.removeFieldsForFavoriteChangeDetection(dataToSave);
        }

        return dataToSave;
    }

    addRequestParams(requestParams: any): void {
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ADVANCED_ATTRIBUTION_SETTINGS)) {
            return;
        }
        requestParams.factorAttributionType = this.factorAttributionType;
    }

    removeFieldsForFavoriteChangeDetection(serializedObject: any): void {
        if (this.originalFactorAttributionType === this.factorAttributionType) {
            delete serializedObject.factorAttributionType;
        }
    }
}

