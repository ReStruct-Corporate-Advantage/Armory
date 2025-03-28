import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ExploreOptimizationService} from './explore-optimization.service';
import {OptimizationDataService} from './optimization-data.service';
import {OptimizationSummaryDataTransformer} from './optimization-summary-data-transformer.interface';
import {InvestmentUniverseTransformerService} from './transformers/investment-universe-transformer.service';
import {SectorConstraintsTransformerService} from './transformers/sector-constraints-transformer.service';
import {SecurityConstraintsTransformerService} from './transformers/security-constraints-transformer.service';
import {PortfolioConstraintsTransformerService} from './transformers/portfolio-constraints-transformer.service';
import {ObjectivesTransformerService} from './transformers/objectives-transformer.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {of} from 'rxjs';
import {SUB_TYPE_PORTFOLIO_CONSTRAINTS, SUB_TYPE_SECTOR_CONSTRAINTS, SUB_TYPE_SECURITY_CONSTRAINTS, TYPE_CONSTRAINTS, TYPE_INVESTMENT_UNIVERSE, TYPE_OBJECTIVES} from '@optimization-settings/constants/optimization-types.constants';
import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {OPTIMIZATION_SUMMARIES} from '@optimization-settings/constants/optimization-summaries.constants';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {AuxNotificationStyleEnum} from '@blk/aladdin-angular-components';
import {OPTIMIZATION_UPDATE_RUN_MESSAGE} from '@optimization-settings/constants/optimization-notification-messages.constants';

class MockTransformerService implements OptimizationSummaryDataTransformer {
    transform = jest.fn();

    constructor(private _type: string, private _subType?: string) {}

    type() {
        return this._type;
    }
    subType() {
        return this._subType;
    }
}

describe('ExploreOptimizationService', () => {
    let service: ExploreOptimizationService;
    let optimizationDataService: OptimizationDataService;
    let transformerService: PortfolioConstraintsTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExploreOptimizationService,
                {
                    provide: OptimizationDataService,
                    useValue: {
                        getPortfolioWithPositions$: jest.fn()
                    }
                },
                {
                    provide: InvestmentUniverseTransformerService,
                    useValue: new MockTransformerService(TYPE_INVESTMENT_UNIVERSE)
                },
                {
                    provide: ObjectivesTransformerService,
                    useValue: new MockTransformerService(TYPE_OBJECTIVES)
                },
                {
                    provide: PortfolioConstraintsTransformerService,
                    useValue: new MockTransformerService(TYPE_CONSTRAINTS, SUB_TYPE_PORTFOLIO_CONSTRAINTS)
                },
                {
                    provide: SecurityConstraintsTransformerService,
                    useValue: new MockTransformerService(TYPE_CONSTRAINTS, SUB_TYPE_SECURITY_CONSTRAINTS)
                },
                {
                    provide: SectorConstraintsTransformerService,
                    useValue: new MockTransformerService(TYPE_CONSTRAINTS, SUB_TYPE_SECTOR_CONSTRAINTS)
                }
            ]
        });

        service = TestBed.inject(ExploreOptimizationService);
        optimizationDataService = TestBed.inject(OptimizationDataService);
        transformerService = TestBed.inject(PortfolioConstraintsTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get optimization summaries', (done: any) => {
        service.getOptimizationSummaries$().subscribe((summaries: OptimizationSummary[]) => {
            expect(summaries).toEqual(OPTIMIZATION_SUMMARIES);
            done();
        });
    });

    describe('should get optimization summary data', () => {
        it('should return empty object when no portfolio', (done: any) => {
            optimizationDataService.getPortfolioWithPositions$ = jest.fn(() => of(undefined));

            service
                .getOptimizationSummaryData$('', TYPE_CONSTRAINTS, SUB_TYPE_PORTFOLIO_CONSTRAINTS)
                .subscribe((summaryData: OptimizationSummaryData) => {
                    expect(summaryData).toEqual({});
                    done();
                });
        });
        it('should return empty object when no optimization settings', (done: any) => {
            optimizationDataService.getPortfolioWithPositions$ = jest.fn(() => of({} as any));

            service
                .getOptimizationSummaryData$('', TYPE_CONSTRAINTS, SUB_TYPE_PORTFOLIO_CONSTRAINTS)
                .subscribe((summaryData: OptimizationSummaryData) => {
                    expect(summaryData).toEqual(undefined);
                    done();
                });
        });

        it('should return empty object when no transformer', (done: any) => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions('test');
            optimizationDataService.getPortfolioWithPositions$ = jest.fn(() => of(portfolio));

            service.getOptimizationSummaryData$('', '', '').subscribe((summaryData: OptimizationSummaryData) => {
                expect(summaryData).toEqual({});
                done();
            });
        });

        it('should return transformed object', fakeAsync(() => {
            const portfolio: PortfolioWithPositions = new PortfolioWithPositions('test');
            optimizationDataService.getPortfolioWithPositions$ = jest.fn(() => of(portfolio));
            const transformSpy = jest.spyOn(transformerService, 'transform');
            const summaryData: OptimizationSummaryData = {
                data: [
                    {
                        key: 'value'
                    }
                ]
            };
            transformSpy.mockReturnValue(summaryData);

            service
                .getOptimizationSummaryData$('', TYPE_CONSTRAINTS, SUB_TYPE_PORTFOLIO_CONSTRAINTS)
                .subscribe((returnedSummaryData: OptimizationSummaryData) => {
                    expect(returnedSummaryData).toEqual(summaryData);
                });
            tick();
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(portfolio, false);
        }));
    });

    it('should get run update notification', () => {
        expect(service.getRunUpdateNotification()).toEqual({
            message: OPTIMIZATION_UPDATE_RUN_MESSAGE,
            notificationStyle: AuxNotificationStyleEnum.MESSAGE,
            id: expect.anything()
        });
    })
});
