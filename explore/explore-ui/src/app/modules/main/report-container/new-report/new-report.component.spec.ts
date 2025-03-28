import {ComponentFixture, TestBed} from '@angular/core/testing';
import {spyOn} from 'jest-mock';
import {NewReportComponent} from './new-report.component';
import {ReportService} from '@services/workspace';
import {WorkspaceStore} from '../../../../stores';
import {
    AuxSegmentedControlSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WorkspaceUtils} from '../../../../utils';


describe('NewReportComponent', () => {
    let component: NewReportComponent;
    let fixture: ComponentFixture<NewReportComponent>;
    const reportServiceStub = {
        loadFavoriteReport: jest.fn()
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [NewReportComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ReportService, useValue: reportServiceStub}
            ]
        });

        fixture = TestBed.createComponent(NewReportComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.favType).toBe('LAYOUT');
        expect(component.favTreeType).toBe('LAYOUT_FOLDER');
        expect(component.favDisplayName).toBe('Report');
        expect(component.activeTabUID).toBe('0');
        expect(component.reportName).toBe('');
        expect(component.tabsLabelData).toEqual(NewReportComponent.TABS_LABEL_DATA);
        expect(component.isWidgetGalleryModalOpen).toBe(false);
    });

    it('should update activeTabUID on onTabSelected', () => {
        const event = {detail: {data: {uid: '1'}}} as CustomEvent<AuxSegmentedControlSelectionChangedDetailInterface>;
        component.onTabSelected(event);
        expect(component.activeTabUID).toBe('1');
    });

    it('should update reportName on onReportNameChanged', () => {
        const event = {detail: {value: 'New Report Name'}} as CustomEvent<AuxTextInputValueChangedDetailInterface>;
        component.onReportNameChanged(event);
        expect(component.reportName).toBe('New Report Name');
    });

    it('should create a blank report on createReport', () => {
        WorkspaceStore.init();
        const currentReport = WorkspaceUtils.createNewReport();
        WorkspaceStore.updateCurrentReport(currentReport);
        component.reportName = 'New Report';
        component.createReport();

        expect(currentReport.widgets.length).toBe(0);

    });

    it('should open widget gallery modal on createReport', () => {
        WorkspaceStore.init();

        const currentReport = WorkspaceUtils.createNewReport();
        WorkspaceStore.updateCurrentReport(currentReport);

        component.createReport();
        expect(component.isWidgetGalleryModalOpen).toBe(true);
    });

    it('should close modal on handleFavoriteSelectedAction', () => {
        spyOn(component, 'closeModal');
        const event = {reason: ModalStateAction.FAVORITE_SELECTED};
        component.handleFavoriteSelectedAction(event);
        expect(component.closeModal).toHaveBeenCalled();
    });

    it('should close widget gallery modal on closeWidgetGalleryModal', () => {
        spyOn(component, 'closeModal');
        spyOn(WorkspaceStore, 'refreshCurrentWorkpad');
        component.closeWidgetGalleryModal();
        expect(component.isWidgetGalleryModalOpen).toBe(false);
        expect(WorkspaceStore.refreshCurrentWorkpad).toHaveBeenCalled();
        expect(component.closeModal).toHaveBeenCalled();
    });

    it('should create blank report and refresh workpad on onCancelButtonClicked', () => {
        spyOn(component, 'closeModal');
        spyOn(WorkspaceStore, 'refreshCurrentWorkpad');
        WorkspaceStore.init();

        const currentReport = WorkspaceUtils.createNewReport();
        WorkspaceStore.updateCurrentReport(currentReport);
        component.onCancelButtonClicked();


        expect(WorkspaceStore.refreshCurrentWorkpad).toHaveBeenCalled();
        expect(component.closeModal).toHaveBeenCalled();
    });
});
