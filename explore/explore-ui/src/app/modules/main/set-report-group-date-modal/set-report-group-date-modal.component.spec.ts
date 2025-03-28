import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {SetReportGroupDateModalComponent} from './set-report-group-date-modal.component';
import {ReportGroup} from '../../../models//workspace/report-group.model';
import {WorkspaceStore} from '../../../stores';
import {Portfolio} from '../../../models/portfolio/portfolio.model';
import {DateValue} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {AppStore} from '../../../app.store';
import {ExportComposite} from '../../../models/export/export-composite/export-composite.model';
import {cloneDeep} from 'lodash';
import {NotificationService} from '@services/notification';
import {WorkpadService} from '@services/workspace';

describe('SetReportGroupDateModalComponent', () => {
    let component: SetReportGroupDateModalComponent;
    let fixture: ComponentFixture<SetReportGroupDateModalComponent>;

    const appStoreStub = {
        updatePortfolioAndReloadReport: jest.fn(),
        openExportOptionsModal$: new BehaviorSubject<ExportComposite>(null)
    };

    const notificationServiceStub = {
        invokeWidgetReloadPrompt: jest.fn(),
        openDialog: jest.fn()
    };

    const workpadServiceStub = {
        updatePortInfoOnDateChange: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SetReportGroupDateModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: WorkpadService, useValue: workpadServiceStub}
            ]
        });

        fixture = TestBed.createComponent(SetReportGroupDateModalComponent);
        component = fixture.componentInstance;
        component.reportGroup = new ReportGroup();
        WorkspaceStore.init();

        const currentPortfolio = new Portfolio('PEP');
        currentPortfolio.datePicker = new DateValue({date: '05/18/2020', calCode: 'GP_HK_STD'});
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(currentPortfolio);

        fixture.detectChanges();
    });

    describe('onDateChange', () => {
        it('should set date', () => {
            component.onDateChange(DateValue.newDate('01/01/2020'));
            expect(component.dateValueObject.date).toBe('01/01/2020');
        });
    });

    describe('btnDone Test', () => {
        it('should set new date', () => {
            component.dateValueObject = new DateValue();
            component.dateValueObject.date = '01/01/2020';
            const port = new Portfolio('PEP');
            port.datePicker = cloneDeep(component.dateValueObject);
            component.reportGroup.portfolios = [port];
            component.onDoneClicked();
            expect(component.reportGroup.portfolios[0].datePicker.date).toBe('01/01/2020');
            // expect(component['appStore'].updatePortfolioAndReloadReport).toHaveBeenCalledWith(component['currentPortfolio']);
            expect(component['notificationService'].invokeWidgetReloadPrompt).not.toHaveBeenCalled();
            expect(component['workpadService'].updatePortInfoOnDateChange).not.toHaveBeenCalled();
            port.datePicker.date = '01/03/2020';
            component.onDoneClicked();
            expect(component['notificationService'].invokeWidgetReloadPrompt).not.toHaveBeenCalled();
            expect(component['workpadService'].updatePortInfoOnDateChange).not.toHaveBeenCalled();
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port);
            component['currentPortfolio'] = port;
            port.datePicker.date = '01/03/2020';
            component.onDoneClicked();
            expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
            expect(component['workpadService'].updatePortInfoOnDateChange).toHaveBeenCalled();
        });
    });
});
