import {CompositionConstants} from '../../../constants';
import {HoldingChange} from './holding-change.model';
import {isNil, isObject} from 'lodash';

/**
 * Holding change object for portfolio securities
 */
export class PortfolioSecurityHoldingChange extends HoldingChange {

    newMarketValue: number;
    newNotionalMarketValue: number;
    newQuantity: number;
    newParValue: number;
    newCurrentFace: number;
    newDeltaAdjNotional: number;
    newAdjNMV: number;
    changeInMarketValue: number;
    changeInNotionalMarketValue: number;
    changeInQuantity: number;
    changeInParValue: number;
    changeInCurrentFace: number;
    changeInDeltaAdjNotional: number;
    portfolioName: string;
    secDesc: string;
    isNavNeutral: boolean;  // This flag indicates if this trade will should the nav of the portfolio or not
    isNotionalCash: boolean;  // This flag indicates if this trade is corresponding to notional offset adjustment
    convertFlag: string;
    requiresBenchData: boolean;
    tradeSize: number;
    tradeType: string;
    changeInWeightRelativeToMainPort: number;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @return true if it has a non-zero trade size, otherwise false.
     */
    public hasTradeSize(): boolean {
        return !isNil(this.tradeSize) && this.tradeSize !== 0;
    }

    /**
     * Serialize all the properties for PortfolioSecurityHoldingChange
     */
    protected doSerialize(data: any): any {
        return {
            ...data,
            newMV: this.newMarketValue,
            newNotional: this.newNotionalMarketValue,
            newQuantity: this.newQuantity,
            newParValue: this.newParValue,
            newCurrentFace: this.newCurrentFace,
            newDeltaAdjNMV: this.newDeltaAdjNotional,
            newAdjNMV: this.newAdjNMV,
            changeInMarketValue: this.changeInMarketValue,
            changeInNotional: this.changeInNotionalMarketValue,
            changeInQuantity: this.changeInQuantity,
            changeInParValue: this.changeInParValue,
            changeInCurrentFace: this.changeInCurrentFace,
            changeInDeltaAdjNMV: this.changeInDeltaAdjNotional,
            changeInWeightRelToMainPort: this.changeInWeightRelativeToMainPort,
            tradeSize: this.hasTradeSize() ? this.tradeSize : undefined,
            portfolioName: this.portfolioName,
            isNavNeutral: this.isNavNeutral,
            isNotionalCash: this.isNotionalCash,
            convertFlag: this.convertFlag,
            requiresBenchData: this.requiresBenchData,
            secDesc: this.secDesc
        };
    }

    /**
     * Deserialize the properties into PortfolioSecurityHoldingChange object
     */
    protected doDeserialize(data: any): void {
        if (data.portfolioName != null) {
            this.portfolioName = data.portfolioName;
        }

        if (data.isNavNeutral != null) {
            this.isNavNeutral = data.isNavNeutral;
        }

        this.setNewValues(data);

        // Set all the change values
        if (data.changeInMarketValue != null) {
            this.changeInMarketValue = data.changeInMarketValue;
        }

        if (data.changeInNotional != null) {
            this.changeInNotionalMarketValue = data.changeInNotional;
        }

        if (data.changeInQuantity != null) {
            this.changeInQuantity = data.changeInQuantity;
        }

        if (data.changeInParValue != null) {
            this.changeInParValue = data.changeInParValue;
        }

        if (data.changeInCurrentFace != null) {
            this.changeInCurrentFace = data.changeInCurrentFace;
        }

        if (data.changeInDeltaAdjNMV != null) {
            this.changeInDeltaAdjNotional = data.changeInDeltaAdjNMV;
        }

        if (data.requiresBenchData != null) {
            this.requiresBenchData = data.requiresBenchData;
        }

        if (data.secDesc != null) {
            this.secDesc = data.secDesc;
        }

        if (data.tradeSize != null) {
            this.tradeSize = data.tradeSize;
        }

        if (data.changeInWeightRelToMainPort != null) {
            this.changeInWeightRelativeToMainPort = data.changeInWeightRelToMainPort;
        }

        if (data.isNotionalCash != null) {
            this.isNotionalCash = data.isNotionalCash;
        }

        if (data.convertFlag != null) {
            this.convertFlag = data.convertFlag;
        }
    }

    private setNewValues(data: any) {
        // Set all the new values
        if (data.newMV != null) {
            this.newMarketValue = data.newMV;
        }

        if (data.newNotional != null) {
            this.newNotionalMarketValue = data.newNotional;
        }

        if (data.newQuantity != null) {
            this.newQuantity = data.newQuantity;
        }

        if (data.newParValue != null) {
            this.newParValue = data.newParValue;
        }

        if (data.newCurrentFace != null) {
            this.newCurrentFace = data.newCurrentFace;
        }

        if (data.newDeltaAdjNMV != null) {
            this.newDeltaAdjNotional = data.newDeltaAdjNMV;
        }

        if (data.newAdjNMV != null) {
            this.newAdjNMV = data.newAdjNMV;
        }

        // To support legacy fav.
        if (data.newDeltaAdjustedNMV != null) {
            this.newDeltaAdjNotional = data.newDeltaAdjustedNMV;
        }
    }

    /**
     * Check if the passed object for attributes same as this one
     */
    protected hasSameAttributes(obj: any): boolean {
        return (obj instanceof PortfolioSecurityHoldingChange);
    }

    getChangeType(): string {
        return CompositionConstants.HOLDING_CHANGE_TYPES.SECURITY;
    }
}
