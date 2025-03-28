import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {LookthroughService} from '../../services/lookthrough.service';
import {NotificationService} from '@services/notification';
import {cloneDeep, isEmpty, isEqual} from 'lodash';
import {
    ColumnSectorRule,
    CustomSectorItemComponent,
    CustomSectorType,
    GroupRule,
    SectorConstants,
    SectorRuleBuilderConfig
} from '@blk/explore-ui-breakdown';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {AppStore} from '../../../../../app.store';
import {FavoriteService} from '@services/favorite';
import {takeUntil} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';

import {
    ColumnConstants,
    ColumnDefinition,
    CommonUtils,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    SubscribableComponent,
    TokenConstants,
    TokenUtils,
    UseType
} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';
import {ExportConstants} from '../../../../../constants';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {Widget} from '@models/widget/widget.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {AuxInlineMenuInterface} from '@blk/aladdin-angular-components';
import {ExportService} from '@services/export/export.service';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExploreResponse} from '@interfaces/response.interface';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {LookthroughTableWrapperComponent} from './lookthrough-table-wrapper.component';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import moment from 'moment/moment';
import {SaveFavoriteVersionDetailsAndSummary} from '@models/favorite-version/favorite-version-log.interface';

/**
 * Component class for look-through Rule Builder Modal
 */
@Component({
    selector: 'app-lookthrough-rule-builder-modal',
    templateUrl: './lookthrough-rule-builder-modal.component.html',
    styleUrls: ['./lookthrough-rule-builder-modal.component.scss']
})
export class LookthroughRuleBuilderModalComponent extends SubscribableComponent implements OnInit {

    @Input() showRuleBuilder: boolean;
    @Input() portfolio: Portfolio;
    @Input() setLookthroughViewFlags: (refreshInProgress?: boolean, showLookthroughView?: boolean, refreshLookthroughData?: boolean, enabledElements?: boolean) => void;
    @Input() extractLookthroughInfo: () => void;
    @Input() ltFilterRulesFav: LookthroughfilterRulesFav; // tells whether look-through rules are saved favorites or not

    // New Input fields
    @Input() widget: Widget;
    @Input() widgetPayload: WidgetPayload;

    // New functions
    @Input() onExportItemClicked: (exportType: string) => void;

    isAddConditionEnabled = true;

    isTableSearchActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // currently selected filter from the filter list
    selectedFilterRule: LookthroughFilterRule;
    // To hold the initial state for filter rule
    ltFilterRulesInit: LookthroughFilterRule[];
    refreshInProgress = false;
    showLookthroughView = false;
    refreshLookthroughData = true;
    enabledElements = true;

    displayDataForLtTypes: ExploreSelectOptionGroup[];
    sectorRuleBuilderConfig: SectorRuleBuilderConfig;
    editableRuleConfig: ColumnDefinition[];
    exportOptions: AuxInlineMenuInterface[][] = [[ExportConstants.EXPORT_OPTION_EXCEL]];
    downloadInProgress = false;
    exportingInProgress = false;
    isSaveSummaryOpen = false;
    // variables for adding save summary to enterprise favorites
    saveSummary: SaveFavoriteVersionDetailsAndSummary = {changeSummary: undefined, changeSummaryDetails: undefined};

    /**
     * Event emitter to send back updated column measures to parent
     */
    @Output() rulebuilderClosed = new EventEmitter<boolean>();

    @ViewChild('exploreTableWrapper', {static: false}) exploreTableWrapper: LookthroughTableWrapperComponent;
    @ViewChild('customSectorItem', {static: false}) customSectorItem: CustomSectorItemComponent;
    activeCustomSectorItem: CustomSectorItemComponent;


    readonly LT_WITH_SMALL_L = LookthroughConstants.LOOK_THROUGH_CONST.LT_WITH_SMALL_L;
    readonly LT_REFRESH_MSG = LookthroughConstants.LT_REFRESH_MSG;
    readonly LT_REFRESH_PUSH = LookthroughConstants.LT_REFRESH_PUSH;
    readonly LT_REFRESH_TYPE = LookthroughConstants.LT_REFRESH_TYPE;
    readonly LT_REFRESH_POLITENESS = LookthroughConstants.LT_REFRESH_POLITENESS;
    favType: string;
    constructor(private lookthroughService: LookthroughService,
                private notificationService: NotificationService,
                private appStore: AppStore,
                private favoriteService: FavoriteService,
                private changeDetectorRef: ChangeDetectorRef,
                private exportService: ExportService) {
        super();
    }

