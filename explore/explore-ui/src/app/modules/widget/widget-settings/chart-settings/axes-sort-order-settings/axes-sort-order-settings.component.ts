import {Component, Input} from '@angular/core';
import {BaseWidgetSettingComponent, ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnConstants} from '@blk/explore-ui-core';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {compact, isEqual, isUndefined, merge, set, zip} from 'lodash';
import {distinctUntilChanged, first, map, shareReplay} from 'rxjs/operators';
import {RxState} from '@rx-angular/state';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {SortedColumnsX} from '@models/widget/inputs/chart-settings/sorted-columns-x.model';
import {SortedColumnsY} from '@models/widget/inputs/chart-settings/sorted-columns-y.model';
import {WidgetConfigFactory} from '../../../../../factories';
import {LetModule} from '@ngrx/component';

type STATE = {
    settingKey: string;
    columnsKey: string;
    columns: ColumnConfig[];
    sortBySelectionList: string[];
    measureSelectionList: string[];
    measureExclusionList: string[][];
    secondaryDisabledList: boolean[];
};

const DEFAULT: Partial<STATE> = {
    columnsKey: 'columns',
    columns: [],
    sortBySelectionList: ['NONE'],
    measureSelectionList: [],
    measureExclusionList: [],
    secondaryDisabledList: []
};

const SORT_ORDERS_SECONDARY_DISABLED_LIST = ['NONE', ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE];

@UntilDestroy()
@Component({
    selector: 'app-axes-sort-order-settings',
    templateUrl: './axes-sort-order-settings.component.html',
    providers: [RxState, LetModule]
})
export class AxesSortOrderSettingsComponent<T extends SortedColumnsX | SortedColumnsY> extends BaseWidgetSettingComponent<T> {
    @Input() set settingKey(settingKey: string) { this.state.set({ settingKey }); }

    private hideBreakdownInSorting: boolean;

    measureData$ = this.state.select('columns').pipe(
        map(columns => ({
            values: columns.map(({ columnTitle, columnKey }) => ({
                displayValue: columnTitle,
                value: columnKey
            }))
        }))
    );

    sortByData = {
        values: [{VALUE: 'NONE', LABEL: 'None'}, ...Object.values(ColumnConstants.SORTING_ORDER)]
            .filter(({ VALUE }) => this.hideBreakdownInSorting
                ? VALUE === ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE
                : true
            )
            .map(({ LABEL, VALUE }) => ({
                displayValue: LABEL,
                value: VALUE
            }))
    };

    settings$ = this.state.select().pipe(
        map(({
            sortBySelectionList,
            measureSelectionList,
            measureExclusionList,
            secondaryDisabledList
        }) => sortBySelectionList.map((sortBySelection, index) => ({
            sortBySelection: sortBySelection || 'NONE',
            measureSelection: measureSelectionList[index] || '',
            measureExclusion: measureExclusionList[index] || [],
            secondaryDisabled: secondaryDisabledList[index]
        }))),
        distinctUntilChanged(isEqual)
    );

    constructor(public state: RxState<STATE>) {
        super();
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.hideBreakdownInSorting = WidgetConfigFactory.getHideBreakdownInSorting(this.widgetType);

        const sortedColumns$ = this.state.select('settingKey').pipe(
            map(settingKey => this.getSortedColumnInput(settingKey)),
            map(inputColumns => inputColumns.sortedColumns),
            shareReplay(1)
        );

        // connect state to observables
        this.state.connect('sortBySelectionList', sortedColumns$.pipe(map(sortedColumns => sortedColumns.map(column => column.sort))));
        this.state.connect('measureSelectionList', sortedColumns$.pipe(map(sortedColumns => sortedColumns.map(column => column.colId))));

        this.state.connect('secondaryDisabledList', this.state
            .select('sortBySelectionList')
            .pipe(map((sortBySelectionList) => sortBySelectionList.map(sort => SORT_ORDERS_SECONDARY_DISABLED_LIST.includes(sort)))
        ));

        this.state.select().pipe(
            untilDestroyed(this),
        ).subscribe(({ settingKey, sortBySelectionList, measureSelectionList }) => {
            const sortedColumns = compact(zip(sortBySelectionList, measureSelectionList)
                .map(([sort, colId]) => ({ colId, sort }))
                .map(column => column && new SortedColumn(column) || undefined)
            );

            (this.getInput(settingKey) as T).sortedColumns = sortedColumns ;
        });

        this.state.select('settingKey').pipe(first()).subscribe(settingKey => {
            const sortedColumns = this.getSortedColumnInput(settingKey)?.sortedColumns;
            const sortBySelectionList = sortedColumns?.map(col => col.sort);
            const measureSelectionList = sortedColumns?.map(col => col.colId);
            this.state.set(merge(
                {},
                DEFAULT,
                {
                    columns: (this.getInput('columns') as ColumnSet).columns,
                    sortBySelectionList,
                    measureSelectionList
                }
            ));
        });
    }

    getSortedColumnInput(settingKey: string) {
        let input = this.getInput(settingKey) as SortedColumns;
        if (!input) {
            // setting not yet used, use default
            input = new SortedColumns();
            input.sortedColumns = [];
            this.inputs.set(settingKey, input);
        }
        return input;
    }

    update({ key, value }: {key: string, value: string}, index: number) {
        this.state.set(state => {
            let secondary = state.measureSelectionList[index];

            if (key === 'primary' && value === ColumnConstants.SORTING_ORDER.BREAKDOWN_SORT_ORDER.VALUE) {
                // measures don't make sense with breakdown
                secondary = '';
            } else {
                if (secondary === '' || isUndefined(secondary)) {
                    // default newly asc/desc sort order to use first column
                    secondary = state.columns[0].columnKey;
                }
            }

            let primary: string;
            if (key === 'secondary' && value !== '' && !isUndefined(secondary)) {
                // default newly selected measure to descending
                primary = ColumnConstants.SORTING_ORDER.DESC_SORT_ORDER.VALUE;
            } else {
                primary = value;
            }

            const update = {
                ...state,
                sortBySelectionList: set([...state.sortBySelectionList], `[${index}]`, primary),
                measureSelectionList: set([...state.measureSelectionList], `[${index}]`, secondary)
            };

            if (!isEqual(state, update)) {
                return update;
            }

            return state;
        });
    }
}
