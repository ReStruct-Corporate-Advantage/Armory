import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { AuxSelectOption } from '@blk/aladdin-angular-components';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the correct event on value change', () => {
    const emitSpy = jest.spyOn(component.selectionChanged, 'emit');

    // Test single select case
    let mockEvent = {
        detail: {
            value: { value: 'testValue' } as AuxSelectOption
        }
    } as CustomEvent;

    component.onValueChange(mockEvent);
    expect(emitSpy).toHaveBeenCalledWith(mockEvent);

    // Test multi-select case
    mockEvent = {
        detail: {
            value: [{ value: 'testValue1' }, { value: 'testValue2' }] as AuxSelectOption[]
        }
    } as CustomEvent;

    component.onValueChange(mockEvent);
    expect(emitSpy).toHaveBeenCalledWith(mockEvent);
});
});
