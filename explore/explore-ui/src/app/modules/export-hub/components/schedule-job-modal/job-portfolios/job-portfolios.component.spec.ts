import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {JobPortfoliosComponent} from './job-portfolios.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {JobPortfolioConfig} from '../../../models/job-portfolio-config.model';
import {of} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {
    ExportHubJobPortfolio
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {AuxIconCellRendererClickParams} from '@blk/aladdin-angular-components';
import {DefinitionsStore} from '@stores/definitions.store';
import {CoreDefinitionStore} from '../../../../../../../projects/explore-ui-core/src/definition/core-definition.store';
import {CalendarTestUtils} from '../../../../../shared/components/date-picker-with-calendar/calendar-test.utils';
import {ConfigTypeFactory} from '../../../../../../../projects/explore-ui-core/src/favorite/factories';
import dummyScheduledJobs from '@assets/data/dummy-scheduled-jobs.json';
import {PortfolioService} from '@services/portfolio';
import {NotificationService} from '@services/notification';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {DateValue} from '@blk/explore-ui-core';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {GridApi} from 'ag-grid-community';
import {
    DatePickerWithCalendarComponent
} from "../../../../../shared/components/date-picker-with-calendar/date-picker-with-calendar.component";

describe('JobPortfoliosComponent', () => {
    let component: JobPortfoliosComponent;
    let fixture: ComponentFixture<JobPortfoliosComponent>;
    let portfolioServiceStub: any;
    let portfolioSearchServiceStub: any;
    let notificationServiceStub: any;
    let gridApiStub: any;

    beforeAll(() => {
        DefinitionsStore.currency = ['USD', 'CAD', 'AUD', 'COP', 'YEN'];
        CoreDefinitionStore.calendars = CalendarTestUtils.getMockCalendars();
        ConfigTypeFactory.registerConfigType('portfolio', Portfolio);
    });

    beforeEach(async () => {
        portfolioServiceStub = {
            fetchPortfolioInformation$: jest.fn()
        };
        portfolioSearchServiceStub = {
            searchPortfolio$: jest.fn()
        };
        notificationServiceStub = {
            error: jest.fn()
        };
        gridApiStub = {
            updateGridOptions: jest.fn(),
            getCellEditorInstances: jest.fn()
        };

        await TestBed.configureTestingModule({
            declarations: [JobPortfoliosComponent],
            providers: [
                { provide: PortfolioService, useValue: portfolioServiceStub },
                { provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub },
                { provide: NotificationService, useValue: notificationServiceStub },
                { provide: GridApi, useValue: gridApiStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JobPortfoliosComponent);
        component = fixture.componentInstance;
        const jobPortfolio = new ExportHubJobPortfolio();
        jobPortfolio.setPortfolioSetting(PortfolioUtils.encodePortfolio(new Portfolio()))
        component.portfolioConfigs = [jobPortfolio];
        component.gridApi = gridApiStub;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize gridOptions and rowData on ngOnInit', () => {
        component.ngOnInit();
        expect(component.gridOptions).toBeDefined();
        expect(component.gridOptions.rowData.length).toBe(component.portfolioConfigs.length);
    });

    it('should add all valid portfolio items to grid and show error for invalid items', fakeAsync(() => {
        const searchItems = new Set([new PortfolioSearchItem('validPort'), new PortfolioSearchItem('invalidPort')]);
        jest.spyOn(portfolioSearchServiceStub, 'searchPortfolio$').mockReturnValueOnce(of({ searchResults: [{ ticker: 'validPort' }] }));
        jest.spyOn(portfolioServiceStub, 'fetchPortfolioInformation$').mockReturnValueOnce(of(new Portfolio('validPort')));
        component.portfolioConfigs = [];
        component.addAllPortItemsToGrid(searchItems);

        expect(component['localPortfolioConfigs'].length).toBe(1);
        expect(component['localPortfolioConfigs'][0].portfolio.portName).toBe('validPort');
    }));

    it('should update portfolio config on cell value change', fakeAsync(() => {
        const fetchPortInfoSpy = jest.spyOn(portfolioServiceStub, 'fetchPortfolioInformation$');

        // Test runAs change
        component.gridOptions.columnDefs[1]['onCellValueChanged']({ newValue: 'PortGroup', oldValue: 'Portfolios', node: { rowIndex: 0 } });
        expect(component['localPortfolioConfigs'][0].runAs).toBe(BatchExportRunAs.PORTGROUP);
        expect(fetchPortInfoSpy).toHaveBeenCalledTimes(1);

        // Test date change
        const oldValue = new DateValue({ date: '2023-01-01' });
        const newValue = new DateValue({ date: '2023-01-02' });
        component.gridOptions.columnDefs[2]['onCellValueChanged']({ newValue, oldValue, node: { rowIndex: 0 } });
        expect(component['localPortfolioConfigs'][0].portfolio.datePicker).toEqual(newValue);
        expect(fetchPortInfoSpy).toHaveBeenCalledTimes(2);

        // Test benchmark change
        const oldBench = new Benchmark({ name: 'OldBench' });
        const newBench = new Benchmark({ name: 'NewBench' });
        component.gridOptions.columnDefs[4]['onCellValueChanged']({ newValue: newBench, oldValue: oldBench, node: { rowIndex: 0 } });
        expect(component['localPortfolioConfigs'][0].portfolio.benchmark).toEqual(newBench);
    }));

    it('should remove portfolio from grid', () => {
        component['localPortfolioConfigs'] = [new JobPortfolioConfig(dummyScheduledJobs.portfolioTableData[0])];
        jest.spyOn(gridApiStub, 'updateGridOptions');
        component['deleteJobPortfolio']({ node: { rowIndex: 0 } } as any);
        expect(component['localPortfolioConfigs'].length).toBe(0);
    });

    it('should open and close portfolio settings modal', () => {
        component.selectedJobPortConfig = null;
        component.isPortfolioSettingsModalOpen = false;
        component['localPortfolioConfigs'] = [new JobPortfolioConfig(dummyScheduledJobs.portfolioTableData[0])];

        component['openPortSettingsModal']({ node: { rowIndex: 0 } } as AuxIconCellRendererClickParams);
        expect(component.selectedJobPortConfig).toEqual(component['localPortfolioConfigs'][0]);
        expect(component.isPortfolioSettingsModalOpen).toBeTruthy();

        component.closePortSettingsModal();
        expect(component.selectedJobPortConfig).toBeNull();
        expect(component.isPortfolioSettingsModalOpen).toBeFalsy();
    });

    it('should return null if there are no active cell editors', () => {
        jest.spyOn(gridApiStub, 'getCellEditorInstances').mockReturnValueOnce([]);
        let result = component.validatePortRecordAttributes();
        expect(result).toBeNull();

        jest.spyOn(gridApiStub, 'getCellEditorInstances').mockReturnValueOnce(null);
        result = component.validatePortRecordAttributes();
        expect(result).toBeNull();
    });

    it('should return null if all active cell editors are valid', () => {
        const mockDatePicker: DatePickerWithCalendarComponent = new DatePickerWithCalendarComponent(null, null);
        mockDatePicker.isValid = true;
        jest.spyOn(gridApiStub, 'getCellEditorInstances').mockReturnValue([mockDatePicker]);

        const result = component.validatePortRecordAttributes();
        expect(result).toBeNull();
    });

    it('should return an error message if any active cell editor is invalid', () => {
        const mockDatePicker: DatePickerWithCalendarComponent = new DatePickerWithCalendarComponent(null, null);
        mockDatePicker.isValid = false;
        jest.spyOn(gridApiStub, 'getCellEditorInstances').mockReturnValue([mockDatePicker]);

        const result = component.validatePortRecordAttributes();
        expect(result).toBe('Please complete the editing before proceeding to the next step.');
    });
});
