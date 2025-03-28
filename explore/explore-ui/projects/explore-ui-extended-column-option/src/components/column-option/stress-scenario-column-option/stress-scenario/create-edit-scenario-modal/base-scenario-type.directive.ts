import {Directive, EventEmitter, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges} from '@angular/core';
import {ColumnConfig, NotificationServiceInterface, NOTIFICATION_SERVICE_TOKEN, SubscribableComponent} from '@blk/explore-ui-core';
import {StressScenario} from '../../../../../models/stress-scenario.model';
import {BehaviorSubject} from 'rxjs';

/**
 * Base class that all stress scenario type components (Implied, Specified, Date Range Scenarios) should implement
 * scenarioValidatedEmitter emits boolean value to indicate the scenario is valid for save and add to selected scenarios
 * checks for changes for field validateScenario -> which becomes true when user clicks on Save and Add button from CreateEditScenarioModalComponent
 */
@Directive()
export abstract class BaseScenarioTypeDirective extends SubscribableComponent implements OnInit, OnChanges {


    @Input()
    column: ColumnConfig;
    @Input()
    scenario: StressScenario;
    @Input()
    showSpinner$: BehaviorSubject<boolean>;
    @Input()
    isApplyButtonDisabled: {value: number};
    @Input()
    validateScenario: boolean;
    @Input()
    viewAsSpecifiedClicked: boolean;

    @Output()
    scenarioValidatedEmitter = new EventEmitter<boolean>();

    /**
     * constructor
     */
    constructor(@Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface) {
        super();
    }

    ngOnInit(): void {
        this.initializeComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.validateScenario?.currentValue) {
            this.validateStressScenario();
        }
    }

    protected abstract initializeComponent(): void;

    protected abstract validateStressScenario(): void;
}
