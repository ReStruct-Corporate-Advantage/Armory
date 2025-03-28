import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {
    AlertConstants,
    CalendarDateUtils,
    DateFormatConstants,
    DateValue,
    ExploreRadioButton
} from '@blk/explore-ui-core';
import {AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {cloneDeep, isNil} from 'lodash';
import {
    FactorDataRiskMatrixSettings
} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {BehaviorSubject} from 'rxjs';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {takeUntil} from 'rxjs/operators';
import {WorkspaceStore} from '@stores/workspace.store';
import {NotificationService} from '@services/notification';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataChartSettingsStore} from '../stores/factor-data-chart-settings.store';

@Component({
    selector: 'app-factor-data-risk-matrix-settings',
    templateUrl: './factor-data-risk-matrix-settings.component.html',
    styleUrls: ['./factor-data-risk-matrix-settings.component.scss']
})
/**
 * This component shows a aux-card which contains settings specific to Risk Matrix mode in Chart Settings tab of Factor Data widget settings
 */
export class FactorDataRiskMatrixSettingsComponent extends BaseWidgetSettingComponent<FactorDataRiskMatrixSettings> implements OnInit {

    matrixTypes: ExploreRadioButton[];
    isMatrixTypesReadOnly = false;
    enableShowChangeInUpperTriangle: boolean;
    comparisonDate: DateValue;
    private calCode: string;

    isTriangularMatrix$ = new BehaviorSubject<boolean>(false);

    constructor(private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.calCode = WorkspaceStore.getCurrentPortfolio().datePicker.calCode;
        this.setInitialComparisonDate();

        // Configure settings based on whether FactorTimeSeriesSelectedOption is CORRELATIONS or REGRESSION_BETAS
        FactorDataChartSettingsStore.factorTimeSeriesSelectedOption
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((factorTimeSeriesSelectedOption) => {
                const isRegressionBetas = factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.REGRESSION_BETAS;
                const isTriangularMatrix = isRegressionBetas ? false : this.widgetInput.isTriangularMatrix;
                this.setIsTriangularMatrix(isTriangularMatrix);
                this.initializeMatrixTypes();
                this.isMatrixTypesReadOnly = isRegressionBetas;
                this.enableShowChangeInUpperTriangle = !isRegressionBetas;
                if (isRegressionBetas) {
                    this.widgetInput.showChangeInUpperTriangle = false;
                }
            });
    }

    private setInitialComparisonDate(): void {
        this.comparisonDate = DateValue.newDate(this.widgetInput.comparisonDate);
        this.comparisonDate.calCode = this.calCode;
    }

    private initializeMatrixTypes(): void {
        const matrixData = [
            {label: 'Rectangular', eventData: false},
            {label: 'Triangular', eventData: true},
        ];
        this.matrixTypes = matrixData.map(data => new ExploreRadioButton(data.label, this.widgetInput.isTriangularMatrix === data.eventData, false, data.eventData));
    }

    onMatrixTypeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (event?.detail?.value && event.detail.value.eventData !== this.widgetInput.isTriangularMatrix) {
            this.setIsTriangularMatrix(event.detail.value.eventData);
            this.widgetInput.showChangeInUpperTriangle = false;
        }
    }

    private setIsTriangularMatrix(value: boolean): void {
        this.widgetInput.isTriangularMatrix = value;
        this.isTriangularMatrix$.next(this.widgetInput.isTriangularMatrix);
    }

    onComparisonDateChanged(dateObject: DateValue): void {
        this.comparisonDate = dateObject;
        // If relative date is passed then show error notification
        if (this.comparisonDate.dateString) {
            this.notificationService.error(AlertConstants.PROVIDE_ABSOLUTE_DATE);
            return;
        }
        this.setComparisonDate(this.comparisonDate.date);
    }

    private setComparisonDate(date: string): void {
        const comparisonDate = CalendarDateUtils.getDateInFormat(date, DateFormatConstants.MMDDYYYY_SLASH);
        if (this.widgetInput.comparisonDate === comparisonDate) {
            return;
        }
        this.widgetInput.comparisonDate = comparisonDate;
        this.initializeComparisonMatrixRiskSettings();
        this.changeDetectorRef.detectChanges();
    }

    resetComparisonDate = (): void => {
        this.widgetInput.comparisonDate = undefined;
        this.setInitialComparisonDate();
        this.widgetInput.showChangeInUpperTriangle = false;
        this.initializeComparisonMatrixRiskSettings();
        this.changeDetectorRef.detectChanges();
    }

    onShowChangeInUpperTriangleToggled(value: boolean): void {
        this.widgetInput.showChangeInUpperTriangle = value;
    }

    private initializeComparisonMatrixRiskSettings(): void {
        if (!isNil(this.widgetInput.comparisonDate)) {
            let comparisonMatrixRiskSettings: RiskSettings = this.inputs.get(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS) as RiskSettings;
            if (isNil(comparisonMatrixRiskSettings)) {
                const widgetRiskSettings = this.inputs.get(CoreRiskConstants.RISK_SETTINGS) as RiskSettings;
                comparisonMatrixRiskSettings = cloneDeep(widgetRiskSettings);
                comparisonMatrixRiskSettings.hvarRiskSettings = undefined;
                this.inputs.set(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS, comparisonMatrixRiskSettings);
            }
        } else {
            this.inputs.delete(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS);
        }
    }

}
