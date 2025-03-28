import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorDataRiskMatrixSettingsComponent} from './factor-data-risk-matrix-settings.component';
import {DateValue, WidgetConfigInput} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {NotificationService} from '@services/notification';
import {BehaviorSubject} from 'rxjs';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FactorDataChartSettingsStore} from '../stores/factor-data-chart-settings.store';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';

describe('FactorDataRiskMatrixSettingsComponent', () => {
    let component: FactorDataRiskMatrixSettingsComponent;
    let fixture: ComponentFixture<FactorDataRiskMatrixSettingsComponent>;

    const notificationServiceStub = {
        error: jest.fn(),
    };

    beforeAll(() => {
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio());
        WorkspaceStore.getCurrentPortfolio().datePicker = DateValue.newDate('03/05/2021');
        WorkspaceStore.getCurrentPortfolio().datePicker.calCode = '';
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ FactorDataRiskMatrixSettingsComponent ],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(FactorDataRiskMatrixSettingsComponent);
        component = fixture.componentInstance;
        component.widgetConfigInput = {
            'inputConfigType': 'factorDataRiskMatrixSettings',
            'inputName': 'factorDataRiskMatrixSettings',
            'default': {
                'isTriangularMatrix': true,
                'showChangeInUpperTriangle': true
            }
        } as unknown as WidgetConfigInput;

        const riskSettings = new RiskSettings();
        riskSettings.economyRiskSettings.weightingScheme = 'WKL';

        component.inputs = new Map();
        component.inputs.set(FactorDataRiskMatrixSettings.configType, new FactorDataRiskMatrixSettings(component.widgetConfigInput.default));
        component.inputs.set(CoreRiskConstants.RISK_SETTINGS, riskSettings);

        FactorDataChartSettingsStore.init();
        FactorDataChartSettingsStore.factorTimeSeriesSelectedOption.next(FactorTimeSeriesSelectedOption.CORRELATIONS);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test initializeComponent for CORRELATIONS', () => {
        // component.initializeComponent() called as part of fixture.detectChanges()
        expect(component.isTriangularMatrix$).not.toBeUndefined();
        expect(component.isTriangularMatrix$.getValue()).toBe(true);
        expect(component.comparisonDate).not.toBeUndefined();
        expect(component.comparisonDate.date).toBeUndefined();
        expect(component.matrixTypes).not.toBeUndefined();
        expect(component.matrixTypes.length).toBe(2);
        expect(component.enableShowChangeInUpperTriangle).toBe(true);
        expect(component.isMatrixTypesReadOnly).toBe(false);
    });

    it('test initializeComponent for REGRESSION_BETAS', () => {
        // component.initializeComponent() called as part of fixture.detectChanges()

        FactorDataChartSettingsStore.factorTimeSeriesSelectedOption.next(FactorTimeSeriesSelectedOption.REGRESSION_BETAS);

        expect(component.isTriangularMatrix$).not.toBeUndefined();
        expect(component.isTriangularMatrix$.getValue()).toBe(false);
        expect(component.comparisonDate).not.toBeUndefined();
        expect(component.comparisonDate.date).toBeUndefined();
        expect(component.matrixTypes).not.toBeUndefined();
        expect(component.matrixTypes.length).toBe(2);
        expect(component.enableShowChangeInUpperTriangle).toBe(false);
        expect(component.isMatrixTypesReadOnly).toBe(true);
    });

    it('test onMatrixTypeChanged', () => {
        const event = {
            detail: {
                value: {
                    eventData: true
                }
            }
        } as unknown as CustomEvent<AuxRadioGroupChangedDetailInterface>;
        component.onMatrixTypeChanged(event);
        expect(component.widgetInput.isTriangularMatrix).toBe(true);
        expect(component.isTriangularMatrix$.getValue()).toBe(true);
    });

    it('test onMatrixTypeChanged', () => {
        component.widgetInput.isTriangularMatrix = false;
        const event = {
            detail: {
                value: {
                    eventData: true
                }
            }
        } as unknown as CustomEvent<AuxRadioGroupChangedDetailInterface>;
        component.onMatrixTypeChanged(event);
        expect(component.widgetInput.isTriangularMatrix).toBe(true);
        expect(component.isTriangularMatrix$.getValue()).toBe(true);
        expect(component.widgetInput.showChangeInUpperTriangle).toBe(false);
    });

    describe('test onComparisonDateChanged', () => {
        it('test onComparisonDateChanged with absolute date', () => {
            const dateObject = DateValue.newDate('03/15/2021');

            jest.spyOn(component, 'setComparisonDate').mockImplementationOnce((_date) => {} );

            component.onComparisonDateChanged(dateObject);

            expect(component['setComparisonDate']).toHaveBeenCalledWith('03/15/2021');
        });

        it('test onComparisonDateChanged with relative date', () => {
            jest.spyOn(component, 'setComparisonDate').mockImplementationOnce((_date) => {} );
            jest.spyOn(component['notificationService'], 'error');

            const dateObject = DateValue.newRelativeDate('T-10');

            component.onComparisonDateChanged(dateObject);

            expect(component['setComparisonDate']).not.toHaveBeenCalled();
            expect(component['notificationService'].error).toHaveBeenCalled();
        });
    });

    it('test setComparisonDate', () => {
        jest.spyOn(component, 'initializeComparisonMatrixRiskSettings').mockImplementationOnce(() => {} );

        const dateString = '03/15/2021';
        component.widgetInput.comparisonDate = dateString;

        component['setComparisonDate'](dateString);

        expect(component.widgetInput.comparisonDate).toBe(dateString);
    });

    it('test resetComparisonDate', () => {
        jest.spyOn(component, 'initializeComparisonMatrixRiskSettings').mockImplementationOnce(() => {} );

        component['resetComparisonDate']();

        expect(component.widgetInput.comparisonDate).toBeUndefined();
        expect(component.comparisonDate.date).toBeUndefined();
        expect(component.widgetInput.showChangeInUpperTriangle).toBe(false);
    });

    it('test onShowChangeInUpperTriangleToggled', () => {
        component['onShowChangeInUpperTriangleToggled'](true);
        expect(component.widgetInput.showChangeInUpperTriangle).toBe(true);
    });

    it('test initializeComparisonMatrixRiskSettings when comparisonDate is set', () => {
        component.widgetInput.comparisonDate = '03/15/2021';

        component['initializeComparisonMatrixRiskSettings']();

        const expected = component.inputs.get(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS) as RiskSettings;

        expect(expected).toBeDefined();
        expect(expected).not.toBeNull();
        expect(expected.economyRiskSettings.weightingScheme).toBe('WKL');
    });

    it('test initializeComparisonMatrixRiskSettings when comparisonDate is undefined or null', () => {
        component.widgetInput.comparisonDate = undefined;

        component.inputs.set(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS, new RiskSettings());

        component['initializeComparisonMatrixRiskSettings']();

        expect(component.inputs.get(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS)).toBeUndefined();
    });
});