    /**
     * Init lifecycle hook
     */
    ngOnInit() {
        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
                this.exportingInProgress = ExportUtils.isExportDownloadingStatusValid(downloadStatus) && downloadStatus.exportComposite.widget && this.widget.id === downloadStatus.exportComposite.widget.id;
            });
        this.extractLookthroughInfo();
        if (this.portfolio.lookthroughSettings.ltFilterRulesFav && !isEmpty(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules)) {
            // saving the initial state of LT container rule
            this.ltFilterRulesInit = cloneDeep(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules);
            // assigning first filter element from the list to selectedFilter
            this.selectedFilterRule = this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0];
        } else {
            this.addNewLogicRule();
        }

        this.sectorRuleBuilderConfig = new SectorRuleBuilderConfig(
            LibColumnUtils.makeColumnTree(this.getColumnsFilter(), ''), null, true, false);
        this.sectorRuleBuilderConfig.updateLookThroughView = () => this.onRuleChange();

        this.editableRuleConfig = LibColumnUtils.getFilteredList(this.getColumnsFilter());
        this.favType = CommonUtils.getInSentenceCase(FavoriteConstants.LT_LOGIC_RULES);
        this.initializeLtTypes();

    }

    /**
     * Initialize the displayDataForLtTypes
     */
    private initializeLtTypes(): void {
        this.displayDataForLtTypes = [new ExploreSelectOptionGroup()];
        this.displayDataForLtTypes[0].values = [new ExploreSelectOption('Full', 'Full'),
            new ExploreSelectOption('Sector', 'Sector'),
            new ExploreSelectOption('None', 'None')];
        this.initializeDefaultLtType();
    }

    /**
     * Initialize the default LtType
     */
    private initializeDefaultLtType(): void {
        if (this.selectedFilterRule) {
            this.displayDataForLtTypes[0].values.find(value => value.displayValue === this.selectedFilterRule.ltType).isSelected = true;
        } else {
            this.displayDataForLtTypes[0].values[0].isSelected = true;
        }
    }

    /**
     * Returns filter to select the columns to be used.
     */
    private getColumnsFilter(): ColumnFilter[] {
        return [{key: 'columnTag', type: '=', value: [ColumnConstants.PORTFOLIO_NAME, ColumnConstants.SEC_GROUP, ColumnConstants.SEC_TYPE, ColumnConstants.SEC_DESC, ColumnConstants.SEC_DESC2]}];
    }

    /**
     * Method to create a new filter and add it to the filter list
     */
    addNewLogicRule(event?: CustomEvent): void {
        if (!this.portfolio.lookthroughSettings.ltFilterRulesFav) {
            return;
        }

        const newRule: LookthroughFilterRule = new LookthroughFilterRule();
        if (!this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules) {
            this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>(newRule);
        } else {
            this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(newRule);
        }
        this.selectedFilterRule = newRule;
        if (event) {
            event.preventDefault();
        }
    }

    /**
     * Method to clear out the filter rule (simple OR complex)
     * ONLY IF....the rule is not empty
     */
    clearFilter(): void {
        if (!this.portfolio.lookthroughSettings.ltFilterRulesFav) {
            return;
        }

        if (!this.selectedFilterRule || (this.selectedFilterRule.isEmpty() && this.selectedFilterRule.ltType === LookthroughConstants.LT_TYPE_FULL)) {
            return;
        }

        const indexToClearAt: number = this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.findIndex(ltFilterRule => ltFilterRule === this.selectedFilterRule);
        if (indexToClearAt !== -1) {
            if (this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[indexToClearAt].enabled) {
                this.setLookthroughViewFlags(false, false, true, false);
            }
            this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[indexToClearAt].customSector.rule = new ColumnSectorRule();
            this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[indexToClearAt].ltType = LookthroughConstants.LT_TYPE_FULL;
        }
    }

    /**
     * Method to clear filter list completely
     */
    clearFilterList(): void {
        if (!this.portfolio.lookthroughSettings.ltFilterRulesFav || isEmpty(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules)) {
            return;
        }

        if (this.portfolio.lookthroughSettings.containsRules() && this.portfolio.lookthroughSettings.hasEnabledRules()) {
            this.setLookthroughViewFlags(false, false, true, false);
        }
        this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length = 0;
    }

    /**
     * Method to remove a rule from the rule list
     */
    removeFilterFromList(lookthroughFilterRule: LookthroughFilterRule): void {
        if (!lookthroughFilterRule || !this.portfolio.lookthroughSettings.ltFilterRulesFav || isEmpty(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules)) {
            return;
        }

        this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.splice(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.indexOf(lookthroughFilterRule), 1);
        if (lookthroughFilterRule.enabled) {
            this.setLookthroughViewFlags(false, false, true, false);
        }
    }

    /**
     * Method to update the reference of selected filter rule
     */
    updateSelectedFilterRule(lookthroughFilterRule: LookthroughFilterRule): void {
        this.selectedFilterRule = lookthroughFilterRule;
        this.initializeLtTypes();
    }

    /**
     * Method to update Lookthrough view on rule change
     */
    onRuleChange(): void {
        if (this.selectedFilterRule.enabled) {
            this.setLookthroughViewFlags(false, false, true, false);
        }
    }

    /**
     * Method to update the displayName of selected filter rule
     */
    onRuleNameChange(ruleName: string): void {
        this.selectedFilterRule.displayName = ruleName;
    }

    /**
     * Method called when ltType is changed
     */
    changeLtType(ltType: string): void {
        this.selectedFilterRule.ltType = ltType;
        this.onRuleChange();
    }

    /**
     * Method called when 'Save to my Rules' button is clicked
     */
    onSaveToMyRulesClick(): void {
        const serializedLtRules = [];
        this.portfolio.lookthroughSettings.serializeLtFilterRules(serializedLtRules);
        // Save favorite dialog
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                new LookthroughfilterRulesFav(serializedLtRules),
                FavoriteConstants.LT_LOGIC_RULES,
                FavoriteConstants.LT_FILTER_RULES,
                FavoriteConstants.LT_RULES_FOLDER
            ));
        // TODO: Get saved favorite and display name in dialog
    }

    /**
     * Handle when the user clicks the Done (Apply) button
     */
    onDoneClick(): void {
        if (this.portfolio.lookthroughSettings.ltFilterRulesFav.id) {
            if (!isEqual(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules, this.ltFilterRulesInit)) {
                // check if token is enabled, its an admin user, summary to be entered and version number is not 1.
                if (this.portfolio.lookthroughSettings.ltFilterRulesFav.owner === CoreFavoriteConstants.ADMIN
                    && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
                    && !this.saveSummary?.changeSummary) {
                    this.isSaveSummaryOpen = true;
                    return;
                }
                this.saveLtRuleFav();
            } else {
                this.closeRuleBuilderModal(false);
            }
        } else {
            this.closeRuleBuilderModal(!isEqual(this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules, this.ltFilterRulesInit));
        }
    }

    private saveLtRuleFav() {
        const favToSave = this.portfolio.lookthroughSettings.ltFilterRulesFav;
        favToSave.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
        favToSave.dateLastUpdated = moment.tz(moment.tz.guess()).format('MM/DD/YYYY HH:mm zz');
        favToSave.changeSummary = this.saveSummary?.changeSummary;
        favToSave.changeSummaryDetail = this.saveSummary?.changeSummaryDetails;
        this.saveSummary.changeSummary = this.saveSummary.changeSummaryDetails = undefined;
        // Save over the existing breakdown favorite
        this.favoriteService.quickSaveFavorite$(favToSave, favToSave.createFavorite(FavoriteConstants.LT_FILTER_RULES), favToSave.owner)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (updated: boolean) => {
                    if (updated) {
                        this.closeRuleBuilderModal(true);
                    }
                }
            );
    }

    /**
     * Handle when the user clicks the Cancel button
     */
    onCancel(): void {
        this.portfolio.lookthroughSettings.ltFilterRulesFav = this.ltFilterRulesFav;
        this.closeRuleBuilderModal(false);
    }

    /**
     * Called upon close of modal
     */
    private closeRuleBuilderModal(hasRuleLogicChanged: boolean): void {
        this.rulebuilderClosed.emit(hasRuleLogicChanged);
    }

    /**
     * Show/Remove Table search panel
     */
    toggleTableSearch() {
        this.isTableSearchActive$.next(!this.isTableSearchActive$.value);
    }

    /**
     * Updates Exporting Status
     */
    updateExportingStatus(downloadCompleted: boolean, exportComposite?: ExportComposite): void {
        this.downloadInProgress = !downloadCompleted;
        this.appStore.updateExportDownloadingStatus(this.downloadInProgress, exportComposite);
    }

    /**
     * Updates Add Condition Button
     */
   enableAddCondition(state: boolean): void {
       this.isAddConditionEnabled = state;
   }

    addConditionClicked() {
        const cellRanges = this.exploreTableWrapper.exploreTable.gridApiHandle.getCellRanges();
        const selectedCells = [];
        for (const cell of cellRanges) {
            const row = this.exploreTableWrapper.exploreTable.gridApiHandle.getDisplayedRowAtIndex(cell.startRow.rowIndex);
            let tag;
            let value;
            // if tag is type we ignore
            if (cell.startColumn.getColId() === 'underl_sec_type_1') {
                continue;
            } else if (cell.startColumn.getColId() === 'ag-Grid-AutoColumn' || cell.startColumn.getColId() === 'issuer_name_1') {
                // there is no colId for the portfolio ticker column and the colId for full name doesn't match how rules are made so also had to be changed
                // if there is a selected cell with portfolio name already then don't add it (user could've selected both ticker name and full portfolio name of same portfolio)
                tag = 'portfolio_name';
                // get ticker value if column is full portfolio name or ticker name
                value = this.exploreTableWrapper.exploreTable.gridApiHandle.getValue('port_full_name_1', row);
            } else {
                tag = cell.startColumn.getColId().slice(0, -2);
                const col = cell.startColumn;
                value = this.exploreTableWrapper.exploreTable.gridApiHandle.getValue(col, row);

            }
            // also check for when it is a header , the bold one
            selectedCells.push({
                value,
                tag,
            });
        }
        if (selectedCells.length > 0) {
            this.createRules(selectedCells);
        }
    }
    createRules(ruleList: {tag: string, value: string}[]) {

        this.customSectorItem.customSectorEventsServiceSubscribe = this.customSectorItem.customSectorEventsService.getActiveCustomSectorItem$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (customSectorItemComponent: CustomSectorItemComponent) => {
                    this.activeCustomSectorItem = customSectorItemComponent;
                }
            );
        let singleRule;
        const groupRule = new GroupRule();
        groupRule.groupType = SectorConstants.GROUP_RULE_CONDITION.AND;
        for (let i = 0; i < ruleList.length; i++) {
            const newRule = new ColumnSectorRule();
            newRule.columnTag = ruleList[i].tag;
            newRule.columnName = this.getColumnName(ruleList[i].tag);
            newRule.comparisonType = SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue;

            newRule.comparisonValues = [ruleList[i].value];
            newRule.customSectorType = CustomSectorType.ATTRIBUTES;

            newRule.dataType = ColumnConstants.COLUMN_DATA_TYPE.STRING;

            newRule.includeNullValues = false;
            newRule.positionColumnType = UseType.ALL;

            if (ruleList.length > 1 ) {
                groupRule.addSubRule(newRule);
            } else {
                singleRule = newRule;
            }
        }
        const ruletoAdd = singleRule ? singleRule : groupRule;
        // when there is 0
        if (this.customSectorItem.isColumnRule && (this.customSectorItem.rule as ColumnSectorRule).columnName === undefined) {
            this.customSectorItem.addFirstRuleFromLT(ruletoAdd);
        } else if (this.customSectorItem === this.activeCustomSectorItem) {
            this.customSectorItem.addRule(ruletoAdd);
        } else {
            if (this.activeCustomSectorItem.parent instanceof GroupRule) {
                const index: number = this.activeCustomSectorItem.parent.subRules.indexOf(this.activeCustomSectorItem.rule);
                // nothing selected so add to outermost
                if (index < 0) {
                    this.customSectorItem.addRule(ruletoAdd);
                } else {
                    this.activeCustomSectorItem.addRule(ruletoAdd);
                }
            }
        }
        this.sectorRuleBuilderConfig.updateLookThroughView();
    }
    getColumnName(tag: string): string {
        const colTagToColName: {[key: string]: string} = { 'portfolio_name': 'Portfolio Name', 'sec_desc': 'Description', 'sec_desc2': 'Additional Info', 'sec_type': 'Security Type', 'sec_group': 'Security Group'};
        return colTagToColName[tag];
    }

    closeSaveSummaryDialog(continueSaving: boolean): void {
        this.isSaveSummaryOpen = false;
        // Explicitly check that continueSaving is the emitted boolean, so it doesn't get triggered from another event
        if (continueSaving === true) {
            this.saveLtRuleFav();
        }
    }

    /**
     * Populate response data
     */
    populateResponseData(payload: ExploreResponse): void {
        this.widgetPayload.cube = new TreeCube(this.portfolio.portName, this.lookthroughService.getVisColsConfig(), payload.data);
        this.widgetPayload.responseConfig.columns = payload.data.columns;
    }
}
