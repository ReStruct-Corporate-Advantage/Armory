import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PasteWidgetModalComponent} from './paste-widget-modal.component';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';

describe('PasteWidgetModalComponent', () => {
    let component: PasteWidgetModalComponent;
    let fixture: ComponentFixture<PasteWidgetModalComponent>;

    const pasteWidgetServiceStub = {
        pasteWidget: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PasteWidgetModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: ExploreWidgetPasteService, useValue: pasteWidgetServiceStub}]
        });

        fixture = TestBed.createComponent(PasteWidgetModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        WorkspaceStore.init();
        const report = new Report();
        report.key = 1234567;
        WorkspaceStore.updateCurrentReport(report);
    });

    describe('pasteWidget Test', () => {
        it('valid event', async () => {
            const event: any = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clipboardData: {getData: jest.fn().mockReturnValue({})}
            };
            component.isOpen = true;
            await component.pasteWidget(event);
            expect(pasteWidgetServiceStub.pasteWidget).toHaveBeenCalledWith({}, WorkspaceStore.getCurrentReport());
            expect(component.isOpen).toBeFalsy();
        });
        it('invalid event', async () => {
            const event: any = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clipboardData: undefined
            };
            pasteWidgetServiceStub.pasteWidget.mockClear();
            await component.pasteWidget(undefined);
            expect(pasteWidgetServiceStub.pasteWidget).not.toHaveBeenCalled();
            await component.pasteWidget(event);
            expect(pasteWidgetServiceStub.pasteWidget).not.toHaveBeenCalled();
            event.clipboardData = {getData: jest.fn().mockReturnValue(undefined)};
            await component.pasteWidget(event);
            expect(pasteWidgetServiceStub.pasteWidget).not.toHaveBeenCalled();
        });
    });
});
