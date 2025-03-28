import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SecuritySelectorDropdownLegacyComponent} from './security-selector-dropdown-legacy.component';
import {TestUtils} from '@utils/test.utils';
import {AgGridModule} from 'ag-grid-angular';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FetchSecuritiesDataService} from '@services/widget/fetch-securities-data-service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreSelectOption} from '@blk/explore-ui-core';

describe('SecuritySelectorDropdown component test case', () => {
    let component: SecuritySelectorDropdownLegacyComponent;
    let fixture: ComponentFixture<SecuritySelectorDropdownLegacyComponent>;

    WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('PEP'));

    const fetchSecuritiesDataServiceStub = {
        fetchPortfolioSecurities: jest.fn((): Observable<{secDesc: any; cusip: any}[]> => {
            return of([
                {secDesc: 'Security Description 1', cusip: 'Cusip1'},
                {secDesc: 'Security Description 2', cusip: 'Cusip2'},
                {secDesc: 'Security Description 3', cusip: 'Cusip3'}]);
        })
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AgGridModule],
            declarations: [SecuritySelectorDropdownLegacyComponent],
            providers: [
                {provide: FetchSecuritiesDataService, useValue: fetchSecuritiesDataServiceStub}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SecuritySelectorDropdownLegacyComponent);
        component = fixture.componentInstance;

        component.securityGroup = 'FUND';
        component.securityType = 'PRIVATE';
        component.selectedSecurity = 'Cusip2';
        fixture.detectChanges();
    });

    it('should create security selector dropdown component', () => {
        expect(component).toBeTruthy();
    });

    it('Test createSecuritySelections', (done) => {
        component.securityOptions = undefined;
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
        done();
        const options = [];
        options.push({values: [new ExploreSelectOption('Security Description 1' + ' | ' + 'Cusip1', 'Cusip1', false)]});
        options.push({values: [new ExploreSelectOption('Security Description 2' + ' | ' + 'Cusip2', 'Cusip2', true)]});
        options.push({values: [new ExploreSelectOption('Security Description 3' + ' | ' + 'Cusip3', 'Cusip3', false)]});
        expect(component.securityOptions).toEqual(options);
    });

});
