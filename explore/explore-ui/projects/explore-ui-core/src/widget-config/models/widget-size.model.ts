import {isObject} from 'lodash';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {SerializeFavoriteType} from '../../favorite/enums';

/**
 * Model representing the widget size
 */
export class WidgetSize extends AbstractConfig {
    // width
    sizeX: number;
    // height
    sizeY; number;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        this.sizeX = data.sizeX || data.width;
        this.sizeY = data.sizeY || data.height;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            sizeX: this.sizeX,
            sizeY: this.sizeY
        };
    }
}
