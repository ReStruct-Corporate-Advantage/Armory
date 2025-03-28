import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MultiManagerColumnBreakdownComponent} from './multi-manager-column-breakdown.component';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {
    MultiManagerBreakdownModel
} from '@blk/explore-ui-breakdown';
import {BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';

describe('MultiManagerColumnBreakdownComponent', () => {
  let component: MultiManagerColumnBreakdownComponent;
  let fixture: ComponentFixture<MultiManagerColumnBreakdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultiManagerColumnBreakdownComponent]
    });
      fixture = TestBed.createComponent(MultiManagerColumnBreakdownComponent);
      component = fixture.componentInstance;
      component.decompositionModes = {
            'managerSelection': {
                'standAlone': [BreakdownFavoriteConstants.MM_XSR_BREAKDOWN, BreakdownFavoriteConstants.FACTOR_BREAKDOWN],
                'contribution': [BreakdownFavoriteConstants.BREAKDOWN, BreakdownFavoriteConstants.FACTOR_BREAKDOWN]
            }
      };
      component.multiManagerInputData = {
          decompositionMode: 'managerSelection',
          decompositionType: 'standAlone',
          breakdownType: 'FAC_BKD'
      } as MultiManagerBreakdownModel;

      fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component data', () => {
    component.multiManagerInputData = {
      decompositionMode: 'mode1',
      decompositionType: 'type1',
      breakdownType: 'breakdown1'
    } as MultiManagerBreakdownModel;
    component.initialize();
    expect(component.selectedDecompositionMode).toBe('mode1');
    expect(component.selectedDecompositionType).toBe('type1');
    expect(component.selectedBreakdownType).toBe('breakdown1');
  });

    it('should initialize component data for default data', () => {
        component.multiManagerInputData = null;
        component.initialize();
        expect(component.selectedDecompositionMode).toBe('none');
        expect(component.selectedBreakdownType).toBe('FAC_BKD');
    });

  it('should create decomposition mode options', () => {
    const options : ExploreSelectOptionGroup[] = component.createDecompositionModeOptions();
    expect(options[0]).toEqual(new ExploreSelectOptionGroup([new ExploreSelectOption('Manager Selection/Asset Allocation', 'managerSelection', true)]));
    expect(options.length).toBe(1);
  });

    it('should throw an error if decomposition modes are not available', () => {
        component.decompositionModes = {};
        expect(() => component.createDecompositionModeOptions()).toThrowError('Decomposition modes are not available.');
    });

  it('should create decomposition type options', () => {
      component.selectedDecompositionMode = 'managerSelection';
      const options = component.createDecompositionTypeOptions();
      expect(options.length).toBe(1);
      expect(options[0].values.length).toBe(2);
      expect(options[0]).toEqual(new ExploreSelectOptionGroup([new ExploreSelectOption('With standalone terms', 'standAlone', true), new ExploreSelectOption('With contribution terms', 'contribution', false)]));
  });

    it('should throw an error if decomposition modes are not available', () => {
        component.selectedDecompositionMode = 'abc';
        expect(() => component.createDecompositionTypeOptions()).toThrowError('Decomposition types are not available.');
    });

  it('should create breakdown type options', () => {
    component.widgetType = 'pgsWidget';
    component.selectedDecompositionMode = 'managerSelection';
    component.selectedDecompositionType = 'standAlone';
    const options = component.createBreakdownTypeOptions();
    expect(options.length).toBe(1);
    expect(options[0].values.length).toBe(2);
    expect(options[0]).toEqual(new ExploreSelectOptionGroup([new ExploreSelectOption('X Sigma-Rho Breakdown', BreakdownFavoriteConstants.MM_XSR_BREAKDOWN, false), new ExploreSelectOption('Factor Breakdown', 'FAC_BKD', true)]));
  });

   it('should throw an error if decomposition modes are null', () => {
    component.widgetType = 'pgsWidget';
    component.selectedDecompositionMode = 'managerSelection';
    component.selectedDecompositionType = 'abc';
    expect(() => component.createBreakdownTypeOptions()).toThrowError('Breakdown types are not available.');
});

  it('should handle decomposition mode change', () => {
      const event = { detail: { value: new ExploreSelectOption('type1', 'type1') } } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
      jest.spyOn(component.changedDecompositionMode, 'emit');
      jest.spyOn(component, 'createDecompositionTypeOptions').mockImplementation(() => null);
      component.onDecompositionModeChanged(event);
      expect(component.selectedDecompositionMode).toBe('type1');
      expect(component.changedDecompositionMode.emit).toHaveBeenCalledWith('type1');
  });

  it('should handle decomposition type change', () => {
    const event = { detail: { value: new ExploreSelectOption('type1', 'type1') } } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
    jest.spyOn(component.changedDecompositionType, 'emit');
      jest.spyOn(component, 'createBreakdownTypeOptions').mockImplementation(() => null);
    component.onDecompositionTypeChanged(event);
    expect(component.selectedDecompositionType).toBe('type1');
    expect(component.changedDecompositionType.emit).toHaveBeenCalledWith('type1');
  });

  it('should handle breakdown type change', () => {
      const event = { detail: { value: new ExploreSelectOption('type1', 'type1') } } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
      jest.spyOn(component.changedBreakdownType, 'emit');
      component.onBreakdownTypeChanged(event);
      expect(component.selectedBreakdownType).toBe('type1');
      expect(component.changedBreakdownType.emit).toHaveBeenCalledWith('type1');
  });

  it('should reset values', () => {
    component.resetValues();
    expect(component.selectedDecompositionType).toBeNull();
    expect(component.selectedBreakdownType).toBeNull();
    expect(component.decompositionTypeOptions).toBeNull();
    expect(component.breakdownTypeOptions).toBeNull();
  });
});
