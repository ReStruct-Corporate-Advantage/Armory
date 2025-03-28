import {PortfolioWithPositions} from './portfolio-with-positions.model';
import {AdhocPortParams} from './adhocModelling/adhoc-port-params.model';
import {
    adhocParamsEquals,
    BaseAdhocPortfolio,
    copyAdhocParams,
    deserializeAdhocParams,
    serializeAdhocParamsAndConfigType
} from '@interfaces/base-adhoc-portfolio.interface';
import {Portfolio} from './portfolio.model';
import {
    AbstractFavoriteConfig,
    ColumnConstants,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';

/**
 * Model for Adhoc Portfolio
 */
export class AdhocPortfolio extends PortfolioWithPositions implements BaseAdhocPortfolio {

    adhocParams: AdhocPortParams;

    /**
     * Constructor implementation
     */
    constructor(ticker?: string, datePicker?: any, adhocParams?: AdhocPortParams) {
        super(ticker, datePicker);
        if (adhocParams) {
            this.adhocParams = adhocParams;
        }
        this.compositionSetting.tradingColumn = ColumnConstants.PCT_NOTIONAL_MARKET_VAL;
    }

    /**
     * Adds request params
     */
    addRequestParams(requestParams: any): void {
        super.addRequestParams(requestParams);
        requestParams.adhocParams = this.adhocParams.serialize();
    }

    protected getDefaultTitle(title: string): string {
        return title;
    }

    /**
     * Matches the attributes with other AdhocPortfolio portfolio
     */
    equals(obj: PortfolioWithPositions): boolean {
        if (!(obj instanceof AdhocPortfolio)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        return adhocParamsEquals(obj, this.adhocParams);
    }

    /**
     * copyFrom implementation
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Portfolio)) {
            return;
        }

        super.doCopyFrom(source);

        if (!(source instanceof AdhocPortfolio)) {
            return;
        }

        this.adhocParams = copyAdhocParams(source);
    }

    /**
     * Serialization of the child classes
     */
    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        return {
            ...super.doSerialize(isNested),
            ...serializeAdhocParamsAndConfigType(this.getConfigType(), this.adhocParams)
        };
    }

    /**
     * Deserialize the content into adhoc portfolio object
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);

        // check whether adhocPortfolio is already having the adhocParams
        this.adhocParams = deserializeAdhocParams(data, this.adhocParams);
    }

    /**
     * Get the type of What if portfolio to be used for favorite type
     */
    getConfigType(): string {
        return AdhocPortfolio.configType;
    }

    get type(): string {
        return this.getConfigType();
    }

    static get configType(): string {
        return CompositionConstants.ADHOC_PORT_CONFIG_TYPE;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.ADHOC_PORT;
    }
}
