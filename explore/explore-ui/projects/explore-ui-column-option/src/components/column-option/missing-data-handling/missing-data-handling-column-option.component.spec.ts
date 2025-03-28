import {ColumnDefinition} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {UiColumnOptionService} from '../../../services/ui-column-option.service';
import {LibColumnUtils} from '../../../utils';
import {ColumnOptionTestBed} from '../../../test-utils';
import {MissingDataHandlingColumnOptionComponent} from './missing-data-handling-column-option.component';
import {MissingDataHandlingColumnOptionModel} from '../../../models/column-option/missing-data-handling-column-option.model';

describe('Missing Data Handling ColumnOption component test case', () => {
    let testBed: ColumnOptionTestBed<MissingDataHandlingColumnOptionComponent, MissingDataHandlingColumnOptionModel>;

    const uiColumnOptionServiceStub = {
        getOverrideDateSelection$: jest.fn( () => of())
    };

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockData = {
            missingDataHandling: 'applyDNTConstraint',
            columnOptionAttributes: [{
                defaultValue: {
                    value: 'applyDNTConstraint'
                },
                title: 'Missing Data Handling', values: [{
                    label: 'Apply DNT Constraint', value: 'applyDNTConstraint'
                }, {
                    label: 'Set Value to Zero', value: 'setValueZero'
                }]
            }]
        };

        const mockedColumnDef: ColumnDefinition = new ColumnDefinition();
        jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockImplementationOnce(() => {
            return mockedColumnDef;
        });

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<MissingDataHandlingColumnOptionComponent, MissingDataHandlingColumnOptionModel>(
            MissingDataHandlingColumnOptionComponent,
            new MissingDataHandlingColumnOptionModel(),
            mockData,
            null,
            null,
            null,
            null,
            [{provide: UiColumnOptionService, useValue: uiColumnOptionServiceStub}]
        );
    });

    it('should have aux-radio-group component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-radio-group')).not.toBe(null);
    });

    it('When the numeric stepper value will changed the value in the model should update', () => {
        const event = {eventData: 'setValueZero'};
        testBed.component.onRadioGroupChanged(event);
        expect(testBed.component.optionValue.missingDataHandling).toEqual('setValueZero');
    });
});
