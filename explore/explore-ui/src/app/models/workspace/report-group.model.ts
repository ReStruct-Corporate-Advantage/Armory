import {isObject, isUndefined, isNil} from 'lodash';
import {BaseWorkpad} from './base-workpad.model';
import {Portfolio} from '../portfolio/portfolio.model';
import {ExploreConstants} from '../../constants/explore.constants';
import {PortfolioUtils} from '../../utils/portfolio.utils';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {CommonUtils, ConfigTypeFactory, DateValue, SerializeFavoriteType} from '@blk/explore-ui-core';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';

/**
 * Report Group model that can hold multiple portfolios
 */
export class ReportGroup extends BaseWorkpad {
    portfolios: Portfolio[] = [];
    title = ExploreConstants.NEW_REPORT_GROUP_TITLE;
    id = CommonUtils.generateUniqueIdAsString();
    isOpen = false;
    isUserCreated = false;
    editMode = false;

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
        return BaseWorkpad.supportsObject(object) && object.isReportGroup;
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'report-group';
    }

    /**
     * getConfigType
     */
    getConfigType(): string {
        return ReportGroup.configType;
    }

    /**
     * serialize
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data = super.serialize(isNested);
        data.portfolios = [];

        for (const portfolio of this.portfolios) {
            const port = portfolio.serialize(true);
            if (portfolio instanceof WhatIfPortfolio) {
                port.parentPortfolioIdx = this.portfolios.indexOf(portfolio.parentPortfolio);
                if (portfolio instanceof RulesBasedPortfolio && !isNil(portfolio.datePicker)) {
                    port.workspaceDate = portfolio.datePicker.serialize();
                }
            }
            data.portfolios.push(port);
        }

        // saving the expand/collapse state for report group
        data.isOpen = this.isOpen;
        data.name = this.title;
        return data;
    }

    /**
     * deserialize
     */
    deserialize(data: any): void {
        super.deserialize(data);
        if (data.name) {
            this.title = data.name;
        }
        // expand/collapse state for report group
        this.isOpen = data.isOpen;

        // old favorites have isReportGroup for ReportGroup, and new favorites have isOpen
        if (data.portfolios) {
            for (const portfolioData of data.portfolios) {
                PortfolioUtils.updateConfigType(portfolioData);
                const portfolio = ConfigTypeFactory.createConfig(portfolioData, portfolioData.configType, false);
                if (portfolio instanceof WhatIfPortfolio) {
                    portfolio.parentPortfolio = this.portfolios[portfolioData.parentPortfolioIdx];
                    if (portfolio instanceof RulesBasedPortfolio && portfolioData.workspaceDate) {
                            portfolio.datePicker = new DateValue(portfolioData.workspaceDate);
                    }
                }
                this.portfolios.push(portfolio);
            }
        }
    }

    /**
     * get all portfolios
     */
    getAllPortfolios(): Portfolio[] {
        return this.portfolios;
    }

    /**
     * Add one or many portfolios
     * if portfoliosToAdd is Portfolio and index is given, then we insert the portfolio
     * if portfoliosToAdd is Portfolio[], then we append the portfolios
     */
    addPortfolios(portfoliosToAdd: Portfolio | Portfolio[], index?: number): void {
        if (portfoliosToAdd instanceof Portfolio) {
            if (!isUndefined(index)) {
                this.portfolios.splice(index, 0, portfoliosToAdd);
            } else {
                this.portfolios.push(portfoliosToAdd);
            }
        } else {
            for (const portfolio of portfoliosToAdd) {
                this.portfolios.push(portfolio);
            }
        }
    }

    /**
     * replace oldPortfolio with the new portfolio
     * if oldPortfolio is NOT given, override the portfolio(s) of the workpad
     */
    replacePortfolios(newPortfolios: Portfolio | Portfolio[], oldPortfolio?: Portfolio): void {
        if (newPortfolios instanceof Portfolio && oldPortfolio instanceof Portfolio) {
            // get the index of oldPortfolio
            const index = this.portfolios.indexOf(oldPortfolio);
            // now delete the old entry and swap with the new one
            this.portfolios.splice(index, 1, newPortfolios);
        } else {
            // This replaces all portfolios inside the report group
            this.portfolios = (Array.isArray(newPortfolios)) ? [...newPortfolios] : [newPortfolios];
        }
    }

    /**
     * remove a portfolio
     */
    removePortfolio(portfolioToRemove: Portfolio): void {
        const index = this.portfolios.indexOf(portfolioToRemove);
        if (index !== -1) {
            this.portfolios.splice(index, 1);
        }
    }

    /**
     * check if report group has portfolios in it
     */
    hasPortfolios(): boolean {
        return this.portfolios && this.portfolios.length > 0;
    }

    /**
     * Initializes flat workpad for report group with single portfolio and return it
     */
    initializeFlatWorkpadFromReportGroup(): FlatWorkpad {
        const flatWorkpad = new FlatWorkpad();

        // Initialize portfolio and other properties of flat workpad
        flatWorkpad.addPortfolios(this.portfolios[0]);
        flatWorkpad.addReports(this.reports);
        flatWorkpad.activeReport = this.activeReport;

        return flatWorkpad;
    }
}
