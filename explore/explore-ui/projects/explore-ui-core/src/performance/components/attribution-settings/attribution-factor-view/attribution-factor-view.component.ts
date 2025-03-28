import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {AuxAdvancedTreeListInterface, AuxButtonTypeEnum} from '@blk/aladdin-angular-components';
import {PraadaFactor} from '../../../../definition/models/praada-meta-data/praada-factor.model';
import {PerformanceConstants} from '../../../performance.constants';
import {AssetType} from '../../../asset-type.enum';
import {AttributionSettings} from '../../../models/attribution-settings/attribution-settings.model';
import {AdvancedTreeListComponent} from '../../../../ui/components/advanced-tree-list/advanced-tree-list.component';
import {SubscribableComponent} from '../../../../core/components/subscribable.component';
import {cloneDeep} from 'lodash';
import {CoreCommonConstants} from '../../../../core/constants';

@Component({
    selector: 'explore-core-attribution-factor-view',
    templateUrl: './attribution-factor-view.component.html',
    styleUrls: ['./attribution-factor-view.component.scss']
})
export class AttributionFactorViewComponent extends SubscribableComponent implements OnChanges, OnInit {
    @Input() cannedMethod: string;
    @Input() sourceLabel: string;
    @Input() targetLabel: string;
    @Input() isSelectionAllowed: boolean;
    @Input() showFactors: boolean;
    @Input() factorsList: PraadaFactor[];
    @Input() settings: AttributionSettings;
    @Input() isOpenModal: boolean;
    @Input() resetExcessFlagMap: boolean;
    @Input() isCustom: boolean;
    @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
    @Output() columnsUpdated: EventEmitter<AuxAdvancedTreeListInterface[]> = new EventEmitter<AuxAdvancedTreeListInterface[]>();

    @ViewChild('advancedTreeListComponent', {static: false}) advancedTreeListComponent: AdvancedTreeListComponent;

    // AdvancedTreeList
    advTreeListData: AuxAdvancedTreeListInterface[];
    excessAdvTreeListData: AuxAdvancedTreeListInterface[] = [];
    nonExcessAdvTreeListData: AuxAdvancedTreeListInterface[] = [];
    leafExcessAdvTreeListData: Set<AuxAdvancedTreeListInterface>;

    factorsDeletedFromExcess: boolean;

