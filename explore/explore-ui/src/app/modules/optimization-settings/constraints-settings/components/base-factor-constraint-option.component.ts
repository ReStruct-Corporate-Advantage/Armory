import {AfterViewInit, ChangeDetectorRef, Directive, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AuxRadio} from '@blk/aladdin-angular-components';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../../app.store';
import {CoreCommonConstants, SubscribableComponent} from '@blk/explore-ui-core';

/**
 * Base class for quick factor block and factor tag constraint options
 */
@Directive()
export class BaseFactorConstraintOptionComponent extends SubscribableComponent implements OnInit, AfterViewInit {

    /**
     * radio button ref for quick factor block/ factor tag
     */
    @ViewChild('factorRadio', {static: false}) factorRadio: AuxRadio;

    @Input() options: Array<ConstraintOption<string>>;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<string>> = new EventEmitter();

    isDisabled: boolean;

    constructor(private appStore: AppStore, private cdRef: ChangeDetectorRef) {
        super();
    }

    /**
     * on init hook
     */
    ngOnInit(): void {
        // subscription logic to hit on toggle of factor constraint option
        this.appStore.toggleFactorConstraintValue$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(key => this.disableAndResetOption(key, this.getKeyToDisable()));
    }

    /**
     * after view init hook
     */
    ngAfterViewInit(): void {
        // subscription logic to hit on change in value of factor constraint option
        this.options[0].value$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => this.updateCheckedAndDisablePropsOnValChange(value));
    }

    /**
     * callback logic
     * to be hit when message is sent to disable the other constraint option
     */
    disableAndResetOption(optionKey: string, keyToDisable: string): void {
        if (optionKey === keyToDisable) {
            this.isDisabled = true;
            this.factorRadio.isChecked = false;
            this.updated.emit({key: keyToDisable, value: CoreCommonConstants.EMPTY_STRING});
        }
    }

    /**
     * callback logic
     * to be hit when value changes for constraint option
     */
    updateCheckedAndDisablePropsOnValChange(value: any): void {
        this.isDisabled = !value;
        this.factorRadio.isChecked = !!value;
        this.cdRef.detectChanges();
    }

    /**
     * on factor constraint option value update
     * update constraint option value
     * send message to disable the other constraint option
     */
    onUpdated(update: ConstraintOptionValueUpdate<string>, keyToDisable: string): void {
        this.updated.emit(update);
        this.appStore.toggleFactorConstraintValue$.next(keyToDisable);
    }

    /**
     * on selection of factor constraint option radio button
     * enable the select box
     * send message to disable the other constraint option
     */
    disableOtherField(keyToDisable: string): void {
        this.isDisabled = false;
        this.appStore.toggleFactorConstraintValue$.next(keyToDisable);
    }

    /**
     * get the option key to be disabled
     * to be overridden by child class
     */
    getKeyToDisable(): string {
        return null;
    }
}
