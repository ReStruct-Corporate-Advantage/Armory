import {TestBed} from '@angular/core/testing';

import {LookthroughService} from './lookthrough.service';
import {of} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {DateValue} from '@blk/explore-ui-core';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import {Http2BmsService} from '@services/bms';

describe('LookthroughService', () => {

    let service: LookthroughService;
    const httpServiceStub = {
        post$: jest.fn()
    };

    function createPortfolioWithLTSettingsYN(flag: boolean): Portfolio {
        const portfolio = new Portfolio('PEP');
        portfolio.benchmark = new Benchmark();
        portfolio.benchmark.name = 'NO_BENCH';
        portfolio.datePicker = new DateValue('01/02/2020');
        if (flag) {
            portfolio.lookthroughSettings = {
                isBenchLookThroughEnabled: true,
                isLookThroughEnabled: true,
                ltFilterRulesFav: new LookthroughfilterRulesFav()
            } as LookThroughSettings;
        }
        return portfolio;
    }

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: Http2BmsService, useValue: httpServiceStub}]
        });
        service = TestBed.inject(LookthroughService);
    });

    it('tests getLookthroughInfo$', done => {
        const portfolio = createPortfolioWithLTSettingsYN(false);
        httpServiceStub.post$.mockReturnValue(of({
            data: [{}]
        }));

        service.getLookthroughInfo$(portfolio).subscribe(
            payload => {
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(1);
                expect(payload).toBeDefined();
                done();
            }
        );
    });

    it('tests getLookthroughInfo$ with LT Settings', done => {
        const portfolio = createPortfolioWithLTSettingsYN(true);
        httpServiceStub.post$.mockReset();
        httpServiceStub.post$.mockReturnValue(of({
            data: [{}]
        }));

        service.getLookthroughInfo$(portfolio).subscribe(
            payload => {
                expect(httpServiceStub.post$).toHaveBeenCalledTimes(1);
                expect(payload).toBeDefined();
                done();
            }
        );
    });

    it('tests Create Widget', () => {
        const portfolio = createPortfolioWithLTSettingsYN(true);
        const widget = service.createWidget(portfolio, null);
        expect(widget).toBeDefined();
        expect(widget.dataStore.data).toBeDefined();
    });

    it('tests getVisColsConfig()', () => {
        const cols = service.getVisColsConfig();
        cols.forEach(col => {
            col.formatter.format();
        });
        expect(cols.length).toBe(7);
    });
});
