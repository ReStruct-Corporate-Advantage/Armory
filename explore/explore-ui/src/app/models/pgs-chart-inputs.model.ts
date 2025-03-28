import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model class for PgsChartInputs to track
 * parameters for launched PGS chart spritelet
 */
export class PgsChartInputs extends AbstractConfig {
    portHierarchy: string;
    actionKey: string;
    level: number;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * serialize
     * @param _isNested
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            actionKey: this.actionKey,
            level: this.level,
            portHierarchy: this.portHierarchy
        };
    }

    /**
     * deserialize
     * @param data
     */
    deserialize(data: any) {
        super.deserialize(data);
        this.actionKey = data.actionKey;
        this.level = data.level;
        this.portHierarchy = data.portHierarchy;
    }
}
