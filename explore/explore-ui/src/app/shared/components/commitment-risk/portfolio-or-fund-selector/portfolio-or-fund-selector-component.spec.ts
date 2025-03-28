import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PortfolioOrFundSelectorComponent} from './portfolio-or-fund-selector-component';
import {TestUtils} from '@utils/test.utils';
import {AgGridModule} from 'ag-grid-angular';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {CommitmentRiskFundInfoService} from '@services/commitment-risk/commitment-risk-fund-info.service';

describe('SecuritySelectorDropdown component test case', () => {
    let component: PortfolioOrFundSelectorComponent;
    let fixture: ComponentFixture<PortfolioOrFundSelectorComponent>;

    WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('PEP'));

    const commitmentRiskFundInfoServiceStub = {
        fetchPrivateFunds: jest.fn((): Observable<{secDesc: any; cusip: any, isDisabled?: boolean}[]> => {
            return of([
                {secDesc: 'Security Description 1', cusip: 'BRS123', isDisabled: true},
                {secDesc: 'Security Description 2', cusip: 'BRS234'},
                {secDesc: 'Security Description 3', cusip: 'BRS345'}]);
        })
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AgGridModule],
            declarations: [PortfolioOrFundSelectorComponent],
            providers: [
                {provide: CommitmentRiskFundInfoService, useValue: commitmentRiskFundInfoServiceStub}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PortfolioOrFundSelectorComponent);
        component = fixture.componentInstance;
        component.selectedSecurity = 'Cusip2';
        fixture.detectChanges();
    });

    it('should create security selector dropdown component', () => {
        expect(component).toBeTruthy();
    });


    it('Test ngOnInit when Portfolio selected', () => {
        component.selectedSecurity = undefined;
        component.fundTypeOptions = undefined;
        component.fundTypeOptions = [new ExploreSelectOptionGroup()];
        const options = [new ExploreSelectOptionGroup()];
        options[0].values.push(new ExploreSelectOption('Portfolio', 'PORTFOLIO', true));
        options[0].values.push(new ExploreSelectOption('Private Fund', 'PRIVATE', false));
        component.ngOnInit();
        expect(component.fundTypeOptions).toEqual(options);
        expect(component.fundTypeSelected).toEqual('Portfolio');
        expect(component.showPrivateFundSelection).toBeFalsy();
    });

    it('Test ngOnInit when Private Fund is selected', () => {
        component.fundTypeOptions = undefined;
        component.fundTypeOptions = [new ExploreSelectOptionGroup()];
        const options = [new ExploreSelectOptionGroup()];
        options[0].values.push(new ExploreSelectOption('Portfolio', 'PORTFOLIO', false));
        options[0].values.push(new ExploreSelectOption('Private Fund', 'PRIVATE', true));
        component.ngOnInit();
        expect(component.fundTypeOptions).toEqual(options);
        expect(component.fundTypeSelected).toEqual('Private Fund');
        expect(component.showPrivateFundSelection).toBeTruthy();
    });

    it('test fundtype selection dropdown', () => {
        jest.spyOn(component.securitySelected, 'emit');
        const event = {detail: {value: {displayValue: 'Portfolio'}}};
        component.onFundTypeSelection(event as any);
        expect(component.fundTypeSelected).toEqual('Portfolio');

        const event2 = {detail: {value: {displayValue: 'Private Fund'}}};
        component.onFundTypeSelection(event2 as any);
        expect(component.fundTypeSelected).toEqual('Private Fund');
        expect(component.showPrivateFundSelection).toBeTruthy();
    });

    it('test security selection dropdown', () => {
        jest.spyOn(component.securitySelected, 'emit');
        const event = {detail: {value: {value: 'BRS123'}}};
        component.onSecuritySelection(event as any);
        expect(component.fundCusip).toEqual('BRS123');
    });

    it('Test closeOptions Apply Clicked', () => {
        jest.spyOn(component.securitySelected, 'emit');
        component.closeOptions(true);
        expect(component.securitySelected.emit).toHaveBeenCalled();

    });

    it('Test closeOptions Cancel Clicked', () => {
        jest.spyOn(component.securitySelected, 'emit');
        component.selectedSecurity = 'BRS234';
        component.fundCusip = 'BRS123';
        component.openPortfolioAndFundSelection();
        component.closeOptions(false);
        expect(component.fundCusip).toEqual('BRS234');
        expect(component.securitySelected.emit).toHaveBeenCalled();
    });

    it('Test valueLabelFunction', () => {
        component.selectedSecurity = 'BRS123';
        component.fundCusip = 'BRS123';
        expect(component.getSelectedPortfolioOrFundDisplay()).toEqual('Security Description 1 | BRS123');
    });

    it('Test createSecuritySelections', (done) => {
        component.securityOptions = undefined;
        component.ngOnInit();
        component.selectedSecurity = 'BRS123';
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
        done();
        const options = [];
        options.push({values: [new ExploreSelectOption('Security Description 1' + ' | ' + 'BRS123', 'BRS123', true,  true)]});
        options.push({values: [new ExploreSelectOption('Security Description 2' + ' | ' + 'BRS234', 'BRS234', false)]});
        options.push({values: [new ExploreSelectOption('Security Description 3' + ' | ' + 'BRS345', 'BRS345', false)]});
        expect(component.securityOptions).toEqual(options);
    });

});
