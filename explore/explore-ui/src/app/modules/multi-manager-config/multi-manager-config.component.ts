import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {
    AlertConstants,
    CoreDefinitionStore,
    ExploreDialogParam,
    ExploreRadioButton,
    ExploreSelectOption,
    SubscribableComponent, TokenConstants, TokenUtils,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {
    AuxRadioGroupChangedDetailInterface,
    AuxRadioInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {DecisionLevelConfig} from '@models/portfolio/decisionLevels/decision-level-config.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {AppUtils} from '@utils/app.utils';
import {DecisionBenchmarkService} from '@services/widget/decision-benchmark-service';
import {filter, takeUntil} from 'rxjs/operators';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {isEmpty, isNil} from 'lodash';
import {DefinitionsStore} from '@stores/definitions.store';
import {AppStore} from '../../app.store';
import {CommonConstants} from '@constants/common.constants';
import {FilterIncludeKey, QueryKey} from '@qbstr/data-cube';
import {ROOT_LEVEL} from '@utils/qbstr';
import {NotificationService} from '@services/notification';
import {TopdownColOptionPropOp} from '@enums/topdown-col-option-prop-op.enum';
import {BehaviorSubject} from 'rxjs';
import {MultiManagerConstants} from '@constants/multi-manager.constants';

@Component({
    selector: 'app-multi-manager-config',
    templateUrl: './multi-manager-config.component.html',
    styleUrls: ['./multi-manager-config.component.scss']
})
export class MultiManagerConfigComponent extends SubscribableComponent implements OnInit {

    protected readonly DECISION_LEVEL_CAP: number = 3;
    // we only want to expose portfolio attributes arrange by when RnE supports MM (it does nto as of now)
    protected readonly isArrangeByPortAttributesEnabled = TokenUtils.isValueDelimitedFeatureEnabled(
        TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER_UI,
        CommonConstants.COLUMN_KEY_SPLITTER,
        MultiManagerConstants.WIDGET_TYPE_TO_TOKEN_VAL_MAP.get(WidgetConfigType.RISK_EXPOSURE)
    );

    protected arrangeByOptions: AuxRadioInterface[] = [];
    protected portTreeDecisionLevelOptions: AuxRadioInterface[] = [];
    protected topDownColOptionsMap: AuxSelectOptionGroup[][] = [[], [], []];
    protected selectedTopdownColOptions: AuxSelectOption[] = [];
    protected widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
    protected _refreshInProgress = false;
    protected widgetPayload: WidgetPayload;
    // is true if no columns are selected in topdown arrange by
    protected noColSelectedInTopdownArrangeBy = false;
    protected isDecisionLevelDisabled = false;
    protected loadingLabel = CommonConstants.EMPTY_STRING;
    // controls in the info notification to refresh the view
    protected refreshRequired = false;
    // controls the switching between Portfolio tree and Portfolio attributes
    protected selectedArrangeByOption: string;
    protected promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);

    @Input() decisionLevelsConfig: DecisionLevelConfig;
    @Input() portfolio: Portfolio;

    constructor(private decisionBenchmarkService: DecisionBenchmarkService, private cdRef: ChangeDetectorRef, private appStore: AppStore, private notificationService: NotificationService) {
        super();
    }

    get refreshInProgress(): boolean {
        return this._refreshInProgress;
    }

    set refreshInProgress(value: boolean) {
        if (value) {
            this.loadingLabel = this.getLoadingLabel();
        }
        this._refreshInProgress = value;
        this.updateRadioButtonsDisabledState();
    }


    ngOnInit(): void {
        // initialize arrange by radio buttons
        this.initializeArrayByOptions();

        // initialize portfolio tree decision level radio buttons
        this.initializePortTreeArrangeBy();

        // initialize top-down column select options
        this.initializeTopdownArrangeBy();

        this.widget.dataStore.getData$()
            .pipe(takeUntil(this.ngUnsubscribe), filter((payload) => !isNil(payload)))
            .subscribe({
                next: payload => {
                    this.widgetPayload = payload;
                    if (!!this.widgetPayload?.notification && !!this.widgetPayload.notification?.message?.length) {
                        this.notificationService.error(this.widgetPayload.notification.message, this.widgetPayload.notification.notificationStyle, null, true);
                        // If we get an error, we want to clear the widget payload, and not show the explore-table
                        this.widgetPayload = null;
                    }
                    this.portfolio.decisionLevelsConfig.allSectorPaths = this.widgetPayload?.widgetSpecificData?.allSectorPaths;
                    this.refreshInProgress = false;
                    this.cdRef.markForCheck();
                },
                error: () => {
                    this.refreshInProgress = false;
                    this.cdRef.markForCheck();
                },
                complete: () => console.log('Exiting decision benchmark screen')
            });

        // we want to load the decision bench view for the first time
        this.sendRequestForPortTree(this.widget);

        this.appStore.decisionLevelChangeInfo$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                decisionLevelChangeInfo => {
                    if (isEmpty(decisionLevelChangeInfo)) {
                        return;
                    }

                    decisionLevelChangeInfo.forEach(decisionLevelChange =>
                        this.decisionLevelsConfig.decisionBenchMap.set(decisionLevelChange.decisionPath, decisionLevelChange.decisionBench)
                    );
                }
            );
    }

    private initializeArrayByOptions(): void {
        // initialize arrange by radio buttons
        this.arrangeByOptions.push(new ExploreRadioButton(DecisionLevelConfig.PORT_TREE_CAPTION, this.decisionLevelsConfig.arrangeByOption === DecisionLevelConfig.PORT_TREE_CAPTION, false));
        this.arrangeByOptions.push(new ExploreRadioButton(DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION, this.decisionLevelsConfig.arrangeByOption === DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION, false));
        this.selectedArrangeByOption = this.decisionLevelsConfig.arrangeByOption;
    }

    private initializeTopdownArrangeBy(): void {
        // initialize top-down column select options
        const topdownColDefs = DefinitionsStore.topDownEligibleCols
            .map(topDownCol => CoreDefinitionStore.columnTagColumnsPairs.get(topDownCol)[0])
            .filter(topDownColDef => topDownColDef.columnTag !== 'portfolio_tree');

        // ** START ** Initialize the top-down column select options for each decision level
        this.topDownColOptionsMap[0].push({
            values: topdownColDefs.map(topDownColDef => new ExploreSelectOption(
                topDownColDef.title,
                topDownColDef.columnTag,
                false,
                [this.decisionLevelsConfig.topDownCols[1], this.decisionLevelsConfig.topDownCols[2]].includes(topDownColDef.columnTag)
            ))
        });
        this.topDownColOptionsMap[1].push({
            values: topdownColDefs.map(topDownColDef => new ExploreSelectOption(
                topDownColDef.title,
                topDownColDef.columnTag,
                false,
                [this.decisionLevelsConfig.topDownCols[0], this.decisionLevelsConfig.topDownCols[2]].includes(topDownColDef.columnTag)
            ))
        });
        this.topDownColOptionsMap[2].push({
            values: topdownColDefs.map(topDownColDef => new ExploreSelectOption(
                topDownColDef.title,
                topDownColDef.columnTag,
                false,
                [this.decisionLevelsConfig.topDownCols[0], this.decisionLevelsConfig.topDownCols[1]].includes(topDownColDef.columnTag)
            ))
        });

        // Initialize the selected top-down column options
        this.selectedTopdownColOptions[0] = this.topDownColOptionsMap[0][0].values.find(option => option.value === this.decisionLevelsConfig.topDownCols[0]);
        this.selectedTopdownColOptions[1] = this.topDownColOptionsMap[1][0].values.find(option => option.value === this.decisionLevelsConfig.topDownCols[1]);
        this.selectedTopdownColOptions[2] = this.topDownColOptionsMap[2][0].values.find(option => option.value === this.decisionLevelsConfig.topDownCols[2]);
        // ** END ** Initialize the top-down column select options for each decision level
    }

    private initializePortTreeArrangeBy(): void {
        // initialize portfolio tree decision level radio buttons
        if (!this.decisionLevelsConfig.portTreeDecisionLevelOption) {
            // 1 is the default level when the component is initialized and arranged by port tree
            this.decisionLevelsConfig.portTreeDecisionLevelOption = 1;
        }
        this.portTreeDecisionLevelOptions.push(new ExploreRadioButton('1 level', this.decisionLevelsConfig.portTreeDecisionLevelOption === 1, false, 1));
        this.portTreeDecisionLevelOptions.push(new ExploreRadioButton('2 levels', this.decisionLevelsConfig.portTreeDecisionLevelOption === 2, false, 2));
        this.portTreeDecisionLevelOptions.push(new ExploreRadioButton('3 levels', this.decisionLevelsConfig.portTreeDecisionLevelOption === 3, false, 3));
    }

    protected updateRadioButtonsDisabledState(): void {
        this.arrangeByOptions = this.arrangeByOptions.map(option => ({...option, disabled: this.refreshInProgress}));
        this.portTreeDecisionLevelOptions = this.portTreeDecisionLevelOptions.map(option => ({
            ...option,
            disabled: this.refreshInProgress
        }));
        this.isDecisionLevelDisabled = this.refreshInProgress;
    }

    protected clearAll() {
        this.decisionLevelsConfig.decisionBenchMap.clear();

        this.widgetPayload.cube.delete(new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, [this.widgetPayload.cube['port']])
        ]));

        // To trigger Angular change detection mechanism
        this.widgetPayload = {...this.widgetPayload};

    }

    protected sendRequestForPortTree(widget: Widget, event?: MouseEvent): void {
        this.refreshInProgress = true;
        this.refreshRequired = false;
        try {
            this.decisionBenchmarkService.extractDataAndStore({
                widget,
                portfolio: this.portfolio,
                report: new Report(),
                hardRefresh: AppUtils.isCtrlPressed(event)
            });
        } catch (error) {
            this.refreshInProgress = false;
            this.cdRef.markForCheck();
            throw error;
        }

        this.cdRef.markForCheck();
    }

    protected onArrangeByChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (!event) {
            throw new Error('Something went wrong with selecting arrange by option');
        }

        this.selectedArrangeByOption = event.detail.value.label;
        if (event.detail.value.label === DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION && !DecisionLevelConfig.isArrangedByTopdown(this.decisionLevelsConfig)) {
            // for portfolio attributes, we reset the variables at the time of level 1 selection
            // before that we keep things as it is since there is no change in state
            this.noColSelectedInTopdownArrangeBy = true;
            this.refreshInProgress = false;
        } else if (event.detail.value.label === DecisionLevelConfig.PORT_TREE_CAPTION) {
            this.promptDialog$.next(
                new ExploreDialogParam(
                    AlertConstants.TYPE.PROMPT,
                    AlertConstants.HEADER.CONFIRM,
                    AlertConstants.BODY.DECISION_BENCH_STRUCTURE_CHANGE,
                    AlertConstants.BTN.CONTINUE,
                    AlertConstants.BTN.CANCEL,
                    () => this.arrangeByChangedCallback.apply(this, [event]),
                    () => this.arrangeByCallBackRevert.apply(this)
                ));
        }

        this.refreshRequired = true;
    }

    private arrangeByCallBackRevert(): void {
        this.selectedArrangeByOption = DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION;
        this.arrangeByOptions.forEach(option => option.checked = false);
        this.arrangeByOptions.find(option => option.label === DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION).checked = true;
        this.arrangeByOptions = [...this.arrangeByOptions];
    }

    private arrangeByChangedCallback(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        // reset the state maintaining variables
        this.decisionLevelsConfig.decisionBenchMap.clear();
        this.decisionLevelsConfig.arrangeByOption = event.detail.value.label;
        this.decisionLevelsConfig.portTreeDecisionLevelOption = 1;
        this.decisionLevelsConfig.topDownCols = [];
        this.resetTopdownSelectList(this.topDownColOptionsMap[0][0].values);
        this.resetTopdownSelectList(this.topDownColOptionsMap[1][0].values);
        this.resetTopdownSelectList(this.topDownColOptionsMap[2][0].values);
        this.selectedTopdownColOptions = [];
        this.noColSelectedInTopdownArrangeBy = false;
    }

    protected onPortTreeDecisionLevelChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (!event) {
            throw new Error('Something went wrong with selecting portfolio tree decision level');
        }
        const updatedPortTreeLevel: number = event.detail.value.eventData;

        if (updatedPortTreeLevel < this.decisionLevelsConfig.portTreeDecisionLevelOption && this.decisionLevelsConfig.decisionBenchMap?.size > 0) {
            this.trimDecisionBenchMap(updatedPortTreeLevel, this.decisionLevelsConfig.decisionBenchMap);
        }

        this.decisionLevelsConfig.portTreeDecisionLevelOption = updatedPortTreeLevel;
        this.refreshRequired = true;
    }

    protected onTopDownColChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>, currentIndex: number): void {
        if (!event) {
            throw new Error('Something is wrong with Topdown column selection');
        }

        const previouslySelectedTopdownCol = this.selectedTopdownColOptions[currentIndex];
        this.selectedTopdownColOptions[currentIndex] = event.detail.value as AuxSelectOption;
        // we need previous value to have it enabled once the next values has been selected from any drop-down
        if (this.decisionLevelsConfig.topDownCols[currentIndex] !== (event.detail.value as AuxSelectOption)?.value
            && (!!this.selectedTopdownColOptions[currentIndex + 1] || currentIndex === 0)) {
            this.promptDialog$.next(
                new ExploreDialogParam(
                    AlertConstants.TYPE.PROMPT,
                    AlertConstants.HEADER.CONFIRM,
                    AlertConstants.BODY.DECISION_BENCH_STRUCTURE_CHANGE,
                    AlertConstants.BTN.CONTINUE,
                    AlertConstants.BTN.CANCEL,
                    () => this.topdownChangeCallback.apply(this, [event, currentIndex]),
                    () => this.selectedTopdownColOptions[currentIndex] = previouslySelectedTopdownCol
                ));
        } else {
            this.topdownChangeCallback(event, currentIndex);
        }
    }

    /**
     * does most of the trick when top down column is changed from dropdown
     */
    private topdownChangeCallback(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>, currentIndex: number): void {
        if (currentIndex === 0) {
            // reset the state maintaining variables on level 1 selection
            this.decisionLevelsConfig.decisionBenchMap.clear();
            this.decisionLevelsConfig.portTreeDecisionLevelOption = 0;
            this.decisionLevelsConfig.arrangeByOption = DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION;
        }

        // we need previous value to have it enabled once the next values has been selected from any drop-down
        const previousValue = this.decisionLevelsConfig.topDownCols[currentIndex];
        this.decisionLevelsConfig.topDownCols[currentIndex] = event.detail.value ? (event.detail.value as AuxSelectOption).value : null;
        this.selectedTopdownColOptions[currentIndex] = event.detail.value as AuxSelectOption;

        // get an array of decision levels from 0 to DECISION_LEVEL_CAP-1
        const zeroToMaxDecisionLevel: number[] = Array(this.DECISION_LEVEL_CAP).fill(null).map((_, i) => i);

        // on change of topdown column, we need to update the select list of other columns
        // we want to make sure that the selected column is disabled in other columns
        // if "None" is selected in any dropdown, we want to disable the dropdowns after that
        zeroToMaxDecisionLevel
            .filter(decisionLevel => decisionLevel !== currentIndex)
            .forEach(decisionLevelOtherThanIndex => {
                // enable the previous value at other dropdowns
                const topdownSelectOptionList = this.topDownColOptionsMap[decisionLevelOtherThanIndex][0].values;
                this.updateTopdownSelectList(
                    topdownSelectOptionList,
                    previousValue,
                    TopdownColOptionPropOp.ENABLE
                );
                // if "None" is selected in the dropdown, we want to enable that value in other dropdowns
                // else we want to disable the selected value in other dropdowns
                this.updateTopdownSelectList(
                    topdownSelectOptionList,
                    this.decisionLevelsConfig.topDownCols[currentIndex],
                    isEmpty(this.decisionLevelsConfig.topDownCols[currentIndex]) ? TopdownColOptionPropOp.ENABLE : TopdownColOptionPropOp.DISABLE
                );
                //
                if (isEmpty(this.decisionLevelsConfig.topDownCols[currentIndex]) && decisionLevelOtherThanIndex > currentIndex) {
                    // This is tricky!
                    // The dropdowns that are getting disabled due to selection of "None" in current dropdown, we then
                    // want to enable the value of these disabled dropdowns in all other dropdowns
                    this.enableTopdownValsElsewhereForDisabledDropdown(zeroToMaxDecisionLevel, decisionLevelOtherThanIndex);
                    // disables the dropdowns after the current dropdown if value is "None"
                    this.decisionLevelsConfig.topDownCols[decisionLevelOtherThanIndex] = null;
                    this.selectedTopdownColOptions[decisionLevelOtherThanIndex] = null;
                }
            });

        this.noColSelectedInTopdownArrangeBy = !DecisionLevelConfig.isArrangedByTopdown(this.decisionLevelsConfig);
        this.refreshRequired = true;
    }

    private enableTopdownValsElsewhereForDisabledDropdown(zeroToMaxDecisionLevel: number[], decisionLevelOtherThanIndex: number): void {
        zeroToMaxDecisionLevel
            .filter(j => j !== decisionLevelOtherThanIndex)
            .forEach(j => {
                this.updateTopdownSelectList(
                    this.topDownColOptionsMap[j][0].values,
                    this.decisionLevelsConfig.topDownCols[decisionLevelOtherThanIndex],
                    TopdownColOptionPropOp.ENABLE
                );
            });
    }

    protected getLoadingLabel(): string {
        let label = 'Loading ' + this.decisionLevelsConfig.arrangeByOption + ' with ';
        if (this.decisionLevelsConfig.arrangeByOption === DecisionLevelConfig.PORT_TREE_CAPTION) {
            label += this.decisionLevelsConfig.portTreeDecisionLevelOption + ' level' + (this.decisionLevelsConfig.portTreeDecisionLevelOption > 1 ? 's' : '');
        } else {
            const displayValues = this.decisionLevelsConfig.topDownCols.map((col, index) => {
                const options = this.topDownColOptionsMap[index][0].values;
                const option = options.find(auxOption => auxOption.value === col);
                return option.displayValue;
            });
            if (displayValues.length > 2) {
                label += displayValues.slice(0, displayValues.length - 1).join(', ') + ' and ' + displayValues[displayValues.length - 1];
            } else {
                label += displayValues.join(' and ');
            }
        }
        return label;
    }

    private updateTopdownSelectList(options: AuxSelectOption[], colTag: string, operation: TopdownColOptionPropOp): void {
        const optionToUpdate = options.find(option => colTag === option.value);
        if (!optionToUpdate) {
            return;
        }

        switch (operation) {
            case TopdownColOptionPropOp.SELECT:
                optionToUpdate.isSelected = true;
                break;
            case TopdownColOptionPropOp.DESELECT:
                optionToUpdate.isSelected = false;
                break;
            case TopdownColOptionPropOp.DISABLE:
                optionToUpdate.isDisabled = true;
                break;
            case TopdownColOptionPropOp.ENABLE:
                optionToUpdate.isDisabled = false;
                break;
        }
    }

    private resetTopdownSelectList(options: AuxSelectOption[]): void {
        options.forEach(option => {
            option.isSelected = false;
            option.isDisabled = false;
        });
    }

    private trimDecisionBenchMap(updatePortTreeLevel: number, decisionBenchMap: Map<string, string>) {
        decisionBenchMap.forEach((value, key) => {
            const decisionPath = key.split(CommonConstants.ARROW_OPERATOR);
            const decisionPathLength = decisionPath.length;
            if (decisionPathLength > updatePortTreeLevel + 1) {
                decisionBenchMap.delete(key);
            }
        });
    }
}
