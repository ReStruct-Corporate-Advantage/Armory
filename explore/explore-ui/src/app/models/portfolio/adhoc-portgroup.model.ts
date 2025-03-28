import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {
    adhocParamsEquals,
    BaseAdhocPortfolio,
    copyAdhocParams,
    deserializeAdhocParams,
    serializeAdhocParamsAndConfigType
} from '@interfaces/base-adhoc-portfolio.interface';
import {AdhocPortParams} from './adhocModelling/adhoc-port-params.model';
import {
    AbstractFavoriteConfig,
    ColumnConstants,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {RuleFactory} from '../../factories/rule.factory';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {CompositionConstants} from '@constants/composition.constants';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {Benchmark} from '@models/portfolio/benchmark.model';

/*
Model for AdhocPortGroup.
AdhocPortGroups require tradeRules which are date independent for
widgets that are only supported on RuleBasedPortfolios
 */
export class AdhocPortGroup extends RulesBasedPortfolio implements BaseAdhocPortfolio {
    adhocParams: AdhocPortParams;

    constructor(ticker?: string, datepicker?: any, adhocParams?: AdhocPortParams) {

        super(ticker, undefined, datepicker);
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
     * Matches the attributes with other AdhocPortGroup portfolio
     */
    equals(obj: RulesBasedPortfolio): boolean {
        if (!(obj instanceof AdhocPortGroup)) {
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

        if (!(source instanceof AdhocPortGroup)) {
            return;
        }

        this.adhocParams = copyAdhocParams(source);
    }

    /**
     * Creates rules from the holdingChanges for
     * old AdhocPortGroup favorites
     * @param holdingChanges
     */
    createRulesFromHoldingChanges(holdingChanges: HoldingChange[]): void {
        holdingChanges.filter(holdingChange => holdingChange instanceof NewPortfolioHoldingChange)
                        .forEach(holdingChange => this.compositionRules.tradeRules.push(RuleFactory.createRuleBasedOnType({
            'ruleType': CompositionConstants.RULE_TYPES.PORTFOLIO,
            'lineItem': holdingChange.lineItem,
            'newWeight': holdingChange.newWeight
        })));
    }


    /**
     * Serialization of the child classes
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        return {
            ...super.doSerialize(isNested),
            ...serializeAdhocParamsAndConfigType(this.getConfigType(), this.adhocParams)
        };
    }

    /**
     * Deserialize the content into adhoc portfolio object
     */
    doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (data.benchmark?.type === BenchmarkConstants.BENCH_AGGREGATE) {
            this.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
        }
        // check whether adhocPortfolio is already having the adhocParams
        this.adhocParams = deserializeAdhocParams(data, this.adhocParams);
    }

    /**
     * Get the type of What if portfolio to be used for favorite type
     */
    getConfigType(): string {
        return AdhocPortGroup.configType;
    }

    get type(): string {
        return this.getConfigType();
    }

    static get configType(): string {
        return 'adhocPortGroup';
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.ADHOC_PORT_GROUP;
    }
}
