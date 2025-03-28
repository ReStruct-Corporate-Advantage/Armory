import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  const dummyButtonLabel = 'Dummy Button Label';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ButtonComponent],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    component.label = dummyButtonLabel;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct label assigned to it', () => {
    expect(component.label).toEqual(dummyButtonLabel);
  });

  it('should emit an onClick event when clicked', () => {
    jest.spyOn(component.click, 'emit');
    const button = fixture.debugElement.query(By.css('aux-button')).nativeElement;
    button.click();
    expect(component.click.emit).toHaveBeenCalledTimes(1);
  });
});
