import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConstraintOptionCustomTitleComponent } from './constraint-option-custom-title.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    ColumnSet,
    CustomAggregationColumnOption, CustomCalculationColumnOption,
    CustomCalculationConstants,
    CustomTitleColumnOption
} from '@blk/explore-ui-column-option';
import {ColumnConfig, CommonUtils, Favorite, UseType} from '@blk/explore-ui-core';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {of, Subject} from 'rxjs';
import {Dictionary} from 'lodash';
import {TestUtils} from '@utils/test.utils';
import {Http2BmsService} from '@services/bms';
import {FavoriteService} from '@services/favorite';

describe('ConstraintOptionCustomTitleComponent', () => {
  let component: ConstraintOptionCustomTitleComponent;
  let fixture: ComponentFixture<ConstraintOptionCustomTitleComponent>;

    const httpServiceStub = {
        get$: jest.fn(() => of(null))
    };

    const colConfig = getColumnConfig();

    const favoriteServiceStub = {
        getFavorite$: jest.fn((id: number, isGlobalFavorite: boolean) => {
             return of(colConfig);
        }),
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConstraintOptionCustomTitleComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
          {provide: Http2BmsService, useValue: httpServiceStub},
          {provide: FavoriteService, useValue: favoriteServiceStub}
      ]
    });

    fixture = TestBed.createComponent(ConstraintOptionCustomTitleComponent);
    component = fixture.componentInstance;
    component.options = [
        {
            optionAttribute: {
                key: 'title',
                title: 'Title'
            },
             value$: of([])
        }
    ];
    component.optionValues$ = new Subject<Dictionary<any>>();
    component.optionValues$.next({
        key: ConstraintOptionTypeKey.CUSTOM_AGGREGATION,
        value: new CustomTitleColumnOption({customTitle: 'testTitle'})
    });
    component.columnConfig = new ColumnConfig(CustomCalculationConstants.CUSTOM_CALCULATION);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should set values on initialization', (done: any) => {
        component.loadCustomCalcColumn(1, 'test');
        expect(component.columnConfig).toEqual(colConfig);
        done();
    });

    it('should test saving and loading', (done: any) => {
        expect(component.columnConfig.columnTag).toEqual(CustomCalculationConstants.CUSTOM_CALCULATION);
        expect(component.optionMetaData).toBeDefined();
        expect(component.optionMetaData.columnOptionKey).toEqual(ConstraintOptionTypeKey.CUSTOM_TITLE);
        expect(component.optionMetaData.columnOptionAttributes.length).toEqual(1);
        expect(component.restrictedColumnOptions).toBeDefined();
        done();
    });

    function getColumnConfig(): ColumnConfig {
        const columnConfig = new ColumnConfig(CustomCalculationConstants.CUSTOM_CALCULATION);
        columnConfig.positionColumnType = UseType.ALL;
        const suffix = CommonUtils.generateUniqueIdAsString();
        columnConfig.columnKey = CustomCalculationConstants.CUSTOM_CALCULATION + '_' + suffix;
        columnConfig.columnTitle = 'testTitle';
        columnConfig.optionValues = [
            new CustomTitleColumnOption({customTitle: 'testTitle'}),
            new CustomAggregationColumnOption({colWeightType: 'NOTIONAL',
                excludeNullValues: true,
                subtotalType: 44,
                weightType: 'BENCH'}),
            new CustomCalculationColumnOption({expression: 'a'})
        ];
        return columnConfig;
    }
});
