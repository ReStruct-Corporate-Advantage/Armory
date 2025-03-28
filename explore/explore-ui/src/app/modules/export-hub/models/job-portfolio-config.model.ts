import {AbstractConfig, ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {isObject, isString} from 'lodash';

export class JobPortfolioConfig extends AbstractConfig {

    static get configType(): string {
        return 'JobPortfolioConfig';
    }

    portfolio: Portfolio;
    runAs: BatchExportRunAs = BatchExportRunAs.PORTFOLIOS;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            portfolio: this.portfolio.serialize(),
            runAs: this.runAs,
        };
    }

    deserialize(data: any): void {
        this.portfolio = ConfigTypeFactory.createConfig(data.portfolio, data.portfolio.configType, false);
        if (isString(data.runAs)) {
            // Cater for Prism Favorites whose enums aren't associated with numbers
            this.runAs = BatchExportRunAs[data.runAs as string];
        } else {
            this.runAs = BatchExportRunAs[BatchExportRunAs[data.runAs]];
        }
    }
}
