import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isNil} from 'lodash';
import {AuxButtonSizeEnum, AuxButtonTypeEnum, AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {
    CoreFavoriteConstants, CoreFavoriteUtils,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {CustomFilter} from '../../models/filter/custom-filter.model';
import {CustomSector} from '../../models/sector/custom-sector/custom-sector.model';
import {NormalizedFlag} from '../../models/normalized-flag/normalized-flag.model';
import {SectorConstants} from '../../constants/sector.constants';
import {FilterConstants} from '../../constants/filter.constants';

/**
 * Component to create custom column filter using Column Sector Rules.
 *
 * @example
 *  <app-custom-filter *ngSwitchCase="'customFilter'"
 *                     [fieldToUse]="widgetConfigInput.valueField">
 *  </app-custom-filter>
 */
@Component({
    selector: 'explore-custom-filter',
    templateUrl: './explore-custom-filter.component.html',
    styleUrls: ['./explore-custom-filter.component.scss']
})
export class ExploreCustomFilterComponent extends SubscribableComponent implements OnInit {
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    coreFavoriteUtils = CoreFavoriteUtils;
    @Output() updateApplyFilter = new EventEmitter();
    @Output() updateNormalizedFlag: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() saveFilterClicked = new EventEmitter();
    @Output() loadFilterClicked = new EventEmitter();
    @Output() isApplyFilterToNewWidgetsCheckedChange = new EventEmitter<boolean>();

    @Input() requireLoadAndSaveOptions: boolean;
    @Input() filter: CustomFilter;
    @Input() isNormalized: NormalizedFlag;
    @Input() fieldToUse: string;
    @Input() showApplyTo: boolean;
    @Input() applyFilterTo: string;
    @Input() disableNormalizedCheckbox: boolean;
    @Input() sectorRuleBuilderConfig: SectorRuleBuilderConfig;
    @Input() showApplyToNewWidgets: boolean;
    @Input() isApplyFilterToNewWidgetsChecked: boolean;
    @Input() loadCustomSector: Function;
    @Input() favoriteType: string;

    applyToData: AuxSelectOptionGroup[] = [];

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        if (!this.filter.customSector) {
            this.clearFilter();
        }
        if (isNil(this.isNormalized)) {
            this.isNormalized = new NormalizedFlag(this.disableNormalizedCheckbox);
        }
        this.applyToData = [new ExploreSelectOptionGroup(FilterConstants.FILTER_TARGET_TYPES.map(data => new ExploreSelectOption(data.display, data.value, data.value === this.applyFilterTo)))];
    }

    /**
     * Clear filter and new filter can be added
     */
    clearFilter() {
        const customSector: CustomSector = new CustomSector();
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        customSector.title = SectorConstants.DEFAULT_CUSTOM_SECTOR_TITLE;
        customSector.rule = columnRule;
        this.filter.customSector = customSector;
    }

    /**
     * Update Normalized Checkbox
     */
    updateNormalizedCheckbox(value: boolean) {
        this.isNormalized.data = value;
        this.updateNormalizedFlag.emit(value);
    }

    /**
     * Update filter drop down selection
     * We've three options [Both, Portfolio, Benchmark
     */
    updateFilterSelection(appliedFilter: ExploreSelectOption) {
        this.applyFilterTo = appliedFilter.value;
        this.updateApplyFilter.emit(appliedFilter.value);
    }
}
