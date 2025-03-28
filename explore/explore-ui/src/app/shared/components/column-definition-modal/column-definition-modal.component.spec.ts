import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnDefinitionModalComponent} from './column-definition-modal.component';
import {ColumnConfig, ColumnConstants, UseType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {CustomTitleColumnOption, LibColumnUtils} from '@blk/explore-ui-column-option';

describe('ColumnDefinitionModalComponent', () => {
    let component: ColumnDefinitionModalComponent;
    let fixture: ComponentFixture<ColumnDefinitionModalComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ColumnDefinitionModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ColumnDefinitionModalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        component.column = ColumnConfig.createColumn(ColumnConstants.CUSIP, UseType.ALL);
        const customTitleColOption = new CustomTitleColumnOption();
        customTitleColOption.customTitle = 'title-cusip';
        component.column.optionValues.push(customTitleColOption);
        component.ngOnInit();
    });

    it('test closeModal ', () => {
        component.closeModal();
        expect(component.isOpen).toBeFalsy();
    });
});
