import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {isNil} from 'lodash';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * JITA Tier info model
 */
export class JITATierInfo extends AbstractLiquiditySettings {

    jitaTier: number;
    title: string;

    /**
     * Constructor
     */
    constructor(jitaTier?: number) {
        super();
        this.jitaTier = jitaTier;
        this.title = 'Tier-' + jitaTier;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            jitaTier: this.jitaTier,
            title: this.title
        };
    }

    /**
     * Deserialize the data into this object
     * @param data
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.jitaTier = data.jitaTier;
        this.title = data.title;
    }

    /**
     * Get params that are to be send as a part of the request param
     * @param requestParam
     */
    addRequestParams(requestParam: any): void {
        requestParam.jitaTier = this.jitaTier;
        requestParam.title = this.title;
    }
}
