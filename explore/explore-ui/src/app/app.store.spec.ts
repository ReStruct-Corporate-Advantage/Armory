import {WorkspaceStore} from './stores';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BehaviorSubject} from 'rxjs';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {TestBed} from '@angular/core/testing';
import {AppStore} from './app.store';
import {ReportGroup} from '@models/workspace/report-group.model';

describe('AppStore', () => {
    let store: AppStore;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        store = TestBed.inject(AppStore);
    });

    let workpad1: ReportGroup;
    let portfolio1: Portfolio;
    let portfolio2: Portfolio;

    beforeAll(() => {
        workpad1 = new ReportGroup();
        portfolio1 = new Portfolio('PEP');
        portfolio2 = new Portfolio('CORE-HQ');
        workpad1.portfolios = [portfolio1, portfolio2];

        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(workpad1);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(portfolio1);
    });

    it('should be created', () => {
        expect(store).toBeTruthy();
    });

});
