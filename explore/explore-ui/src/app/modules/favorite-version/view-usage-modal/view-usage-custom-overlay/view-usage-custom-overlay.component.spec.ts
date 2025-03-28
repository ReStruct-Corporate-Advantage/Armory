import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewUsageCustomOverlayComponent } from './view-usage-custom-overlay.component';
import type {INoRowsOverlayParams} from 'ag-grid-community';

describe('ViewUsageCustomOverlayComponent', () => {
  let component: ViewUsageCustomOverlayComponent;
  let fixture: ComponentFixture<ViewUsageCustomOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewUsageCustomOverlayComponent]
    });
    fixture = TestBed.createComponent(ViewUsageCustomOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with agInit', () => {
    let params: INoRowsOverlayParams & { noRowsMessageFunc: () => string };

    component.agInit(params);

    expect(component.refresh).toHaveBeenCalled;
    // Add any other assertions based on your agInit logic
  });
});
