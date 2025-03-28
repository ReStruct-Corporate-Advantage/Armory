import {Directive, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CoreFavoriteConstants, RestrictedOptionInterface, SubscribableComponent, TelemetryGenericEventParameters, WidgetConfigInput, WidgetConfigType, WidgetConfigUtils, WidgetInput} from '@blk/explore-ui-core';

/**
 * Abstract widget setting component that defines common behaviour for the widget settings
 */
@Directive()
export abstract class BaseWidgetSettingComponent<T extends WidgetInput> extends SubscribableComponent implements OnInit {
    @Input()
    widgetConfigInput: WidgetConfigInput;
    @Input()
    inputs: Map<string, WidgetInput>;
    @Input()
    isApplyButtonDisabled: { value: number };
    @Input()
    widgetType: WidgetConfigType;
    @Input()
    restrictedColumnOptions: RestrictedOptionInterface;
    @Input()
    customCalcFavoriteType: string;
    @Input()
    isChartWidget: boolean;
    @Input()
    telemetryData?: TelemetryGenericEventParameters;

    widgetInput: T;
    widgetInput$: BehaviorSubject<T>;
    favoriteType: string;
    favoriteFolderType: string;

    /**
     *
     * @param inputName name of the widgetInput to extract from the given collection
     * @return widget widgetInput that is associated with the given inputName key in the given widgetInputs mapping,
     * or undefined if there is no record with the given inputName key.
     */
    getInput(inputName: string): WidgetInput {
        return this.inputs.get(inputName);
    }

    /**
     * Final implementation of ngOnInit on WidgetSettingComponents
     * Extended classes should not implement OnInit
     */
    ngOnInit(): void {
        // Set widgetInput.
        // For instance, if the widgetConfigInput.inputName is "riskAndExposureAdditionalSettings", it will extract
        // a value for the "riskAndExposureAdditionalSettings" key from the inputs collection.
        this.widgetInput = this.getInput(this.widgetConfigInput.inputName) as T;
        this.widgetInput$ = new BehaviorSubject(this.widgetInput);

        // Set Favorite Type of widget config
        if (this.widgetType) {
            this.favoriteType = WidgetConfigUtils.getWidgetInputFavoriteType(this.widgetType, this.widgetConfigInput.inputConfigType, this.widgetConfigInput.inputName);
            this.favoriteFolderType = this.favoriteType + CoreFavoriteConstants._FOLDER;
        }

        this.initializeComponent();
    }

    /**
     * Initializes the component
     */
    abstract initializeComponent(): void;
}
