import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ColumnOptionAttributeValue, SubscribableComponent} from '@blk/explore-ui-core';
import {INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY} from '@optimization-settings/constants/optimization-summaries.constants';
import {Security} from '@interfaces/security.interface';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {Dictionary, isNil, cloneDeep, isEmpty} from 'lodash';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SecuritySearchComponent} from '../../../../../shared/components';
import {
    CUSTOM_SECURITY_LIST,
    FILTER_NAME,
    SELECT_FROM_UNIVERSE
} from '@optimization-settings/constraints-settings/constants/constraint.constants';
import {ConstraintOptionSecurityListSubsectionEnum} from '@optimization-settings/constraints-settings/enums/constraint-option-security-list-subsection.enum';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-constraint-option-security-list',
    templateUrl: './constraint-option-security-list.component.html',
    styleUrls: ['./constraint-option-security-list.component.scss']
})
export class ConstraintOptionSecurityListComponent extends SubscribableComponent implements OptionValueComponent<string, OptimizationSettings>, OnInit, AfterViewInit {
    @Input() options: ConstraintOption<string>[];
    @Input() parentConfig: OptimizationSettings;
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<any>> = new EventEmitter();
    @ViewChild('securitySearchComp', {static: false}) securitySearchComp: SecuritySearchComponent;
    securitySelectionOptions: AuxRadioInterface[] = [];
    selectedSecurities = new Map<string, Security>();
    portFilter = new CustomFilter();
    selectedSubSection: ConstraintOptionSecurityListSubsectionEnum = ConstraintOptionSecurityListSubsectionEnum.SELECT_FROM_UNIVERSE;
    selectOptions: ConstraintOption<string>[];
    selectedSecurityList: string;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        const option: ConstraintOption<string> = this.options[0];
        this.initSecuritySelectionOptions();
        this.optionValues$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((options: Dictionary<any>) => {
            this.selectedSubSection = options[ConstraintOptionTypeKey.SECURITY_CONSTRAINT_SUBSECTION];
            // Assign security list if select from universe is selected
            if (this.selectedSubSection === ConstraintOptionSecurityListSubsectionEnum.SELECT_FROM_UNIVERSE && !isNil(options[ConstraintOptionTypeKey.SECURITY_LIST])) {
                this.selectedSecurityList = options[ConstraintOptionTypeKey.SECURITY_LIST];
            } else if (this.selectedSubSection === ConstraintOptionSecurityListSubsectionEnum.FILTER && !isNil(options[ConstraintOptionTypeKey.SECURITY_CONSTRAINT_FILTER])) {
                // Init filter if filter option is selected
                this.portFilter.deserialize((options[ConstraintOptionTypeKey.SECURITY_CONSTRAINT_FILTER] as CustomFilter));
            } else if (this.selectedSubSection === ConstraintOptionSecurityListSubsectionEnum.CREATE_FROM_SCRATCH && !isEmpty(options[ConstraintOptionTypeKey.SELECTED_SECURITIES])) {
               // init securities if custom security list was selected
                this.selectedSecurities = options[ConstraintOptionTypeKey.SELECTED_SECURITIES];
            }
            this.initSecuritySelectionOptions();
        });

        const values: ColumnOptionAttributeValue[] = this.getValues();
        this.selectOptions = [{
            optionAttribute: {
                title: option.optionAttribute.title,
                key: option.optionAttribute.key,
                values,
                defaultValue: values[0]
            },
            value$: option.value$
        }];
        this.changeDetectorRef.detectChanges();
    }

    onUpdated(update: ConstraintOptionValueUpdate<string>): void {
        this.updated.emit(update);
    }

    /**
     * Initialize security selection options
     */
    initSecuritySelectionOptions(): void {
        this.securitySelectionOptions = [{
            label: SELECT_FROM_UNIVERSE,
            checked: this.selectedSubSection === ConstraintOptionSecurityListSubsectionEnum.SELECT_FROM_UNIVERSE
        }, {
            label: FILTER_NAME,
            checked: this.selectedSubSection === ConstraintOptionSecurityListSubsectionEnum.FILTER
        }, {
            label: CUSTOM_SECURITY_LIST,
            checked: this.selectedSubSection === ConstraintOptionSecurityListSubsectionEnum.CREATE_FROM_SCRATCH
        }];
    }

    /**
     * Handler for security selection option changed
     */
    onOptionChanged(event: CustomEvent): void {
        this.selectedSubSection = event.detail.value.uid;
        if (isNil(this.selectedSecurityList)) {
            this.selectedSecurityList = this.selectOptions[0].optionAttribute.defaultValue.value;
        }
        this.updated.emit({
            key: ConstraintOptionTypeKey.SECURITY_CONSTRAINT_SUBSECTION,
            value: this.selectedSubSection
        });
        this.updated.emit({
            key: ConstraintOptionTypeKey.SECURITY_LIST,
            value: this.selectedSubSection === 0 ? this.selectedSecurityList : null
        });
    }

    /**
     * AfterViewInit
     */
    ngAfterViewInit() {
        this.securitySearchComp.validateAndAddSecurities(this.selectedSecurities);
    }

    /**
     * updates the option value with added securities
     */
    updateSecurities(): void {
        this.updated.emit({
            key: ConstraintOptionTypeKey.SELECTED_SECURITIES,
            value: this.selectedSecurities
        });
    }

    private getValues(): ColumnOptionAttributeValue[] {
        const options: ColumnOptionAttributeValue[] = this.parentConfig.investmentUniverseSettings.investmentUniverse.filter(value => value.enabled).map(({label}: { label: string }) => ({
            label,
            value: label
        }));
        options.push({
            label: INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY.title,
            value: INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY.title
        });
        return options;
    }

    /**
     * updates port filter
     */
    updatePortFilter(portFilter: CustomFilter) {
        this.portFilter = cloneDeep(portFilter);
        this.updated.emit({
            key: ConstraintOptionTypeKey.SECURITY_CONSTRAINT_FILTER,
            value: this.portFilter
        });
    }
}
