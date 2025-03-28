import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Input,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {Subject} from 'rxjs';
import {ColumnConfig, RestrictedOptionInterface, WidgetConfigType} from '@blk/explore-ui-core';
import {BaseColumnOptionComponent} from './base-column-option.component';
import {ColumnOptionComponentFactory} from './column-option-component.factory';
import {ColumnOptionUpdate} from '../../interfaces';

/*
 * Component for the column options.
 * @example
 * <ng-container *ngFor='let option of sectionOptions.get(optionTitle)'>
       <app-column-option [optionType]="option.columnOptionConfigType"
                          [option]="option"
                          [column]="column">
       </app-column-option>
   </ng-container>
 */
@Component({
    selector: 'explore-column-option',
    templateUrl: './column-option.component.html'
})
export class ColumnOptionComponent implements AfterViewInit {
    /**
     * The type of the option that should be created.
     */
    @Input()
    optionType: string;

    /**
     * This is the column option that will be configured by this class.
     */
    @Input()
    option: any;

    /**
     * The column that we are showing the options for.
     */
    @Input()
    column: ColumnConfig;

    @Input() columnOptionUpdated$: Subject<ColumnOptionUpdate>;

    @Input() widgetType: WidgetConfigType;

    @Input() restrictedColumnOptions: RestrictedOptionInterface;

    /**
     * This is the container object where the column option will be dynamically created in.
     */
    @ViewChild('optionHolder', {static: false, read: ViewContainerRef}) optionHolder: ViewContainerRef;

    /**
     * Constructor that injects the factory to lookup the required component to create.
     */
    constructor(private CFR: ComponentFactoryResolver, private columnOptionComponentFactory: ColumnOptionComponentFactory) {
    }

    /**
     * Performs required initialisation after the view is initialised
     */
    ngAfterViewInit() {
        // Ensure the holder is cleared of any controls.
        this.optionHolder.clear();

        // Get the type of the component to be created.
        const componentType: Type<BaseColumnOptionComponent<any>> = this.columnOptionComponentFactory.getComponent(this.optionType);
        if (!componentType) {
            return;
        }

        // Create the control in the holder.
        const componentFactory = this.CFR.resolveComponentFactory(componentType);
        const componentRef: ComponentRef<BaseColumnOptionComponent<any>> = this.optionHolder.createComponent(componentFactory);
        // Bind in the required parameters.
        componentRef.instance.option = this.option;
        componentRef.instance.column = this.column;
        componentRef.instance.widgetType = this.widgetType;
        componentRef.instance.columnOptionUpdated$ = this.columnOptionUpdated$;
        componentRef.instance.restrictedColumnOptions = this.restrictedColumnOptions;
        componentRef.changeDetectorRef.detectChanges();
    }
}
