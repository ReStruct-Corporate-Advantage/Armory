import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isNil, isUndefined} from 'lodash';
import {LiquidityConstants} from '../../liquidity.constants';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';
import {ExploreSelectOptionGroup, CoreCommonConstants} from '@blk/explore-ui-core';
import {AdvancedLiquiditySettings} from '../../models/advanced-liquidity-settings.model';

/**
 * Advanced settings in liquidity Settings
 */
@Component({
    selector: 'explore-column-option-advanced-liquidity-settings-modal',
    templateUrl: './advanced-liquidity-settings-modal.component.html',
    styleUrls: ['./advanced-liquidity-settings-modal.component.scss']
})
export class AdvancedLiquiditySettingsModalComponent extends BaseLiquiditySettingsComponent<AdvancedLiquiditySettings> implements OnInit {
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Output() updateAdvancedLiquiditySettingsEvent = new EventEmitter<AdvancedLiquiditySettings>();

    @Input() isOpen: boolean;
    @Input() assetClassModelMapping: { text: string, value: string}[];

    isShowModelSelectionSettings: boolean;
    // Asset class and model grouping which will be displayed on the UI. Multiple models will be inside a dropdown
    // which the user can select from
    assetClassModelGrouping: Map<string, ExploreSelectOptionGroup[]>;

    modelDescriptionToPurposeMap: Map<string, string>;


    readonly APPLY_TEXT: string = CoreCommonConstants.BUTTON_TEXT.APPLY;
    readonly CANCEL_TEXT: string = CoreCommonConstants.BUTTON_TEXT.CANCEL;

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * Initialize all required fields
     */
    ngOnInit(): void {
        if (isUndefined(this.underlyingLiquiditySettings)) {
            this.underlyingLiquiditySettings = new AdvancedLiquiditySettings();
            this.underlyingLiquiditySettings.modelSelectionMapping = new Map<string, string>();
        }
       const displayAssetClassModelMapping: { text: string, value: string}[] = [];
       this.modelDescriptionToPurposeMap = new Map<string, string>();
        this.assetClassModelMapping.forEach( modelMapping => {
            let modelMappingArray: string[] = [];
            // We receive the DecodeEntry in the format text ->  Futures v1.0 Outright:FUT15O and value -> Futures
            // We split the text based on ':' to only show the modelDescription on the UI
            modelMappingArray = modelMapping.text.split(':');
            displayAssetClassModelMapping.push({
                text : modelMappingArray[0],
                value: modelMapping.value
            });
            // We split the text based on ':' and store the two parts as a Map where the key is modelDescription and the value is modelPurpose
            if ( modelMappingArray.length === 2) {
                this.modelDescriptionToPurposeMap.set(modelMappingArray[0], modelMappingArray[1]);
            }
        });
        this.isShowModelSelectionSettings = this.optionAttributes.get(LiquidityConstants.MODEL_SELECTION_SETTINGS);
        const sortedAssetClassModelMapping: Map<string, string[]> = new Map<string, string[]>(
            Object.entries(this.sortKeysAndValues(displayAssetClassModelMapping)));
        this.assetClassModelGrouping = new Map<string, ExploreSelectOptionGroup[]>();

        this.populateAssetClassModelGrouping(sortedAssetClassModelMapping);
    }

    private populateAssetClassModelGrouping(sortedAssetClassModelMapping: Map<string, string[]>) {
        sortedAssetClassModelMapping.forEach((value, key) => {
            const selectedItem = this.underlyingLiquiditySettings.modelSelectionMapping.get(key) ? this.underlyingLiquiditySettings.modelSelectionMapping.get(key)
                : LiquidityConstants.DEFAULT_MODEL_SELECTION;

            const displayModelValues: string[] = [LiquidityConstants.DEFAULT_MODEL_SELECTION];
            displayModelValues.push(...value);

            const modelValues: string[] = [LiquidityConstants.DEFAULT_MODEL_SELECTION];
            const purposeValues: string[] = [];
            value.forEach(val => purposeValues.push(this.modelDescriptionToPurposeMap.get(val)));
            modelValues.push(...purposeValues);

            const exploreSelectOptionGroup = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(modelValues, displayModelValues, selectedItem);

            this.assetClassModelGrouping.set(key, exploreSelectOptionGroup);
        });
    }

    /**
     * Sort the given object array based on both the text and value fields
     */
    private sortKeysAndValues(arr: { text: string, value: string }[]): Map<string, string[]> {
        const map: Map<string, string[]> = new Map<string, string[]>();
        for (const elem of arr) {
            const text = elem.text;
            const value = elem.value;

            if (map[value]) {
                map[value].push(text);
            } else {
                map[value] = [text];
            }
        }
        const sortedMap: Map<string, string[]> = new Map<string, string[]>();
        for (const key of Object.keys(map).sort()) {
            sortedMap[key] = map[key].sort();
        }
        return sortedMap;
    }

    /**
     * On model selection changed
     */
    onModelSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>, assetClass: string): void {
        if (isNil(event)) {
            return;
        }

        const value = (event.detail.value as AuxSelectOption).value;

        this.underlyingLiquiditySettings.modelSelectionMapping.set(assetClass, value);
    }

    /**
     * Invokes function to close the modal
     */
    closeModal(apply?: boolean): void {
        // if clicking APPLY, pass the new value to liquidity settings
        if (apply) {
            this.updateAdvancedLiquiditySettingsEvent.emit(this.underlyingLiquiditySettings);
        }
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
