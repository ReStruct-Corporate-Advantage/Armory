import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Input,
    Output,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {takeUntil} from 'rxjs/operators';
import {ConstraintOption} from '../../models/constraint-option';
import {Subject} from 'rxjs';
import {Dictionary} from 'lodash';
import {ColumnConfig, SubscribableComponent} from '@blk/explore-ui-core';

@Component({
    selector: 'app-constraint-option-wrapper',
    templateUrl: './constraint-option-wrapper.component.html'
})
export class ConstraintOptionWrapperComponent<T, C> extends SubscribableComponent implements AfterViewInit {
    @Input() component: Type<OptionValueComponent<T, C>>;
    @Input() options: Array<ConstraintOption<T>>;
    @Input() parentConfig: C;
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Input() columnConfig: ColumnConfig;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<T>> = new EventEmitter();
    @ViewChild('optionForm', {read: ViewContainerRef, static: false}) viewRef: ViewContainerRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        if (this.component) {
            const componentFactory: ComponentFactory<OptionValueComponent<T, C>> = this.componentFactoryResolver.resolveComponentFactory(this.component);
            const componentRef: ComponentRef<OptionValueComponent<T, C>> = this.viewRef.createComponent(componentFactory);
            const instance: OptionValueComponent<T, C> = componentRef.instance;
            instance.options = this.options;
            instance.parentConfig = this.parentConfig;
            instance.optionValues$ = this.optionValues$;
            instance.columnConfig = this.columnConfig;
            instance.updated.pipe(takeUntil(this.ngUnsubscribe)).subscribe((update: ConstraintOptionValueUpdate<T>) => {
                this.updated.emit(update);
            });
            this.cdRef.detectChanges();
        }
    }
}
