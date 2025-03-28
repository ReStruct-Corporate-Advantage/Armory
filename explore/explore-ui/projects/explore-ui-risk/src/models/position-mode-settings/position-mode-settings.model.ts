import {AbstractConfig, RequestParamsCreator} from '@blk/explore-ui-core';
import {isNil} from 'lodash';
import {PositionModeType, PositionModeUtil} from '../../enums/position-mode.enum';

export class PositionModeSettings extends AbstractConfig implements RequestParamsCreator {

    private _positionModeSelection: PositionModeType = PositionModeType.AS_OF_W;

    get positionModeSelection(): PositionModeType {
        return this._positionModeSelection;
    }

    set positionModeSelection(value: PositionModeType) {
        this._positionModeSelection = value;
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
        this.positionModeSelection = PositionModeUtil.valueOf(data.positionMode);
    }


    serialize(): any {
        const dataToSave: any = {};
        if (!isNil(this._positionModeSelection)) {
            dataToSave.positionMode= PositionModeUtil.typeName(this.positionModeSelection);
        }
        return dataToSave;
    }

    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams.positionMode = PositionModeUtil.typeName(this.positionModeSelection);
    }
}
