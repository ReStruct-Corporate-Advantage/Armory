import {SectorRule} from '../../portfolio/tradeRules/sector-rule.model';
import {AppUtils} from '@utils/app.utils';
import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

/**
 * Model class for the Return Spritelet widget input
 */
export class ReturnSpriteletInput extends AbstractConfig implements WidgetInput {
    pnlID: string;
    nodeDesc: string;
    sectorPathRules: Array<SectorRule> = [];

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'returnSpriteletInput';
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
   }

    /**
     * WidgetInput.isDataStoreInput()
     */
    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * WidgetInput.serialize(boolean)
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data = {
            pnlID: this.pnlID,
            nodeDesc: this.nodeDesc,
            sectorPathRules: []
        };
        this.sectorPathRules.forEach((rule: SectorRule) => data.sectorPathRules.push(rule.serialize()));
        return data;
    }

    /**
     * WidgetInput.deserialize(any)
     */
    deserialize(data: any): void {
        this.pnlID = data.pnlID;
        this.nodeDesc = data.nodeDesc;
        if (!data.sectorPathRules) {
            return;
        }
        data.sectorPathRules.forEach((rule: any) => {
            const sectorRule = new SectorRule(null, null, null);
            sectorRule.deserialize(rule);
            this.sectorPathRules.push(sectorRule);
        });
    }

    /**
     * WidgetInput.equals(WidgetInput)
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof ReturnSpriteletInput)) {
            return false;
        }
        if (this.sectorPathRules.length !== widgetInput.sectorPathRules.length) {
            return false;
        }
        let isAnySectorRuleUnequal = false;
        this.sectorPathRules.forEach((rule: SectorRule, index: number) => {
            if (!rule.equals(widgetInput.sectorPathRules[index])) {
                isAnySectorRuleUnequal = true;
                return;
            }
        });
        if (isAnySectorRuleUnequal) {
            return false;
        }
        return this.pnlID === widgetInput.pnlID && this.nodeDesc === widgetInput.nodeDesc;
    }

    /**
     * Add params to the passed in parameter that need to be passed to backend
     */
    addRequestParams(requestParams: any): void {
        requestParams.ledgerId = this.pnlID;
        requestParams.nodeDescription = this.nodeDesc;
        if (this.sectorPathRules.length > 0) {
            const sectorRules = [];
            this.sectorPathRules.forEach((rule: SectorRule) => sectorRules.push(rule.serialize()));
            requestParams.sectorPathRules = JSON.stringify(sectorRules);
        }
    }
}