    protected readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    protected readonly PerformanceConstants = PerformanceConstants;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        super();
    }


    ngOnInit() {
        this.factorsDeletedFromExcess = false;
    }

    /**
     * As soon as we change the tab, cannedMethod changes and new lists are created
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.resetExcessFlagMap && changes.resetExcessFlagMap.currentValue) {
            this.settings.excessFlagMap = undefined;
            this.resetExcessFlagMap = false;
            this.onChangesInitializeComponent();
        }

        if (changes.cannedMethod) {
            if ((changes.cannedMethod.currentValue !== PerformanceConstants.CANNED_METHOD.CUSTOM && changes.cannedMethod.previousValue !== PerformanceConstants.CANNED_METHOD.CUSTOM) ||
                changes.cannedMethod.currentValue === PerformanceConstants.CANNED_METHOD.CUSTOM && !changes.cannedMethod.previousValue) {
                this.onChangesInitializeComponent();
            } else if (changes.cannedMethod.previousValue === PerformanceConstants.CANNED_METHOD.CUSTOM && changes.cannedMethod.currentValue !== PerformanceConstants.CANNED_METHOD.CUSTOM) {
                this.onChangesInitializeComponent();
            }
        }
    }

    onChangesInitializeComponent(): void {
        // Fix for asynchronous calls when cannedMethod is changed or the settings are updated
        setTimeout(() => {
            this.initializeComponent();
            this.changeDetectorRef.markForCheck();
        }, 200);
    }

    /**
     * Close the modal and populate the factors to be added
     */
    closeAddFactorsModal(): void {
        this.closeModal.emit();
    }

    private initializeComponent(): void {
        this.advTreeListData = [];
        this.advTreeListData.length = 0;
        this.leafExcessAdvTreeListData = new Set<AuxAdvancedTreeListInterface>();

        if (!this.settings.excessFlagMap) {
            this.settings.excessFlagMap = new Map<string, boolean>();
        }

        // Create treeList from factorList
        this.groupAndSetFactorsAsExcessAndNonExcess(this.factorsList, this.advTreeListData);

        // reset the reference to update the UI
        this.advTreeListData = this.advTreeListData.map(data => data);

        this.setExcessFactors();
        this.setNonExcessFactors();

        this.factorsDeletedFromExcess = false;
    }

    /**
     * Group the factors passed in into groups of excess and non excess factors and set them in the passed in variables
     */
    groupAndSetFactorsAsExcessAndNonExcess(factorList: PraadaFactor[], excessAndNonExcessFactorsList: AuxAdvancedTreeListInterface[]): void {
        const factorGroupMap = new Map<string, AuxAdvancedTreeListInterface>();

        for (const praadaFactor of factorList) {
            // validate the factor and skip it if not required.
            if (this.isInNoShowList(praadaFactor)) {
                continue;
            }

            // If there is factor group in the factor create a group for it
            if (praadaFactor.factorGroup && praadaFactor.factorGroup !== CoreCommonConstants.EMPTY_STRING) {
                praadaFactor.factorGroupList = [praadaFactor.factorGroup];
            }

            // The factor group now needs to be part of excess or non excess based on if its present in the excessMethodology of the chosenPraadaCannedAttributionMethod
            if (this.settings.factors.indexOf(praadaFactor.value) !== -1 || (this.settings.excessFlagMap.has(praadaFactor.value) && !this.settings.excessFlagMap.get(praadaFactor.value))) {
                this.setFactorsAsExcessAndNonExcess(excessAndNonExcessFactorsList, praadaFactor, 0, factorGroupMap, CoreCommonConstants.EMPTY_STRING, false);
            } else {
                this.setFactorsAsExcessAndNonExcess(excessAndNonExcessFactorsList, praadaFactor, 0, factorGroupMap, CoreCommonConstants.EMPTY_STRING, true);
            }
        }
    }

    /**
     * Creating a tree structure in a recursive call to build excess and non excess factors
     */
    setFactorsAsExcessAndNonExcess(factorsList: AuxAdvancedTreeListInterface[], praadaFactor: PraadaFactor, index: number, factorGroupMap: Map<string, AuxAdvancedTreeListInterface>,
                                   parentPath: string, excessNonExcessFlag: boolean) {
        if (index === praadaFactor.factorGroupList.length) {
            const factor: AuxAdvancedTreeListInterface = {
                label: praadaFactor.label,
                eventData: praadaFactor.value,
                isHidden: excessNonExcessFlag,
                isDeletable: true
            };

            this.settings.excessFlagMap.set(factor.eventData, excessNonExcessFlag);

            factorsList.push(factor);
            return;
        }

        const factorGroupHeader = praadaFactor.factorGroupList[index];
        const childPath = parentPath === CoreCommonConstants.EMPTY_STRING ? parentPath.concat(factorGroupHeader) : parentPath.concat(',', factorGroupHeader);

        let factorGroup = factorGroupMap.get(childPath);
        // If factor group doesn't exist yet add it to the list
        if (!factorGroup) {
            factorGroup = {
                label: factorGroupHeader,
                eventData: factorGroupHeader,
                children: [],
                isDeletable: true,
                isExpanded: true
            };
            factorsList.push(factorGroup);

            factorGroupMap.set(childPath, factorGroup);
        }

        this.setFactorsAsExcessAndNonExcess(factorGroup.children, praadaFactor, index + 1, factorGroupMap, childPath,
            excessNonExcessFlag);
    }

    /**
     * Set excess only factors
     */
    setExcessFactors(): void {
        this.leafExcessAdvTreeListData.clear();
        this.settings.factors = [];

        this.excessAdvTreeListData = this.filterExcessNonExcessFactors(
            cloneDeep(this.advTreeListData),
            false
        );
    }

    /**
     * Set non-excess only factors
     */
    setNonExcessFactors(): void {
        this.nonExcessAdvTreeListData = this.filterExcessNonExcessFactors(
            cloneDeep(this.advTreeListData),
            true
        );
    }

    /**
     * Filter the factors to get either excess or non excess factors based on the flag passed
     * @param allFactors
     * @param excessNonExcessFlag
     * @private
     */
    private filterExcessNonExcessFactors(
        allFactors: AuxAdvancedTreeListInterface[],
        excessNonExcessFlag: boolean): AuxAdvancedTreeListInterface[] {

        return allFactors.reduce(
            (
                filteredFactors: AuxAdvancedTreeListInterface[],
                currentFactor: AuxAdvancedTreeListInterface
            ) => {
                const children = this.filterExcessNonExcessFactors(
                    currentFactor.children || [],
                    excessNonExcessFlag
                );
                if (this.settings.excessFlagMap.get(currentFactor.eventData) === excessNonExcessFlag) {
                    filteredFactors.push(currentFactor);
                    if (!excessNonExcessFlag) {
                        // Explicitly set the factor object isHidden to false
                        // so aux-advanced-tree-list shows the option
                        currentFactor.isHidden = false;
                        this.leafExcessAdvTreeListData.add(currentFactor);
                        this.settings.factors.push(currentFactor.eventData);
                    }
                } else if (children.length) {
                    filteredFactors.push(currentFactor);
                    currentFactor.children = children;
                }

                return filteredFactors;
            },
            []
        );
    }

    /**
     * return true if the factor group should not be included in the list of excess factor for the given settings.
     */
    isInNoShowList(praadaFactor: PraadaFactor) {
        if (praadaFactor.value === 'te_ms' && !(this.settings.cannedMethod === PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE || (this.settings.cannedMethod === PerformanceConstants.CANNED_METHOD.CUSTOM && this.settings.getLookThroughValue(PerformanceConstants.LOOK_THROUGH_SETTINGS.BOTTOMS_UP_WITH_LOOK_THROUGH)))) {
            return true;
        }

        // remove fx spot carry for any other canned method then Enhanced brinson
        if (praadaFactor.value === 'fx_spot_carry_contr' && this.settings.cannedMethod !== PerformanceConstants.CANNED_METHOD.EB_MULTI_ASSET_xFXMTE) {
            return true;
        }

        // add all FI factors for balanced fund attribution.
        if (this.settings.cannedMethod === PerformanceConstants.CANNED_METHOD.EQUITY_TD_xFX && praadaFactor.assetClassList.indexOf(AssetType.FI_MANDATE) !== -1) {
            return false;
        }

        // If the factor is not for this asset class skip it
        if (praadaFactor.assetClassList.indexOf(this.settings.assetType) === -1) {
            return true;
        }

        // remove manager selection factors for balanced fund.
        return this.settings.assetType === AssetType.MULTI_ASSET && this.settings.cannedMethod === PerformanceConstants.CANNED_METHOD.EQUITY_TD_xFX && (praadaFactor.value === 'mgr_selec_contr' || praadaFactor.value === 'mngr_select');
    }

    /**
     * Emit event to update the column list
     * this function is used as callback so need arrow to get the right scope
     */
    updateColumnsList = (list: AuxAdvancedTreeListInterface[]): void => {
        this.columnsUpdated.emit(list);
    }

    /**
     * Update the factors list based on the list passed. Update for both the factor and its children
     * @param list
     */
    updateFactorsList(list: string[]) {
        if (list.length) {
            if (!this.settings.getLocalExcessFlagMap()) {
                this.settings.setLocalExcessFlagMapAsParentCopy();
            }

            list.forEach(factor => this.settings.excessFlagMap.set(factor, false));

            this.setExcessFactors();
            this.setNonExcessFactors();
            this.factorsDeletedFromExcess = false;
            this.columnsUpdated.emit([...this.leafExcessAdvTreeListData]);
        }
    }

    /**
     * Delete the factor from the excess factors list
     * @param factor
     */
    deleteFactor(factor: AuxAdvancedTreeListInterface) {
        if (!this.settings.getLocalExcessFlagMap()) {
            this.settings.setLocalExcessFlagMapAsParentCopy();
        }

        this.populateExcessFlagMap(factor, true);

        this.setExcessFactors();
        this.setNonExcessFactors();

        this.factorsDeletedFromExcess = true;
        this.columnsUpdated.emit([...this.leafExcessAdvTreeListData]);
    }

    /**
     * Populate the excessFlagMap based on the factor and its children
     * @param factor
     * @param excessFlag
     * @private
     */
    private populateExcessFlagMap(factor: AuxAdvancedTreeListInterface, excessFlag: boolean) {
        // If the factor has children, recursively call this method for each child
        if (factor.children) {
            factor.children.forEach(childFactor => this.populateExcessFlagMap(childFactor, excessFlag));
        } else {
            this.settings.excessFlagMap.set(factor.eventData, excessFlag);
        }
    }
}

