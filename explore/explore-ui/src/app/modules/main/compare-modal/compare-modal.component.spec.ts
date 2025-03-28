import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PortfolioService} from '@services/portfolio';
import {CompareModalComponent} from './compare-modal.component';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {BehaviorSubject, of} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreCheckbox, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {cloneDeep} from 'lodash';
import {ComparisonConfig} from '@models/config/comparison-config.model';

describe('CompareModalComponent', () => {
    let component: CompareModalComponent;
    let fixture: ComponentFixture<CompareModalComponent>;
    let reportGroup: ReportGroup;
    let port1: Portfolio;
    let port2: Portfolio;

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn(() => of())
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
        reportGroup = new ReportGroup();
        port1 = new Portfolio('PEP');
        port2 = new Portfolio('CORE-HQ');
        reportGroup.portfolios = [port1, port2];
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CompareModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: PortfolioService, useValue: portfolioServiceStub}
            ]
        });

        fixture = TestBed.createComponent(CompareModalComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
        expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
    });

    describe('onInit Test', () => {
        it('should set currentReport and portfolios onInit', () => {
            expect(component.comparisonStackedData.length).toBe(2);
            expect(component.anchorOptions[0].values.length).toBe(3);
        });
        it('edit mode Test', () => {
            component.ngOnInit();
            expect(component.isEditMode).toBeFalsy();
            WorkspaceStore.getCurrentReport().comparisonConfigId = 123;
            WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(123, new ComparisonConfig());
            component.ngOnInit();
            expect(component.isEditMode).toBeTruthy();
        });
    });

    it('onCheckboxGroupChanged method test case', () => {
        expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
        // When select all is checked
        component.comparisonStackedData.forEach(item => item.checked = true);
        component.onCheckboxGroupChanged();
        expect(component.isComparisonListEmpty$.getValue()).toBeFalsy();
    });

    it('setSelectedAnchorValue method test case', () => {
        // Create event to select an item.
        const $event: any = new CustomEvent('');
        $event.initCustomEvent('', false, false, {
            value: {value: component.comparisonStackedData[1].uid}
        });

        // Trigger the event.
        component.setSelectedAnchorValue($event);

        // Validate.
        expect(component.anchorOptions[0].values[0].isSelected).toBeFalsy();
        expect(component.anchorOptions[0].values[1].isSelected).toBeFalsy();
        expect(component.anchorOptions[0].values[2].isSelected).toBeTruthy();
    });

    it('tests applyModal', () => {
        component.comparisonStackedData.forEach(item => item.checked = true);
        component.anchorOptions[0].values[0].isSelected = false;
        component.anchorOptions[0].values[1].isSelected = true;
        component.anchorOptions[0].values[2].isSelected = false;
        component.updateAnchorEnableState();

        const event = {};
        component.applyModal(event as CustomEvent);

        expect(component.comparisonConfig.portComparisonList.length).toBe(2);
        expect(component.comparisonConfig.portAnchorId).toEqual(component.comparisonStackedData[0].uid);

        expect(component['portfolioService'].fetchPortfolioInformation$).toHaveBeenCalledTimes(2);
    });

    it('tests cancelCompareChange', () => {
        component.isOpen = true;
        jest.spyOn(component.modalClosed, 'emit');
        component.cancelCompareChange();
        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('should test onComparisonToggleChanged', () => {
        const event: any = {detail: {value: {checked: false, disabled: false, label: 'Enable Multi-Portfolio Analysis'}}};

        // Base settings - both portfolios are enabled for comparison, and SNP500 is chosen for the anchor.
        const comparisonStackedData = [
            new ExploreCheckbox('SNP500', true, false),
            new ExploreCheckbox('SNP100', true, false),
        ];
        component.comparisonStackedData = cloneDeep(comparisonStackedData);

        const anchorOptions = [new ExploreSelectOptionGroup([
            new ExploreSelectOption('None', 'None', false),
            new ExploreSelectOption('SNP500', 'SNP500a88df6d8ef2d425', true),
            new ExploreSelectOption('SNP100', 'SNP100e0645adaa6c749b', false),
        ])];
        component.anchorOptions = cloneDeep(anchorOptions);

        expect(component.interimComparisonState).toBeUndefined();

        // Turn off the comparison toggle
        component.onComparisonToggleChanged(event);

        expect(component.interimComparisonState.comparisonStackedData).toEqual(comparisonStackedData);
        expect(component.interimComparisonState.anchorOptions).toEqual(anchorOptions);

        expect(component.comparisonStackedData[0].checked).toBeFalsy();
        expect(component.comparisonStackedData[1].checked).toBeFalsy();

        expect(component.anchorOptions[0].values[0].isSelected).toBeTruthy();
        expect(component.anchorOptions[0].values[1].isSelected).toBeFalsy();

        // Turn on the comparison toggle back.
        event.detail.value.checked = true;
        component.onComparisonToggleChanged(event);

        expect(component.interimComparisonState).toBeNull();

        expect(component.comparisonStackedData).toEqual(comparisonStackedData);
        expect(component.anchorOptions).toEqual(anchorOptions);
    });
});
