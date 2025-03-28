import {BaseWorkpad} from './base-workpad.model';
import {isNil, isObject} from 'lodash';
import {Portfolio} from '../portfolio/portfolio.model';
import {PortfolioUtils} from '../../utils/portfolio.utils';
import {ConfigTypeFactory, DateValue, SerializeFavoriteType} from '@blk/explore-ui-core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';

/**
 * Flat Workpad model that can hold only one portfolio
 */
export class FlatWorkpad extends BaseWorkpad {
    portfolio: Portfolio;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * When deserializing this function may be called to see if the object is supported by this type.
     */
    static supportsObject(object: any): boolean {
        return BaseWorkpad.supportsObject(object) && !object.isReportGroup;
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'flat-workpad';
    }

    /**
     * getConfigType
     */
    getConfigType(): string {
        return FlatWorkpad.configType;
    }

    /**
     * deserialize
     */
    deserialize(data: any): void {
        super.deserialize(data);
        // old workpad favorites have portfolios: Portfolio[] while flatWorkpad favorites have portfolio: Portfolio
        const portfolio = data.portfolios ? data.portfolios[0] : data.portfolio;

        PortfolioUtils.updateConfigType(portfolio);
        this.portfolio = ConfigTypeFactory.createConfig(portfolio, portfolio.configType, false);
        if (this.portfolio instanceof RulesBasedPortfolio && portfolio.workspaceDate) {
            this.portfolio.datePicker = new DateValue(portfolio.workspaceDate);
        }
    }

    /**
     * serialize
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data = super.serialize(isNested);
        data.portfolio = this.portfolio.serialize(isNested);
        if (this.portfolio instanceof WhatIfPortfolio) {
            if (this.portfolio instanceof RulesBasedPortfolio && !isNil(this.portfolio.datePicker)) {
                data.portfolio.workspaceDate = this.portfolio.datePicker.serialize();
            }
        }

        return data;
    }

    /**
     * get all portfolios
     */
    getAllPortfolios(): Portfolio[] {
        return this.portfolio ? [this.portfolio] : [];
    }

    /**
     * Add a portfolio
     * it sets passed in portfolio as it's portfolio
     */
    addPortfolios(portfolioToAdd: Portfolio): void {
        this.setPortfolio(portfolioToAdd);
    }

    /**
     * replace the portfolio
     */
    replacePortfolios(newPortfolio: Portfolio | Portfolio[]): void {
        newPortfolio = Array.isArray(newPortfolio) ? newPortfolio[0] : newPortfolio;
        this.setPortfolio(newPortfolio);
    }

    /**
     * set portfolio
     */
    private setPortfolio(portfolioToSet: Portfolio): void {
        this.portfolio = portfolioToSet;
    }

}

