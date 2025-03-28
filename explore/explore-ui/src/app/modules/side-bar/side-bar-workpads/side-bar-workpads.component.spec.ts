import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SideBarWorkpadsComponent} from './side-bar-workpads.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WorkspaceStore} from '../../../stores/workspace.store';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';

describe('WorkpadsComponent', () => {
    let component: SideBarWorkpadsComponent;
    let fixture: ComponentFixture<SideBarWorkpadsComponent>;

    const flatWorkpad1 = new FlatWorkpad();
    const flatWorkpad2 = new FlatWorkpad();
    const reportGroup1 = new ReportGroup();
    const reportGroup2 = new ReportGroup();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SideBarWorkpadsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SideBarWorkpadsComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    beforeAll(() => {
        WorkspaceStore.init();
        WorkspaceStore.getWorkspace().workpads = [flatWorkpad1, flatWorkpad2, reportGroup1, reportGroup2];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test isReportGroup', () => {
        expect(component.isReportGroup(new ReportGroup())).toBeTruthy();
        expect(component.isReportGroup(new FlatWorkpad())).toBeFalsy();
    });

    it('test isFlatWorkpad', () => {
        expect(component.isFlatWorkpad(new ReportGroup())).toBeFalsy();
        expect(component.isFlatWorkpad(new FlatWorkpad())).toBeTruthy();
    });

    it('test delete workpad', () => {
        flatWorkpad1.addPortfolios(new Portfolio('PEP'));
        jest.spyOn(WorkspaceStore, 'removeWorkpadAndUpdateCurrent');
        jest.spyOn(WorkspaceStore.portfolioLoadingStatusMap, 'delete');
        component.deleteWorkpad(flatWorkpad1);
        expect(WorkspaceStore.portfolioLoadingStatusMap.delete).toHaveBeenCalledWith(flatWorkpad1.portfolio.portId);
        expect(WorkspaceStore.removeWorkpadAndUpdateCurrent).toHaveBeenCalledWith(flatWorkpad1, true);
    });

    it('flat workpad test case', () => {
        const workpad = new FlatWorkpad();
        jest.spyOn(WorkspaceStore, 'getCurrentWorkpad').mockReturnValue(flatWorkpad1);
        jest.spyOn(WorkspaceStore, 'validateWorkpadAndUpdate');

        component.flatWorkpadSelected(workpad);

        expect(WorkspaceStore.validateWorkpadAndUpdate).toHaveBeenCalledWith(workpad);
    });
});
