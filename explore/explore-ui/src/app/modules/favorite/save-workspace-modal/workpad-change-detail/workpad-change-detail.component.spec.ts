import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WorkpadChangeDetailComponent} from './workpad-change-detail.component';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {Report} from '@models/workspace/report.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {CoreUserMetaDataStore, FavoriteDisplayEnum, UserMetaData} from '@blk/explore-ui-core';
import {AuxTabBarSelectedDetailInterface} from '@blk/aladdin-angular-components';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';

describe('WorkpadChangeDetailComponent', () => {
    let component: WorkpadChangeDetailComponent;
    let fixture: ComponentFixture<WorkpadChangeDetailComponent>;

    let reportChange1: FavoriteChange;
    let reportChange2: FavoriteChange;
    let reportChange3: FavoriteChange;

    let flatWorkpad: FlatWorkpad;
    let reportGroup: ReportGroup;

    beforeEach(async () => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'user01';

        reportChange1 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT);
        reportChange1.value.id = 1234;
        reportChange2 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT);
        reportChange2.value.id = 5678;
        reportChange3 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT);
        reportChange3.value.id = 9876;

        flatWorkpad = new FlatWorkpad();
        flatWorkpad.portfolio = new Portfolio('SNP500', undefined, false, 'S&P 500 Index');

        reportGroup = new ReportGroup();
        reportGroup.title = 'Equity Report Group';

        await TestBed.configureTestingModule({
            declarations: [WorkpadChangeDetailComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(WorkpadChangeDetailComponent);
        component = fixture.componentInstance;
        component.workpadChange = new WorkpadFavoriteChange(flatWorkpad);
        fixture.detectChanges();
    });

    it('should initialize the changes in a selected flat workpad', () => {
        const flatWorkpadChange = new WorkpadFavoriteChange(flatWorkpad);
        flatWorkpadChange.modifiedReports = [reportChange1, reportChange2];

        component.workpadChange = flatWorkpadChange;
        component.ngOnChanges({workpadChange: new SimpleChange(undefined, component.workpadChange, false)});
        fixture.detectChanges();

        expect(component.workpadDisplayName).toEqual('Portfolio: S&P 500 Index (SNP500)');
        expect(component.reportTabs).toHaveLength(2);
        expect(component.selectedReportChange).toEqual(reportChange1);
        expect(component.selectedReportTabUid).toEqual(component.reportTabs[0].uid);

        expect(fixture.debugElement.nativeElement.querySelector('app-root-favorite-item')).toBeTruthy();
    });

    it('should initialize the changes in a selected Report Group', () => {
        const reportGroupChange = new WorkpadFavoriteChange(reportGroup);
        reportGroupChange.modifiedReports = [reportChange1, reportChange2, reportChange3];

        component.workpadChange = reportGroupChange;
        component.ngOnChanges({workpadChange: new SimpleChange(undefined, component.workpadChange, false)});
        fixture.detectChanges();

        expect(component.workpadDisplayName).toEqual('Report Group: Equity Report Group');
        expect(component.reportTabs).toHaveLength(3);
        expect(component.selectedReportChange).toEqual(reportChange1);
        expect(component.selectedReportTabUid).toEqual(component.reportTabs[0].uid);

        expect(fixture.debugElement.nativeElement.querySelector('app-root-favorite-item')).toBeTruthy();
    });

    it('should change the selected report', () => {
        const flatWorkpadChange = new WorkpadFavoriteChange(flatWorkpad);
        flatWorkpadChange.modifiedReports = [reportChange1, reportChange2];

        component.workpadChange = flatWorkpadChange;
        component.ngOnChanges({workpadChange: new SimpleChange(undefined, component.workpadChange, false)});
        fixture.detectChanges();

        expect(component.selectedReportChange).toEqual(reportChange1);
        expect(component.selectedReportTabUid).toEqual(component.reportTabs[0].uid);

        component.onReportSelectionChanged({detail: {uid: '1', eventData: 1} as AuxTabBarSelectedDetailInterface} as CustomEvent<AuxTabBarSelectedDetailInterface>);

        expect(component.selectedReportChange).toEqual(reportChange2);
        expect(component.selectedReportTabUid).toEqual(component.reportTabs[1].uid);

        expect(fixture.debugElement.nativeElement.querySelector('app-root-favorite-item')).toBeTruthy();
    });

    it('should not display Report RootFavoriteComponent if Report has not been saved', () => {
        delete reportChange1.value.id;
        reportChange1.isSelected = false;
        const flatWorkpadChange = new WorkpadFavoriteChange(flatWorkpad);
        flatWorkpadChange.modifiedReports = [reportChange1];

        component.workpadChange = flatWorkpadChange;
        component.ngOnChanges({workpadChange: new SimpleChange(undefined, component.workpadChange, false)});
        fixture.detectChanges();

        expect(component.workpadDisplayName).toEqual('Portfolio: S&P 500 Index (SNP500)');
        expect(component.reportTabs).toHaveLength(1);
        expect(component.selectedReportChange).toEqual(reportChange1);
        expect(component.selectedReportTabUid).toEqual(component.reportTabs[0].uid);

        expect(fixture.debugElement.nativeElement.querySelector('app-root-favorite-item')).toBeFalsy();
    });
});
