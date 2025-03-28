import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {RxState} from '@rx-angular/state';
import { isEqual } from 'lodash';
import {combineLatest, Observable} from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

interface STATE {
    primaryData: AuxSelectOptionGroup;
    primarySelection: string;
    primaryExclusions: string[];
    secondaryData: AuxSelectOptionGroup;
    secondarySelection: string;
    secondaryExclusions: string[];
}

const DEFAULT: STATE = {
    primaryData: { values: [] },
    primarySelection: undefined,
    primaryExclusions: [],
    secondaryData: { values: [] },
    secondarySelection: undefined,
    secondaryExclusions: []
};

@Component({
    selector: 'app-axis-sort-selector',
    templateUrl: './axis-sort-selector.component.html',
    styleUrls: ['./axis-sort-selector.component.scss'],
    providers: [RxState]
})
export class AxisSortSelectorComponent {
    @Input() primaryTitle: string;
    @Input() primaryDisabled: boolean;
    @Input() set primaryData(primaryData: AuxSelectOptionGroup) { this.state.set({primaryData}); }
    @Input() set primarySelection(primarySelection: string) { this.state.set({primarySelection}); }
    @Input() set primaryExclusions(primaryExclusions: string[]) { this.state.set({primaryExclusions}); }

    @Input() secondaryTitle: string;
    @Input() secondaryDisabled: boolean;
    @Input() secondaryHidden: boolean;
    @Input() set secondaryData(secondaryData: AuxSelectOptionGroup) { this.state.set({secondaryData}); }
    @Input() set secondarySelection(secondarySelection: string) { this.state.set({secondarySelection}); }
    @Input() set secondaryExclusions(secondaryExclusions: string[]) { this.state.set({secondaryExclusions}); }

    @Output() stateChanged = new EventEmitter<any>();

    primaryData$ = this.createPipe$(
        this.state.select('primaryData'),
        this.state.select('primarySelection'),
        this.state.select('primaryExclusions')
    );

    secondaryData$ = this.createPipe$(
        this.state.select('secondaryData'),
        this.state.select('secondarySelection'),
        this.state.select('secondaryExclusions')
    );

    constructor(public state: RxState<STATE>) {
        this.state.set(DEFAULT);
    }

    createPipe$(data$: Observable<AuxSelectOptionGroup>, selection$: Observable<string>, exclusions$: Observable<string[]>) {
        return combineLatest([
            data$,
            selection$,
            exclusions$
        ]).pipe(
            map(([data, selection, exclusions]) => [{
                values: data.values
                    .filter(entry => !exclusions?.includes(entry.value))
                    .map(entry => ({
                        ...entry,
                        isSelected: selection === entry.value
                    }))
            }]),
            distinctUntilChanged(isEqual)
        );
    }

    updateSelection(key: string, value: string) {
        this.state.set(state => {
            const propertyName = `${key}Selection`;

            if (state[propertyName] !== value) {
                return { ...state, [propertyName]: value };
            }

            return state;
        });

        this.stateChanged.emit({key, value});
    }
}
