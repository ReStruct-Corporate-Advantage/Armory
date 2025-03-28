import { ComponentFixture, TestBed } from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {CompareToCurrent} from '../../../../definition/models/override-date/compare-to-current.model';
import {OverrideDateConstants} from '../../../constants';
import {CompareToCurrentDateSettings} from '../../../models/override-date-settings/compare-to-current-date-settings.model';
import {MultiOverrideDateSettings} from '../../../models/override-date-settings/multi-override-date-settings.model';
import {OverrideDateSettings} from '../../../models/override-date-settings/override-date-settings.model';
import {DateService} from '../../../services/date.service';
import {CompareToCurrentComponent} from './compare-to-current.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';

describe('CompareToCurrentComponent', () => {
    let component: CompareToCurrentComponent;
    let fixture: ComponentFixture<CompareToCurrentComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CompareToCurrentComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: DateService}
            ]
        });

        fixture = TestBed.createComponent(CompareToCurrentComponent);
        component = fixture.componentInstance;
        component.overrideDateSettings = new OverrideDateSettings(['PRIOR_DAY', 'MONTH_END', 'CUSTOM'], '04/01/2020');
        component.compareToCurrentDateSettings = new CompareToCurrentDateSettings(OverrideDateConstants.COMPARE_TO_CURRENT);
        component.overrideDateSelectionSubject$ = new BehaviorSubject<boolean>(true);
        component.compareToCurrentDateTypes = [
            new CompareToCurrent({
                'value': 'NONE',
                'displayName': 'None'
            }),
            new CompareToCurrent({
                'value': 'COMPARE_TO_CURRENT',
                'displayName': 'Compare to Current'
            }),
            new CompareToCurrent({
                'value': 'PERCENTAGE_COMPARE_TO_CURRENT',
                'displayName': 'Percentage Compare to Current'
            }),
            new CompareToCurrent({
                'value': 'COMPARE_TO_CURRENT_ATTRIBUTION',
                'displayName': 'Compare to Current with Decomposition'
            }),
            new CompareToCurrent({
                'value': 'PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION',
                'displayName': 'Percentage Compare to Current with Decomposition'
            })
        ];
        component.createCompareToCurrentDateTypeOptions();
        fixture.detectChanges();
    });

    it('Test createCompareToCurrentDateTypeOptions', () => {
        // Set dateType to 'BOTH'
        component.dateType = OverrideDateConstants.VARY_BOTH;
        component.createCompareToCurrentDateTypeOptions();
        expect(component.supportedCompareToCurrentTypeOptions.length).toEqual(3);

        // Set dateType to 'EXPOSURE'
        component.dateType = OverrideDateConstants.FBA_DATE_VARY_TYPES.EXPOSURE[0];

        component.createCompareToCurrentDateTypeOptions();
        expect(component.supportedCompareToCurrentTypeOptions.length).toEqual(3);
    });

    it('Test OnChanges for saved date override option', () => {
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.COMPARE_TO_CURRENT;
        const changes: SimpleChanges = {
            compareToCurrentDateSettings: {
                currentValue: component.compareToCurrentDateSettings,
                previousValue: '',
                firstChange: true
            } as SimpleChange
        };
        component.ngOnChanges(changes);
        expect(component.supportedCompareToCurrentTypeOptions.length).toEqual(3);
    });

    it('Test OnChanges for Date Override options Switch', () => {
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.NONE_COMPARE_TO_CURRENT;
        const changes: SimpleChanges = {
            compareToCurrentDateSettings: {
                currentValue: component.compareToCurrentDateSettings,
                previousValue: '',
                firstChange: false
            } as SimpleChange
        };
        component.ngOnChanges(changes);
        expect(component.supportedCompareToCurrentTypeOptions.length).toEqual(3);
    });

    it('Test isCompareToCurrentApplicable', () => {
        component.compareToCurrentDateSettings.compareToCurrentValue = null;
        component.multiOverrideDateSettings = new MultiOverrideDateSettings('', 1, '04/01/2020', '04/10/2020');

        // Set overrideDateTypes to 0
        component.overrideDateSettings.overrideDateTypes = [];
        expect(component.isCompareToCurrentApplicable()).toBeFalsy();
        expect(component.compareToCurrentDateSettings.compareToCurrentValue).toEqual(OverrideDateConstants.NONE_COMPARE_TO_CURRENT);

        // Set overrideDateTypes to 1 but is 'CURRENT'
        component.overrideDateSettings.overrideDateTypes.push(OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT);
        expect(component.isCompareToCurrentApplicable()).toBeFalsy();

        // Set overrideDateTypes to 2
        component.overrideDateSettings.overrideDateTypes.push(OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY);
        expect(component.isCompareToCurrentApplicable()).toBeTruthy();

        // Set overrideDateTypes to 1 and is not 'CURRENT'
        component.overrideDateSettings.overrideDateTypes = [OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.MONTH_END];
        expect(component.isCompareToCurrentApplicable()).toBeTruthy();
    });

    it('Test onSelectionChanged', () => {
        // Create overrideDateTypes with 'CURRENT' and 'PRIOR_DAY'
        component.overrideDateSettings.overrideDateTypes = [OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT, OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY];

        jest.spyOn(component.compareToCurrentChanged, 'emit');
        // Set compare to current to be 'NONE'
        component.onSelectionChanged(OverrideDateConstants.NONE_COMPARE_TO_CURRENT);
        // OverrideDateTypes should not change
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT, OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Change compare to current to be 'COMPARE_TO_CURRENT_ATTRIBUTION'
        component.isDecompositionChecked=true;
        component.onSelectionChanged(OverrideDateConstants.COMPARE_TO_CURRENT);
        // OverrideDateTypes should change with 'CURRENT' removed
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Change compare to current to be 'PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION'
        component.isDecompositionChecked=true;
        component.onSelectionChanged(OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT);
        // OverrideDateTypes should change with 'CURRENT' removed
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Change compare to current to be 'COMPARE_TO_CURRENT_ATTRIBUTION'
        component.isDecompositionChecked=false;
        component.onSelectionChanged(OverrideDateConstants.COMPARE_TO_CURRENT);
        // OverrideDateTypes should change with 'CURRENT' removed
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Change compare to current to be 'PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION'
        component.isDecompositionChecked=false;
        component.onSelectionChanged(OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT);
        // OverrideDateTypes should change with 'CURRENT' removed
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);
        expect(component.compareToCurrentChanged.emit).toHaveBeenCalled();
    });

    it('Test onSelectDecomposition', () => {
        // Create overrideDateTypes with 'CURRENT' and 'PRIOR_DAY'
        component.overrideDateSettings.overrideDateTypes = [OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT, OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY];

        jest.spyOn(component.compareToCurrentChanged, 'emit');

        // Set compare to current to be 'NONE'
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.NONE_COMPARE_TO_CURRENT;
        component.onSelectedDecompositon(true);
        // OverrideDateTypes should not change
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT, OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Set compare to current to be 'COMPARE_TO_CURRENT'
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION;
        component.onSelectedDecompositon(false);       
        // OverrideDateTypes should not change
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT,OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Change compare to current to be 'PERCENTAGE_COMPARE_TO_CURRENT'
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION;
        component.onSelectedDecompositon(false);
        // OverrideDateTypes should change with 'CURRENT' removed
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT,OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Set compare to current to be 'COMPARE_TO_CURRENT'
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.COMPARE_TO_CURRENT;
        component.onSelectedDecompositon(true);
        // OverrideDateTypes should not change
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT,OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);

        // Change compare to current to be 'PERCENTAGE_COMPARE_TO_CURRENT'
        component.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT;
        component.onSelectedDecompositon(true);
        // OverrideDateTypes should change with 'CURRENT' removed
        expect(component.overrideDateSettings.overrideDateTypes).toEqual([OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT,OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.PRIOR_DAY]);
        expect(component.compareToCurrentChanged.emit).toHaveBeenCalled();
    });


});
