import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxSelectOption, AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface, AuxTypeAheadPillboxChangedDetailInterface, AuxTypeAheadSuggestionGroup} from '@blk/aladdin-angular-components';
import {takeUntil} from 'rxjs/operators';
import {FavoriteConstants} from '@constants/favorite.constants';
import {MandateMappingService, NotificationService} from '../../shared/services';
import {MandateStore} from '../../stores';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {
    ColumnConstants,
    CoreDefinitionStore,
    CoreFavoriteUtils,
    ErrorTypeConstants,
    FavoriteType,
    SubscribableComponent, UIErrorParameters
} from '@blk/explore-ui-core';
import {BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';

/**
 * Mandate Settings Modal Component (Admin Screen)
 *
 * @example
 *  <ng-container *ngIf="isMandateSettingsModalOpen">
 *      <app-mandate-settings-modal [isOpen]="isMandateSettingsModalOpen"
 *                                  (modalClosed)="closeMandateSettingsModal()">
 *      </app-mandate-settings-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-mandate-settings-modal',
    templateUrl: './mandate-settings-modal.component.html',
    styleUrls: ['./mandate-settings-modal.component.scss']
})
export class MandateSettingsModalComponent extends SubscribableComponent implements OnInit {
    readonly CURATED_REPORTS = FavoriteType.CURATED_REPORTS;
    tableHeaders: string[];

    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Input() isOpen: boolean;


    // matrix of MandateSettingsCellItem holding the values of mandateSettingsList in MandateStore in different format to control the mandateSettings values
    mandateSettingsUIMatrix: MandateSettingsCellItem[][];

    // holds ALL mandate settings options list
    mandateSettingsSelectOptionsList: Array<AuxSelectOptionGroup[]|AuxTypeAheadSuggestionGroup[]>;

    mandateMap = new Map();

    /**
     * constructor
     */
    constructor(private mandateMappingService: MandateMappingService, private notificationService: NotificationService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // generate all select options and the titles in the table
        this.generateAllMandateSettingsSelectOptions();

        // generate the settings list
        this.generateMandateSettingsUIMatrixFromStore();
    }

    /**
     * Close modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }

    /**
     * Add mandate settings items row
     */
    addMandateSettingsItemsRow(): void {
        this.mandateSettingsUIMatrix.push([
            new MandateSettingsCellItem(FavoriteType.MANDATE, null),
            new MandateSettingsCellItem(FavoriteType.ATTRIBUTION_TYPE, null),
            new MandateSettingsCellItem(FavoriteType.BREAKDOWN, null),
            new MandateSettingsCellItem(FavoriteType.PERFORMANCE_BREAKDOWN, null),
            new MandateSettingsCellItem(FavoriteType.FACTOR_BREAKDOWN, null),
            new MandateSettingsCellItem(FavoriteType.CURATED_REPORTS, []),
            new MandateSettingsCellItem(FavoriteType.SINGLE_REPORT, null)
        ]);
    }

    /**
     * Remove selected mandate settings items row
     */
    removeMandateSettingsItemsRow(index: number): void {
        if (index !== -1) {
            this.mandateSettingsUIMatrix.splice(index, 1);
        }
    }

    /**
     * Save mandate settings List
     */
    saveMandateSettingsList(): void {
        const mandateSettingsMatrixToSave = this.createMandateSettingsListToSave();
        this.mandateMappingService.saveMandateSettings$(mandateSettingsMatrixToSave)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                console.log('Mandate Mapping Saved');
                this.notificationService.success('Mandate Mapping Saved');
                this.closeModal();
            }, error => {
                console.error('Failed to save Mandate Mapping', error);
                this.notificationService.error('Failed to save Mandate Mapping ' + error, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_MANDATE_SETTINGS_ERROR);
            });
    }

    /**
     * On Pillbox Changed
     */
    onTypeaheadPillboxChanged(event: CustomEvent<AuxTypeAheadPillboxChangedDetailInterface>, index: number): void {
        const curatedReportPillboxes = this.mandateSettingsUIMatrix[index][5].value as Array<{displayValue: string, eventData?: string}>;

        if (event.detail.type === 'remove') {
            const duplicatedItemIndex = curatedReportPillboxes.findIndex((item: {displayValue: string, eventData: string}) => {
                return item.eventData === event.detail.pill.eventData;
            });
            curatedReportPillboxes.splice(duplicatedItemIndex, 1);

        } else if (event.detail.type === 'add') {
            // hasUniquePills prop controls not to add duplicate item
            const typeahead = event.target as any;
            // updating typeahead.pillbox manually with event.preventDefault() to fix pillbox getting added twice on the first add.
            event.preventDefault();
            typeahead.pillbox = [...typeahead.pillbox, event.detail.pill];
            curatedReportPillboxes.push(event.detail.pill);
        }
    }

    /**
     * Update MandateSettings on Selection Option Changed
     */
    onSelectOptionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>, indexI: number, indexJ: number): void {
        if ((indexI !== -1 || indexJ !== -1) && event.detail) {
            this.mandateSettingsUIMatrix[indexI][indexJ].value = event.detail.value ? (event.detail.value as AuxSelectOption).value : undefined;
        }
    }

    /**
     * Create mandateSettingsList: MandateSettings[] from this.mandateSettingsUIMatrix: MandateSettingsCellItem[][] to save
     */
    private createMandateSettingsListToSave(): MandateSettings[] {
        const mandateSettingsListToSave = [];
        for (const mandateSettingsItemsRow of this.mandateSettingsUIMatrix) {
            // relying on the order rather then finding the element each time because the order should never change
            const mandateSettings = new MandateSettings();
            mandateSettings.mandate = mandateSettingsItemsRow[0].value as string;
            mandateSettings.settings.set(FavoriteType.ATTRIBUTION_TYPE, mandateSettingsItemsRow[1].value as string);
            mandateSettings.settings.set(FavoriteType.BREAKDOWN, mandateSettingsItemsRow[2].value as string);
            mandateSettings.settings.set(FavoriteType.PERFORMANCE_BREAKDOWN, mandateSettingsItemsRow[3].value as string);
            mandateSettings.settings.set(FavoriteType.FACTOR_BREAKDOWN, mandateSettingsItemsRow[4].value as string);
            mandateSettings.settings.set(FavoriteType.SINGLE_REPORT, mandateSettingsItemsRow[6].value as string);

            const curatedReports = [];
            for (const curatedReportsPillbox of mandateSettingsItemsRow[5].value as Array<{displayValue: string, eventData: string}>) {
                curatedReports.push(curatedReportsPillbox.eventData);
            }
            mandateSettings.settings.set(FavoriteType.CURATED_REPORTS, curatedReports);

            mandateSettingsListToSave.push(mandateSettings);
        }
        return mandateSettingsListToSave;
    }

    /**
     * Generate mandateSettingsUIMatrix from mandateSettingsList in MandateStore to control values in the component
     */
    private generateMandateSettingsUIMatrixFromStore(): void {
        this.mandateSettingsUIMatrix = [];

        for (const mandateSettings of MandateStore.mandateSettingsList) {
            const curatedReportPillBoxes = [];
            for (const reportData of mandateSettings.settings.get(FavoriteType.CURATED_REPORTS)) {
                for (const reportFavorite of MandateStore.mandateTypeFavorites.get(FavoriteConstants.WIDGETS_REPORT)) {
                    if (reportData.split(';')[1] === reportFavorite.id.toString()) {
                        curatedReportPillBoxes.push({
                            displayValue: reportFavorite.title,
                            eventData: CoreFavoriteUtils.isGlobalFavorite(reportFavorite.owner).toString() + ';' + reportFavorite.id
                        });
                        break;
                    }
                }
            }

            const mandateSettingsItemsRow = [
                new MandateSettingsCellItem(FavoriteType.MANDATE, mandateSettings.mandate),
                new MandateSettingsCellItem(FavoriteType.ATTRIBUTION_TYPE, mandateSettings.settings.get(FavoriteType.ATTRIBUTION_TYPE) as string),
                new MandateSettingsCellItem(FavoriteType.BREAKDOWN, mandateSettings.settings.get(FavoriteType.BREAKDOWN) as string),
                new MandateSettingsCellItem(FavoriteType.PERFORMANCE_BREAKDOWN, mandateSettings.settings.get(FavoriteType.PERFORMANCE_BREAKDOWN) as string),
                new MandateSettingsCellItem(FavoriteType.FACTOR_BREAKDOWN, mandateSettings.settings.get(FavoriteType.FACTOR_BREAKDOWN) as string),
                new MandateSettingsCellItem(FavoriteType.CURATED_REPORTS, curatedReportPillBoxes),
                new MandateSettingsCellItem(FavoriteType.SINGLE_REPORT, mandateSettings.settings.get(FavoriteType.SINGLE_REPORT) as string),
            ];

            this.mandateSettingsUIMatrix.push(mandateSettingsItemsRow);
        }
    }

    /**
     * Generate all select options: relying on order
     */
    private generateAllMandateSettingsSelectOptions(): void {
        this.tableHeaders = [
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.MANDATE,
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.ATTRIBUTION_SETTING,
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.BREAKDOWN,
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.PERF_BKD,
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.FAC_BKD,
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.WIDGETS_REPORT,
            ColumnConstants.MANDATE_MAP_ATTRIBUTES.COLUMN_SET,
            null
        ];

        this.mandateSettingsSelectOptionsList = [
            // aux-select options with multiple groups for Mandate
            MandateStore.auxMandateOptions,
            this.createAuxAttributionOptions(),
            // aux-select options with no group for all other columns for Sector Breakdown
            this.createAuxFavoriteOptions(BreakdownFavoriteConstants.BREAKDOWN),
            // aux-select options with no group for all other columns for Performance Breakdown
            this.createAuxFavoriteOptions(FavoriteConstants.PERFORMANCE_BREAKDOWN),
            // aux-select options with no group for all other columns for Factor Breakdown
            this.createAuxFavoriteOptions(BreakdownFavoriteConstants.FACTOR_BREAKDOWN),
            // aux-type-ahead options with no group for Curated Report
            this.createAuxFavoriteOptions(FavoriteConstants.WIDGETS_REPORT) as AuxTypeAheadSuggestionGroup[],
            // aux-select options with no group for all other columns for Risk Exposure Column Set
            this.createAuxFavoriteOptions(FavoriteConstants.COLUMN_SET)
        ];
        this.mandateSettingsSelectOptionsList.forEach(option => option.forEach(item =>
            item.values.forEach(selectOption =>
                this.mandateMap.set(selectOption.value, selectOption.displayValue))));
    }

    /**
     * Get list of available attribution settings to display with aux-select
     */
    private createAuxAttributionOptions(): AuxSelectOptionGroup[] {
        const attributionOptions: AuxSelectOptionGroup[] = [{values: []}];
        for (const attributionSettings of CoreDefinitionStore.praadaCannedAttributionMethods) {
            if (attributionSettings.assetClass) {
                attributionOptions[0].values.push({
                    displayValue: attributionSettings.label,
                    value: attributionSettings.name
                });
            }
        }
        return attributionOptions;
    }

    /**
     * Get list of favorites of favType in mandateTypeFavorites to display with aux-select
     */
    private createAuxFavoriteOptions(favType: string): Array<AuxTypeAheadSuggestionGroup | AuxSelectOptionGroup> {
        const favoriteOptions: Array<AuxTypeAheadSuggestionGroup | AuxSelectOptionGroup> = [{values: []}];
        for (const favorite of MandateStore.mandateTypeFavorites.get(favType)) {
            favoriteOptions[0].values.push({displayValue: favorite.title, value: CoreFavoriteUtils.isGlobalFavorite(favorite.owner).toString() + ';' + favorite.id});
        }
        return favoriteOptions;
    }
}

/**
 * MandateSettingsItem for UI representing each cell
 * only used within the component except for the spec file
 */
export class MandateSettingsCellItem {
    key:string;
    value:string|Array<{displayValue: string, eventData: string, awId?: string}>;

    /**
     * constructor
     * @param key is FavoriteType that are matching with table headers
     * @param value is {displayValue: string, eventData: string} for curated report, and string in all other cases
     */
    constructor(key: string = null,  value: string|Array<{displayValue: string, eventData: string, awId?: string}> = null) {
      this.key=key;
      this.value=value;
    }
}
