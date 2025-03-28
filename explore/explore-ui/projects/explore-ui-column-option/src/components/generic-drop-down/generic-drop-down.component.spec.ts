import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input, Component } from '@angular/core';
import { GenericDropDownComponent } from './generic-drop-down.component';
import { ColumnOptionConstants } from '../../constants';

@Directive({
  selector: '[appGenericDropDown]'
})
class MockGenericDropDownDirective {
  @Input() option: any;
  @Input() title: string;
  @Input() isAggregation: boolean;
  @Input() docUrl: string;

  ngOnInit(): void {
    this.title = this.option.columnOptionAttributes[0].title;
    this.isAggregation = this.option.columnOptionAttributes[0].key === ColumnOptionConstants.AGGREGATION_TYPE;
  }

  openScenariosDocumentationLink(): void {
    window.open(this.docUrl, '_blank');
  }
}

@Component({
  template: `<div appGenericDropDown [option]="option"></div>`
})
class TestHostComponent {
  option: any;
}

describe('GenericDropDownComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: MockGenericDropDownDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockGenericDropDownDirective, TestHostComponent]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    directive = fixture.debugElement.children[0].injector.get(MockGenericDropDownDirective);
  });

  it('should set isAggregation to false when key is not AGGREGATION_TYPE', () => {
    hostComponent.option = {
      columnOptionAttributes: [{ title: 'Some Title', key: 'SomeKey' }]
    };
    fixture.detectChanges();
    expect(directive.isAggregation).toBeFalsy;
    expect(directive.title).toBe('Some Title');
  });

  it('should set isAggregation to true when key is AGGREGATION_TYPE', () => {
    hostComponent.option = {
      columnOptionAttributes: [{ title: 'Aggregation Title', key: ColumnOptionConstants.AGGREGATION_TYPE }]
    };
    fixture.detectChanges();
    expect(directive.isAggregation).toBeTruthy();
    expect(directive.title).toBe('Aggregation Title');
  });

  it('openScenariosDocumentationLink test', () => {
    window.open = jest.fn();
    directive.docUrl = 'https://dev.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf';
    directive.openScenariosDocumentationLink();
    expect(window.open).toHaveBeenCalledWith('https://dev.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf', '_blank');
  });
});