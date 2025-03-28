import {TestBed} from '@angular/core/testing';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {ScreeningFilterTransformerService} from './screening-filter-transformer.service';
import {ColumnSectorRule, CustomFilter, CustomSector} from '@blk/explore-ui-breakdown';
import {TAB_NAME_SCREENING} from '@optimization-settings/constants/settings-tab-metadata.constants';

describe('ScreeningTransformerService', () => {
    let service: ScreeningFilterTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(ScreeningFilterTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(TAB_NAME_SCREENING.toLowerCase());
    });

    describe('should transform', () => {
        it('should return empty object if no objectives', () => {
            expect(service.transform(new PortfolioWithPositions())).toEqual({});
        });

        it('should return valid object when data', () => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions();
            portfolio.riskParitySettings.filter = new CustomFilter();
            portfolio.riskParitySettings.filter.customSector = new CustomSector();
            portfolio.riskParitySettings.filter = new CustomFilter();
            portfolio.riskParitySettings.filter.customSector = new CustomSector();

            const columnSectorRule = new ColumnSectorRule();
            columnSectorRule.columnName = 'CUSIP';
            columnSectorRule.columnTag = 'cusip';
            columnSectorRule.comparisonType = 'Equals';
            portfolio.riskParitySettings.filter.customSector.rule = columnSectorRule;
            portfolio.riskParitySettings.filter.title = 'abc';
            expect(service.transform(portfolio)).toEqual({
                'data': [
                    {
                        'screening': 'abc'
                    }
                ]
            });

            portfolio.riskParitySettings.filter = new CustomFilter();
            expect(service.transform(portfolio)).toEqual({
            });
        });
    });
});
