import {Component, Input, OnInit} from '@angular/core';
import {ColumnConfig, ColumnOptionMetaDataInterface, SubscribableComponent, ConfigState} from '@blk/explore-ui-core';
import {HighlightColumnOption} from '@blk/explore-ui-column-option';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {BehaviorSubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {isNil} from 'lodash';
import {FactorDataChartSettingsStore} from '../../stores/factor-data-chart-settings.store';

@Component({
    selector: 'app-factor-data-conditional-formatting',
    templateUrl: './factor-data-conditional-formatting.component.html',
    styleUrls: ['./factor-data-conditional-formatting.component.scss']
})
/**
 * This component shows the Conditional Formatting card when Risk Matrix mode is selected in Chart Settings tab of Factor Data widget settings
 */
export class FactorDataConditionalFormattingComponent extends SubscribableComponent implements OnInit {

    @Input()
    isTriangularMatrix$: BehaviorSubject<boolean>;

    lowerCol: ColumnConfig;
    upperCol: ColumnConfig;
    option: ColumnOptionMetaDataInterface;

    ngOnInit(): void {
        this.initializeHighlightColumnOptionMetaData();
        this.lowerCol = ColumnConfig.createColumn('correlation', 'FACTOR_MODEL', 'correlation', 'correlation');
        this.upperCol = ColumnConfig.createColumn('correlation', 'FACTOR_MODEL', 'correlation', 'correlation');

        this.isTriangularMatrix$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.resetSettings();
            });
    }

    private resetSettings(): void {
        const factorDataHighlightSettings = this.getFactorDataHighlightSettings();
        if (isNil(factorDataHighlightSettings.lowerHighlightSettings)) {
            const lower = new HighlightColumnOption();
            lower.initialize(this.option);
            lower.optionState = ConfigState.NEW;
            factorDataHighlightSettings.lowerHighlightSettings = lower;
        }
        this.lowerCol.optionValues = [ factorDataHighlightSettings.lowerHighlightSettings ];

        // For Triangular Matrix Type only
        if (this.isTriangularMatrix$.getValue()) {
            if (isNil(factorDataHighlightSettings.upperHighlightSettings)) {
                const upper = new HighlightColumnOption();
                upper.initialize(this.option);
                upper.optionState = ConfigState.NEW;
                factorDataHighlightSettings.upperHighlightSettings = upper;
            }
            this.upperCol.optionValues = [ factorDataHighlightSettings.upperHighlightSettings ];
        } else {
            this.upperCol.optionValues = [];
        }
    }

    private getFactorDataHighlightSettings(): FactorDataHighlightSettings {
        return FactorDataChartSettingsStore.inputs.get(FactorDataHighlightSettings.configType) as FactorDataHighlightSettings;
    }

    private initializeHighlightColumnOptionMetaData(): void {
        this.option = {
            'columnOptionAttributes': [
                {
                    'title': 'Compare Type',
                    'key': 'compareType',
                    'dataType': 'S'
                },
                {
                    'title': 'Compare Value',
                    'key': 'compareValue',
                    'dataType': 'S'
                },
                {
                    'title': 'Highlight Color',
                    'key': 'highlightColor',
                    'dataType': 'S'
                }
            ],
            'columnOptionConfigType': 'highlight',
            'columnOptionTitle': 'Conditional formatting',
            'columnOptionKey': 'highlight'
        };
    }

}
