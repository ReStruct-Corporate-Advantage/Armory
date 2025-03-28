import {AuxPicklist} from '@blk/aladdin-angular-components';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {isEmpty} from 'lodash';
import {CoreDefinitionStore} from '../../../definition/core-definition.store';
import {NamedScenario} from '../../../definition/models/scenario/named-scenario.model';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {ExploreSelectionTree} from '../../../ui/models/explore-selection-tree.model';
import {UserScenarioService} from '../../services/user-scenario.service';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {BehaviorSubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DateFormatConstants} from '../../../date/constants';
import {DateService} from '../../../date/services/date.service';
import {SubscribableComponent} from '../../../core/components/subscribable.component';
import {CalendarDateUtils} from '../../../date/utils';
import {DateStore} from '../../../date/stores';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';
import {NotificationServiceInterface} from '../../../ui/service-interfaces/notification-service.interface';
import {AlertConstants} from '../../../ui/constants/alert.constants';
import {UserScenariosConstants} from '../../constants';

/**
 * This component allows the multi selection of the named scenarios.
 */
@Component({
    selector: 'explore-core-named-scenario',
    templateUrl: './named-scenario.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NamedScenarioComponent extends SubscribableComponent implements OnInit {

    constructor(protected changeDetectorRef: ChangeDetectorRef, private userScenarioService: UserScenarioService, private dateService: DateService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface) {
        super();
    }

    /**
     * The list of scenarios that are selected.
     */
    @Input()
    scenarios: NamedScenario[];

    @Input()
    allowNamedScenarioSingleSelection: boolean;

    @Input()
    lookBackDate: DateValue;

    @Input()
    fetchedScenarios: Map<string, NamedScenario[]>;

    @Input()
    showSpinner$: BehaviorSubject<boolean>;

    defaultLookBackDate: string;
    prevLookBackDate: string;

    @ViewChild('auxPickList', {static: false}) auxPickList: AuxPicklist;

    // These are used to create the selection control.
    availableScenariosForPicklist: ExploreSelectionTree[] = [];
    selectedScenarios: ExploreSelectionTree[] = [];
    availableScenariosForCombobox: ExploreSelectOptionGroup[] = [];

    /**
     * Created an aux selection item for the given scenario.
     */
    private static createSelectionItem(scenario: NamedScenario): ExploreSelectionTree {
        const item = new ExploreSelectionTree(scenario.name);
        item.eventData = scenario;
        if (!isEmpty(scenario.description)) {
            item.tooltip = scenario.description;
        }
        return item;
    }

    /**
     * Init the control.
     */
    ngOnInit(): void {
        // If there are no scenarios passed it log an exception and just get out of here.
        if (!this.scenarios) {
            console.error('Control needs to be passed the scenarios');
            return;
        }

        // Get the list of scenario groups in the order we want them displayed.
        const scenarioGroups: string[] = Array.from(this.getFetchedScenarios().keys());

        // populate DS component
        this.allowNamedScenarioSingleSelection ? this.initializeCombobox(scenarioGroups) : this.initializePicklist(scenarioGroups);

        this.setDefaultLookBackDateAndLoadScenarios();

        this.changeDetectorRef.markForCheck();
    }

    /**
     * Initialize the picklist for multiple scenario selection
     */
    initializePicklist(scenarioGroups: string[]): void {
        this.availableScenariosForPicklist = [];

        // Now build the groups of scenarios.
        scenarioGroups.forEach((groupName: string) => this.addAvailableScenariosToPicklist(groupName, this.getFetchedScenarios().get(groupName)));

        // Build the select scenarios list.
        this.selectedScenarios = this.scenarios.map((item) => NamedScenarioComponent.createSelectionItem(item));
    }

    /**
     * Initialize the combobox for single scenario selection
     */
    initializeCombobox(scenarioGroups: string[]): void {
        scenarioGroups.forEach((groupName: string) =>
            this.addAvailableScenariosToCombobox(groupName, this.getFetchedScenarios().get(groupName)));
    }

    /**
     * Add the group of named scenarios to the available selection.
     */
    private addAvailableScenariosToCombobox(groupName: string, scenarios: NamedScenario[]): void {
        // Only add this group if there are any items in this group.
        if (isEmpty(scenarios)) {
            return;
        }

        const selectItems = new ExploreSelectOptionGroup([], groupName);
        for (const scenario of scenarios) {
            selectItems.values.push(new ExploreSelectOption(scenario.name, scenario, scenario.name === this.scenarios[0].name));
        }
        this.availableScenariosForCombobox.push(selectItems);
    }

    /**
     * Gets the list of scenarios to test.  This is exposed to be able to mock in the tests.
     * NOTE:  We might want to think about injecting this so that we can mock it better.
     */
    getFetchedScenarios(): Map<string, NamedScenario[]> {
        return this.fetchedScenarios;
    }

    /**
     * Add the group of named scenarios to the available selection of the picklist
     */
    private addAvailableScenariosToPicklist(groupName: string, scenarios: NamedScenario[]): void {
        // Only add this group if there are any items in this group.
        if (isEmpty(scenarios)) {
            return;
        }

        const group = new ExploreSelectionTree(groupName);
        group.children = scenarios.map((item) => NamedScenarioComponent.createSelectionItem(item));
        this.availableScenariosForPicklist.push(group);
    }

    /**
     * This is used to get the current list of selected items in the select list and put back into the original settings.
     */
    updateSelectedScenarios() {
        // Clear the existing list of items.
        this.scenarios.length = 0;

        // Now add back all the items.
        this.auxPickList.getTargetSelection()
            .then(selectedItems => this.updateScenarioListFromPicklist(selectedItems));
    }

    /**
     * update the selected scenarios in the original list
     */
    updateScenarioListFromPicklist(selectedScenarios): void {
        selectedScenarios.forEach(scenario => this.scenarios.push(scenario.eventData));
    }

    /**
     * Sets the selected name scenario
     */
    updateScenarioListFromCombobox(nameScenario: ExploreSelectOption): void {
        this.scenarios.length = 0;
        this.scenarios.push(nameScenario.value);
    }

    private setDefaultLookBackDateAndLoadScenarios(): void {
        const calCode = DateStore.getCurrentDate().calCode;
        const relDate = 'T-' + CoreDefinitionStore.scenarioLookBackDays;
        this.dateService.parseDateString$(calCode, relDate)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: Date) => {
                this.defaultLookBackDate = CalendarDateUtils.getDateInFormat(response, DateFormatConstants.MMDDYYYY_SLASH);
                this.loadScenarios(true);
            }, (_error) => {
                this.notificationService?.error(AlertConstants.DATE_SERVICE_ERROR);
            });
    }

    updateScenariosAndInitialize(scenarioMap): void {
        if (scenarioMap == null) {
            return;
        }
        scenarioMap.forEach((scenList, scenName) => {
            this.fetchedScenarios.set(scenName, scenList);
        });
        // Get the list of scenario groups in the order we want them displayed.
        const scenarioGroups: string[] = Array.from(this.getFetchedScenarios().keys());

        // populate DS component
        this.allowNamedScenarioSingleSelection ? this.initializeCombobox(scenarioGroups) : this.initializePicklist(scenarioGroups);

        this.changeDetectorRef.markForCheck();
    }

    /**
     * Action taken when the date is changed
     * @param dateObject has the new date
     */
    onDateChange(dateObject: DateValue): void {
        this.lookBackDate = dateObject;
        this.loadScenarios(false);
    }

    /**
     * Load Scenarios by lookBackDate
     */
    private loadScenarios(fromInit: boolean): void {
        if (!this.lookBackDate.dateString) {
            this.loadScenariosHelper(fromInit, this.lookBackDate.date);
            return;
        }
        const calCode = DateStore.getCurrentDate().calCode;
        this.dateService.parseDateString$(calCode, this.lookBackDate.dateStringValue)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: Date) => {
                this.loadScenariosHelper(fromInit, response);
            }, (_error) => {
                this.notificationService?.error(AlertConstants.DATE_SERVICE_ERROR);
            });
    }

    private loadScenariosHelper(fromInit: boolean, lookBackDate: Date | string): void {
        const date = CalendarDateUtils.getDateInFormat(lookBackDate, DateFormatConstants.MMDDYYYY_SLASH);
        const isDefaultLookBackDate = this.defaultLookBackDate === date;
        if (!fromInit && this.prevLookBackDate === date) {
            return;
        }
        if (fromInit && !isDefaultLookBackDate) {
            return;
        }

        this.prevLookBackDate = date;

        if (isDefaultLookBackDate && CoreDefinitionStore.defaultNamedScenarios !== null) {
            // If default lookBackDate is passed again, then fetch scenarios from Cache
            this.updateScenariosAndInitialize(CoreDefinitionStore.defaultNamedScenarios);
            return;
        }

        this.showSpinner$.next(true);

        // Load scenarios by lookBackDate
        this.userScenarioService.fetchUserScenarios$(date)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(scenarioMap => {
                    this.updateScenariosAndInitialize(scenarioMap);

                    // If default lookBackDate is passed and Cache is empty, then set in Cache
                    if (isDefaultLookBackDate && CoreDefinitionStore.defaultNamedScenarios === null) {
                        CoreDefinitionStore.defaultNamedScenarios = new Map(scenarioMap);
                    }

                    this.showSpinner$.next(false);
                },
                (_error) => {
                    this.showSpinner$.next(false);
                    this.notificationService?.error(UserScenariosConstants.FETCH_SCENARIOS_ERROR + date);
                });
    }
}
