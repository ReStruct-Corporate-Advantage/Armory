import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AuxCheckboxChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxRadioInterface,
    AuxSearchSelectOptionsInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface, AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    AddPortSource,
    CoreCommonConstants,
    CoreDefinitionStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {PortfolioSearchComponent, PortfolioSearchServiceInterface} from '@blk/explore-ui-portfolio-search';
import {cloneDeep, has, isEqual, isNil, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {AdvancedRiskSettings} from '../../models/advanced-risk-settings/advanced-risk-settings.model';
import {PORTFOLIO_SEARCH_SERVICE_TOKEN} from '../../tokens';
import {PositionModeSettings} from '../../models/position-mode-settings/position-mode-settings.model';
import {FilterScaling, FilterScalingUtil} from '../../enums/filter-scaling.enum';

/**
 * Advanced Risk Settings Modal Component
 *
 * @example
 *  <ng-container *ngIf="isAdvancedRiskSettingsModalOpen">
 *      <explore-risk-advanced-risk-settings-modal [isOpen]="isAdvancedRiskSettingsModalOpen"
 *                                        (modalClosed)="closeAdvancedRiskSettingsModal()"
 *                                        [advancedRiskSettingsInput]="riskSettings.advancedRiskSettings"
 *                                        [isSourceVisible]="isSourceVisible">
 *      </explore-risk-advanced-risk-settings-modal>
 *  </ng-container>
 */
@Component({
    selector: 'explore-risk-advanced-risk-settings-modal',
    templateUrl: './advanced-risk-settings-modal.component.html',
    styleUrls: ['./advanced-risk-settings-modal.component.scss', '../../../styles/common-risk-styles.scss']
})
export class AdvancedRiskSettingsModalComponent implements OnInit {
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Output() updateAdvancedRiskSettingsEvent = new EventEmitter<AdvancedRiskSettings>();
    @Output() updateRiskSettingFlag: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() updatePositionModeSettingsEvent: EventEmitter<PositionModeSettings> = new EventEmitter<PositionModeSettings>();
    @Input() isOpen: boolean;
    @Input() isOptimizationSettingsModalOpen: boolean;

    @Input() advancedRiskSettingsInput: AdvancedRiskSettings;
    @Input() isSourceVisible = false;

    @Input() positionModeSettingsInput: PositionModeSettings;
    @Input() showPositionModes: boolean;
    @Input() showFilterScalingOptions: boolean;

    filterScaling: FilterScaling;
    filerScalingOptions: AuxRadioInterface[] = [];

    positionModeSettings: PositionModeSettings;

    @ViewChild('portSearchComp', {static: false}) portSearchComp: PortfolioSearchComponent;

    availableExcludeBlocks: AuxSelectOptionGroup[];
    availableAssetClassCovarianceOptions: AuxSelectOptionGroup[];

    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource;

    selectProps: AuxSearchSelectOptionsInterface = {
        data: [{values: [{displayValue: 'Portfolios', value: false, isSelected: true}]}],
    };

    advancedRiskSettings: AdvancedRiskSettings;
    inputExcludeFactor: string;
    assumeZeroAverageReturn: boolean;
    exposureLookback: number;


    readonly APPLY_TEXT: string = CoreCommonConstants.BUTTON_TEXT.APPLY;
    readonly CANCEL_TEXT: string = CoreCommonConstants.BUTTON_TEXT.CANCEL;
    readonly propertyList = cloneDeep(CoreRiskConstants.ADVANCED_SETTINGS_PROPERTIES);

    constructor(@Inject(PORTFOLIO_SEARCH_SERVICE_TOKEN) public portfolioSearchService: PortfolioSearchServiceInterface) {
    }

    /**
     * Init hook
     */
    ngOnInit(): void {
        this.advancedRiskSettings = cloneDeep(this.advancedRiskSettingsInput);
        this.positionModeSettings = this.positionModeSettingsInput;
        this.availableExcludeBlocks = [new ExploreSelectOptionGroup([])];
        this.availableAssetClassCovarianceOptions = [new ExploreSelectOptionGroup([])];
        this.availableExcludeBlocks[0].values.push(new ExploreSelectOption(CoreRiskConstants.NONE, ''));
        CoreDefinitionStore.excludeFactorBlock.forEach(excludeFactor => this.availableExcludeBlocks[0].values.push(new ExploreSelectOption(excludeFactor.text, excludeFactor.value)));
        this.availableExcludeBlocks[0].values.push(new ExploreSelectOption(CoreRiskConstants.OTHER, CoreRiskConstants.OTHER));

        this.filterScaling =  isUndefined(this.advancedRiskSettings.filterScaling) ? FilterScaling.PORTFOLIO_NAV : this.advancedRiskSettings.filterScaling;
        CoreRiskConstants.ASSET_CLASS_COVARIANCE_TYPE_OPTIONS.forEach(option => this.availableAssetClassCovarianceOptions[0].values.push(new ExploreSelectOption(option.label, option.value)));
        this.assumeZeroAverageReturn =  isUndefined(this.advancedRiskSettings.assumeZeroAverageReturn) ? true : this.advancedRiskSettings.assumeZeroAverageReturn;
        this.exposureLookback = isUndefined(this.advancedRiskSettings.exposureLookback) ? 0 : this.advancedRiskSettings.exposureLookback;
        // update isSelected for aux-select
        this.refreshExcludeBlockList();
        this.refreshFilterScalingOptions();
        this.refreshAssetClassCovarianceOptions();
    }

    /**
     * Exclude factor selection handler
     */
    onExcludeFactorSelectionChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if ((ev.detail.value as AuxSelectOption).value !== CoreRiskConstants.OTHER) {
            this.advancedRiskSettings.excludeBlock = (ev.detail.value as AuxSelectOption).value;
        }
    }

    /**
     * Market change handler
     */
    onMarketChanged(newMarket: string): void {
        this.advancedRiskSettings.market = newMarket;
    }

    onOtherExcludeFactorChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        const changedExcludeFactor = event.detail.value;
        this.advancedRiskSettings.excludeBlock = changedExcludeFactor;
        this.inputExcludeFactor = changedExcludeFactor;
    }

    onFilterScalingChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (!event) {
            return;
        }
        if (has(event.detail, 'value')) {
            this.filterScaling = event.detail.value.eventData;
            this.advancedRiskSettings.filterScaling = event.detail.value.eventData;
        }
    }

    onDxSBlockChange(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        const changedDxSBlock = event.detail.value;
        this.advancedRiskSettings.dxsBlock = changedDxSBlock;
    }

    /**
     * Exclude asset class covariance changed
     */
    onAssetClassCovarianceSelectionChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if ((ev.detail.value as AuxSelectOption).value) {
            this.advancedRiskSettings.assetClassCovariance = (ev.detail.value as AuxSelectOption).value;
        }
    }

    onScaleDxSExposuresChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.advancedRiskSettings.scaleDxsExposures = event.detail.value.checked;
    }

    onAssumeZeroAverageReturnChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.assumeZeroAverageReturn = event.detail.value.checked;
        this.advancedRiskSettings.assumeZeroAverageReturn = event.detail.value.checked;
    }

    onExposureLookbackChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (!event || !event.detail) {
            return;
        }
        this.exposureLookback = Number(event.detail.value);
        this.advancedRiskSettings.exposureLookback = Number(event.detail.value);
    }

    onRiskMatrixChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (!event || !event.detail) {
            return;
        }
        this.advancedRiskSettings.riskMatrix = Number(event.detail.value);
    }

    /**
     * Exclude factor reset handler
     */
    excludeReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.EXCLUDE_BLOCK);
        if (this.isOptimizationSettingsModalOpen) {
            this.advancedRiskSettings.excludeBlock = '';
        }
        this.refreshExcludeBlockList();
    }

    /**
     * Market reset handler
     */
    marketReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.MARKET);
        this.portSearchComp.searchString = '';
    }

    /**
     * Filter scaling reset handler
     */
    filterScalingReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.FILTER_SCALING);
        this.filterScaling = isUndefined(this.advancedRiskSettings.filterScaling) ? FilterScaling.PORTFOLIO_NAV : this.advancedRiskSettings.filterScaling;
        this.refreshFilterScalingOptions();
    }

    /**
     * Asset Class covariance reset handler
     */
    assetClassCovarianceReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.ASSET_CLASS_COVARIANCE);
        this.refreshAssetClassCovarianceOptions();
    }

    /**
     * DXS block reset handler
     */
    dxsBlockReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.DXS_BLOCK);
    }

    /**
     * Scale DxS Exposures reset handler
     */
    scaleDxsExposuresReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.SCALE_DXS_EXPOSURES);
    }

    /**
     * Assume zero average return reset handler
     */
    assumeZeroAverageReturnReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.ASSUME_ZERO_AVERAGE_RETURN);
        this.assumeZeroAverageReturn = isUndefined(this.advancedRiskSettings.assumeZeroAverageReturn) ? true : this.advancedRiskSettings.assumeZeroAverageReturn;
    }

    exposureLookbackReset(): void {
        this.advancedRiskSettings.resetValue(this.propertyList.EXPOSURE_LOOKBACK);
        this.exposureLookback = isUndefined(this.advancedRiskSettings.exposureLookback) ? 0 : this.advancedRiskSettings.exposureLookback;
    }

    /**
     * Risk Matrix Reset Handler
     */

    riskMatrixReset(): void{
        this.advancedRiskSettings.riskMatrix = 1;
    }


    /**
     * Invokes function to close the modal
     */
    closeModal(apply?: boolean): void {
        // if clicking APPLY, pass the new value to riskSettings
        if (apply) {
            this.updateAdvancedRiskSettingsEvent.emit(this.advancedRiskSettings);
            // update parent component and update flag
            this.updateRiskSettingFlag.emit();
            this.updatePositionModeSettingsEvent.emit(this.positionModeSettings);
        }

        this.isOpen = false;
        this.isOptimizationSettingsModalOpen = false;
        this.modalClosed.emit();
    }

    /**
     * Function to refresh exclude factor list
     */
    refreshExcludeBlockList(): void {
        this.availableExcludeBlocks[0].values.forEach(excludeBlock => excludeBlock.isSelected = false);
        let auxSelectOptions = this.availableExcludeBlocks[0].values.filter(excludeBlock => excludeBlock.value === this.advancedRiskSettings.excludeBlock);
        if(auxSelectOptions.length === 0){
            this.availableExcludeBlocks[0].values[this.availableExcludeBlocks[0].values.length-1].isSelected=true;
            this.inputExcludeFactor = this.advancedRiskSettings.excludeBlock;
        }
        else{
            auxSelectOptions[0].isSelected=true;
        }
        this.availableExcludeBlocks = this.availableExcludeBlocks.map(excludeBlock => excludeBlock);
    }

    refreshFilterScalingOptions(): void {
        this.filerScalingOptions = [];
        FilterScalingUtil.values().forEach(filterScaling => {
            this.filerScalingOptions.push(
                {label: FilterScalingUtil.getDisplayName(filterScaling), checked: isEqual(filterScaling, this.filterScaling), eventData: filterScaling});
        });
    }

    /**
     * Function to refresh asset class variance option list
     */
    refreshAssetClassCovarianceOptions(): void {
        this.availableAssetClassCovarianceOptions[0].values.forEach(option => option.isSelected = false);
        const auxSelectOptions = this.availableAssetClassCovarianceOptions[0].values.filter(option => option.value === this.advancedRiskSettings.assetClassCovariance);
        if (auxSelectOptions.length === 0) {
            this.availableAssetClassCovarianceOptions[0].values[this.availableAssetClassCovarianceOptions[0].values.length - 1].isSelected = true;
        } else {
            auxSelectOptions[0].isSelected = true;
        }
        this.availableAssetClassCovarianceOptions = this.availableAssetClassCovarianceOptions.map(excludeBlock => excludeBlock);
    }
}
