import {Directive, Input, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnOptionFactory,
    ColumnOptionMetaDataInterface,
    ConfigState,
    CoreColumnUtils,
    RestrictedOptionInterface,
    SubscribableComponent, WidgetConfigType
} from '@blk/explore-ui-core';
import {cloneDeep, find, some} from 'lodash';
import {ColumnOptionUpdate} from '../../interfaces';
import {filter, takeUntil} from 'rxjs/operators';

/**
 * Definition of the base class for the column options.
 */
@Directive()
export abstract class BaseColumnOptionComponent<T extends AbstractColumnOption> extends SubscribableComponent implements OnInit {
    /**
     * This is the column option that will be configured by this class.
     */
    @Input()
    option: ColumnOptionMetaDataInterface;

    /**
     * The column that we are showing the options for.
     */
    @Input()
    column: ColumnConfig;
    @Input() columnOptionUpdated$: Subject<ColumnOptionUpdate>;

    @Input() widgetType: WidgetConfigType;

    @Input() restrictedColumnOptions: RestrictedOptionInterface;

    @Input() columnOptionsToAdd: ColumnOptionMetaDataInterface[];

    /**
     * The actual settings that the user has configured for this option value.
     */
    optionValue: T;

    /**
     * The initial option value when the column option was first loaded, either existing or new (default)
     */
    initialOptionValue: T;

    /**
     * Gets the config type of the option that we are configuring.
     */
    protected abstract getOptionValueConfigType(): string;

    /**
     * Init the component.
     */
    ngOnInit(): void {
        this.updateOptionValues();
        this.initializeComponent();
        // clone the initial value of the column option after initialization so we can check for changes at the end
        this.initialOptionValue = cloneDeep(this.optionValue);

        // each time a column set is saved, update the initialOptionValue to compare against
        if (this.columnOptionUpdated$) {
            this.columnOptionUpdated$.pipe(
                filter(({column, isSaveUpdate}) => column === this.column && isSaveUpdate),
                takeUntil(this.ngUnsubscribe)
            ).subscribe(() => {
                this.optionValue.optionState = ConfigState.EXISTING;
                this.initialOptionValue = cloneDeep(this.optionValue);
            });
        }

    }

    protected onDestroy() {
        // determine if the column option has been modified as the column option is destroyed (different column is clicked or modal is closed)
        this.optionValue.updateColumnOptionState(this.initialOptionValue);
    }

    /**
     * Functions called to initialise the component if needed.
     */
    protected initializeComponent(): void {
        // Intentionally blank so the implementation do not have to add it.
    }

    updateOptionValues() {
        // Get the option that we need to configure.
        this.optionValue = CoreColumnUtils.getOptionValueByConfigType(this.column.optionValues, this.getOptionValueConfigType()) as T;

        // If we didn't find an option then we need to create one.
        // This scenario could happen if an existing column in a report has a new option added after the column was created.
        if (!this.optionValue) {
            this.optionValue = ColumnOptionFactory.createNewModel(this.getOptionValueConfigType(), this.option) as T;
            this.column.optionValues.push(this.optionValue);
        }
    }

    /**
     * Returns true if the column option is restricted to a single select option
     */
    isSingleSelectOption(): boolean {
        // Check if the restricted column options has singleSelectOptions
        const singleSelectOptions = find(this.restrictedColumnOptions?.options, (option) => option.section === 'singleSelectOptions');
        if (!singleSelectOptions) {
            return false;
        }
        // Go through all the different columnOptionAttributes listed under the singleSelectOptions
        // If there are any columnOptionAttributes that match, then return true
        return some(singleSelectOptions.options, (singleSelectOption) => {
            return some(this.option.columnOptionAttributes, (columnOptionAttribute) => columnOptionAttribute.key === singleSelectOption);
        });
    }
}
