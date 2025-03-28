import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JobWidgetsComponent} from './job-widgets.component';
import {
    ExportHubJob,
    ExportHubJobWidget
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {GridApi} from 'ag-grid-community';

describe('JobWidgetsComponent', () => {
  let component: JobWidgetsComponent;
  let fixture: ComponentFixture<JobWidgetsComponent>;
  let mockScheduledJob: ExportHubJob;
  let mockWidget: ExportHubJobWidget;

  beforeEach(() => {
    mockScheduledJob = new ExportHubJob();
    mockWidget = new ExportHubJobWidget();
    mockWidget.setTitle('Test Widget');
    mockWidget.setWidgetDescription('Test Description');
    mockWidget.setWidgetType('Test Type');
    mockScheduledJob.addJobWidgets(mockWidget);

    TestBed.configureTestingModule({
      declarations: [JobWidgetsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JobWidgetsComponent);
    component = fixture.componentInstance;
    component.scheduledJob = mockScheduledJob;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid options and row data on init', () => {
    component.ngOnInit();
    expect(component.localWidgetConfigs.length).toBe(1);
    expect(component.rowData.length).toBe(1);
    expect(component.gridOptions).toBeDefined();
  });

  it('should set gridApi and size columns to fit on grid ready', () => {
    const mockGridApi = {
      sizeColumnsToFit: jest.fn()
    } as unknown as GridApi;
    component.gridOptions.onGridReady({ api: mockGridApi } as any);
    expect(component['gridApi']).toBe(mockGridApi);
    expect(mockGridApi.sizeColumnsToFit).toHaveBeenCalledWith({
      columnLimits: [{ key: 'actionButton', maxWidth: 40 }]
    });
  });

  it('should update widget description on cell value change', () => {
    component.ngOnInit();
    const colDefs = component.getColDefs();
    const notesColDef = colDefs.find(col => col.field === 'notes');
    const params = {
      newValue: 'Updated Description',
      oldValue: 'Test Description',
      node: { rowIndex: 0 }
    };
    notesColDef.onCellValueChanged(params);
    expect(component.localWidgetConfigs[0].getWidgetDescription()).toBe('Updated Description');
  });

  it('should not update widget description if value is unchanged', () => {
    component.ngOnInit();
    const colDefs = component.getColDefs();
    const notesColDef = colDefs.find(col => col.field === 'notes');
    const params = {
      newValue: 'Test Description',
      oldValue: 'Test Description',
      node: { rowIndex: 0 }
    };
    notesColDef.onCellValueChanged(params);
    expect(component.localWidgetConfigs[0].getWidgetDescription()).toBe('Test Description');
  });

    it('should update widget name on cell value change', () => {
        component.ngOnInit();
        const colDefs = component.getColDefs();
        const nameColDef = colDefs.find(col => col.field === 'widgetName');
        const params = {
            newValue: 'New Name',
            oldValue: 'Name',
            node: { rowIndex: 0 }
        };
        nameColDef.onCellValueChanged(params);
        expect(component.localWidgetConfigs[0].getTitle()).toBe('New Name');
    });

    it('should not update widget name if value is unchanged', () => {
        component.ngOnInit();
        const colDefs = component.getColDefs();
        const nameColDef = colDefs.find(col => col.field === 'widgetName');
        const params = {
            newValue: 'Test Widget',
            oldValue: 'Test Widget',
            node: { rowIndex: 0 }
        };
        nameColDef.onCellValueChanged(params);
        expect(component.localWidgetConfigs[0].getTitle()).toBe('Test Widget');
    });

  it('should delete job widget and update row data', () => {
      component.ngOnInit();
      const initialLength = component.localWidgetConfigs.length;
      const event = {node: {rowIndex: 0}} as any;
      component['gridApi'] = {updateGridOptions: jest.fn()} as unknown as GridApi;
      component['deleteJobWidget'](event);
      expect(component.localWidgetConfigs.length).toBe(initialLength - 1);
      expect(component.rowData.length).toBe(initialLength - 1);
  });
});
