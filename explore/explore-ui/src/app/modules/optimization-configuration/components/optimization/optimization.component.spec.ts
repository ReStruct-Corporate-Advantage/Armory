import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OptimizationComponent} from './optimization.component';
import {OptimizationService} from '../../services/optimization-service.interface';
import {OPTIMIZATION_SERVICE} from '../../tokens/optimization-service.token';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {OptimizationConstants} from '@constants/optimization.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';

describe('OptimizationComponent', () => {
    let component: OptimizationComponent;
    let fixture: ComponentFixture<OptimizationComponent>;
    let optimizationService: OptimizationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OptimizationComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: OPTIMIZATION_SERVICE,
                    useValue: {
                        getOptimizationSummaries$: jest.fn(() => of([])),
                        getRunUpdateNotification: jest.fn()
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(OptimizationComponent);
        component = fixture.componentInstance;
        component.currentPort = new PortfolioWithPositions('TestPf');
        component.currentPort.optimizationSettings = new OptimizationSettings();
        optimizationService = TestBed.inject(OPTIMIZATION_SERVICE);
        component.runNotification = {
            open: jest.fn(),
            close: jest.fn()
        } as any;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should restore default', () => {
        const emitSpy = jest.spyOn(component.restoreDefault, 'emit');
        expect(component.onRestoreDefault()).toBe(false);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should load', () => {
        const emitSpy = jest.spyOn(component.load, 'emit');
        expect(component.onLoad()).toBe(false);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should save', () => {
        const emitSpy = jest.spyOn(component.save, 'emit');
        component.onSave();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit downloadRosRequest', () => {
        const emitSpy = jest.spyOn(component.downloadROSRequest, 'emit');
        component.onDownloadROSRequest();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should run', () => {
        const emitSpy = jest.spyOn(component.run, 'emit');
        component.onRun();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should run with First optimal solution', () => {
        const emitSpy = jest.spyOn(component.run, 'emit');
        component.timeoutType = OptimizationConstants.FIRST_SOLUTION;
        component.onRun(undefined);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith( {'debugContext': false, 'hardRefresh': false, 'mipTimeLimit': undefined});

        component.timeoutType = OptimizationConstants.MAX_TIMEOUT_LIMIT;
        component.onRun({
            detail: {
                srcEvent: {
                    ctrlKey: true
                }
            }
        } as any);
        expect(emitSpy).toHaveBeenCalledTimes(2);
        expect(emitSpy).toHaveBeenLastCalledWith({'debugContext': false, 'hardRefresh': true, 'mipTimeLimit': 900});
    });

    it('should close', () => {
        const emitSpy = jest.spyOn(component.close, 'emit');
        component.onClose();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should edit', () => {
        const type = 'type';
        const subType = 'subType';
        expect(component.launchOptimizationSettings).toEqual(false);
        component.onEdit(type, subType);
        expect(component.launchOptimizationSettings).toEqual(true);
        expect(component.type).toBe(type);
        expect(component.subType).toBe(subType);
    });

    describe('should hide modal on closed', () => {
        it('should not show notification if no changes', () => {
            const getRunUpdateNotificationSpy = jest.spyOn(optimizationService, 'getRunUpdateNotification');
            component.launchOptimizationSettings = true;

            component.onModalClosed(false);
            expect(component.launchOptimizationSettings).toBe(false);
            expect(getRunUpdateNotificationSpy).not.toHaveBeenCalled();
        });

        it('should not show notification if changes but already showing notification', () => {
            const getRunUpdateNotificationSpy = jest.spyOn(optimizationService, 'getRunUpdateNotification');
            component.launchOptimizationSettings = true;
            component.showNotification = true;

            component.onModalClosed(true);
            expect(component.launchOptimizationSettings).toBe(false);
            expect(getRunUpdateNotificationSpy).not.toHaveBeenCalled();
            expect(component.showNotification).toBe(true);
        });

        it('should not show notification if changes and not already showing but no notification', () => {
            const getRunUpdateNotificationSpy = jest.spyOn(optimizationService, 'getRunUpdateNotification');
            getRunUpdateNotificationSpy.mockReturnValue(undefined);
            component.launchOptimizationSettings = true;
            component.showNotification = false;

            component.onModalClosed(true);
            expect(component.launchOptimizationSettings).toBe(false);
            expect(getRunUpdateNotificationSpy).toHaveBeenCalledTimes(1);
            expect(component.showNotification).toBe(false);
        });

        it('should show notification if changes, not already showing, and notification', () => {
            const getRunUpdateNotificationSpy = jest.spyOn(optimizationService, 'getRunUpdateNotification');
            getRunUpdateNotificationSpy.mockReturnValue({message: 'message'} as any);
            component.launchOptimizationSettings = true;
            component.showNotification = false;

            component.onModalClosed(true);
            expect(component.launchOptimizationSettings).toBe(false);
            expect(getRunUpdateNotificationSpy).toHaveBeenCalledTimes(1);
            expect(component.showNotification).toBe(true);
        });
    });

    it('should hide notification on notification closed', () => {
        component.showNotification = true;
        component.onNotificationClosed();
        expect(component.showNotification).toBe(false);
    });

    it('should set finalMipTimeLimit correctly when null', () => {
        component.mipTimeLimit = null;
        component.onDoneClicked();
        expect(component.finalMipTimeLimit).toBe(60);
    });

    it('should set popover state correctly', () => {
        component.onCancelClicked();
        expect(component.popoverOpen).toBe(false);
        component.onPopOverOpened();
        expect(component.popoverOpen).toBe(true);
    });

    it('should set correct value for mipTimeLimit', () => {
        let event = {detail: {value:'2'}} as CustomEvent;
        component.onValueChanged(event);
        expect(component.mipTimeLimit).toBe(2);
    });

    it('on timeout option changed', () => {
        let event = {timeoutType: OptimizationConstants.MAX_TIMEOUT_LIMIT};
        component.onTimeoutOptionChanged(event);
        expect(component.timeoutType).toBe(OptimizationConstants.MAX_TIMEOUT_LIMIT);
    });

    it('should emit cancelOptimization event when onCancelOptimization is called', () => {
        const cancelOptimizationSpy = jest.spyOn(component.cancelOptimization, 'emit');
        component.onCancelOptimization();
        expect(cancelOptimizationSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit resetComposition', () => {
        jest.spyOn(component.resetComposition, 'emit');
        component.onResetComposition();
        expect(component.resetComposition.emit).toHaveBeenCalled();
    });
});
