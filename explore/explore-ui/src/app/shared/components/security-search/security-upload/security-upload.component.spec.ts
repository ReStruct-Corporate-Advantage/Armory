import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SecurityUploadComponent} from './security-upload.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {ColumnConfig} from '@blk/explore-ui-core';
import {OptimizationConstants} from '@constants/optimization.constants';
import {ModellingType} from '@enums/modelling-type.enum';

describe('SecurityUploadComponent', () => {
    let component: SecurityUploadComponent;
    let fixture: ComponentFixture<SecurityUploadComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SecurityUploadComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SecurityUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.leafPortfolios = ['PORT-R', 'PORT-A', 'PORT-B'];
        component.rootPortfolio = 'PORT-R';
        jest.spyOn(component.securitiesUploaded, 'emit');
    });

    it('Test on Changes', () => {
        component.includeWeight = false;
        component.ngOnChanges({
            includeWeight: new SimpleChange(true, false, false)
        });
        expect(component.importConfig.dataFormat).toEqual(SecurityUploadComponent.IMPORT_DATA_FORMAT);
        component.includeWeight = true;
        component.selectedModelingColumn = new ColumnConfig({
            'columnTag': 'pct_notional_val',
            'positionColumnType': 'PORT',
            'columnKey': 'pct_notional_val',
            'columnTitle': 'Notional Market Value %'
        } as any);
        component.customColDef = OptimizationConstants.UPLOAD_ALPHA_SECURITY_SEARCH_COL_DEF;
        component.ngOnChanges({
            includeWeight: new SimpleChange(false, true, false)
        });
        expect(component.importConfig.dataFormat).toEqual(SecurityUploadComponent.IMPORT_DATA_FORMAT_UPLOAD_ALPHA);
        component.customColDef = OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING_COL_DEF;
        component.ngOnChanges({
            includeWeight: new SimpleChange(false, true, false)
        });
        expect(component.importConfig.dataFormat).toEqual(SecurityUploadComponent.IMPORT_DATA_FORMAT_UPLOAD_RISK_CONTRIBUTION_PCT);
        component.customColDef = null;
        component.ngOnChanges({
            includeWeight: new SimpleChange(false, true, false)
        });
        expect(component.importConfig.dataFormat).toEqual(SecurityUploadComponent.IMPORT_DATA_FORMAT_WITH_WEIGHTS_PCT);
    });

    describe('onDataUploaded tests', () => {
        it('should create securities from pasted cells', () => {
            const expectedOutput = new Map([
                ['037833100:PORT-A', {
                    'alpha': 0,
                    'currentValue': 0,
                    'cusip': '037833100',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 40,
                    'securityGroup': null,
                    'addToPortfolio': 'PORT-A',
                    'riskContributionPercentage': 0
                }],
                ['594918104', {
                    'alpha': 0,
                    'currentValue': 0,
                    'cusip': '594918104',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 30,
                    'securityGroup': null,
                    'addToPortfolio': 'PORT-R',
                    'riskContributionPercentage': 0
                }],
                ['WMT\\ US:PORT-C', {
                    'alpha': 0,
                    'riskContributionPercentage': 0,
                    'currentValue': 0,
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 30,
                    "sedol": "WMT\\ US",
                    'securityGroup': null,
                    'addToPortfolio': 'PORT-R'
                }]
            ]);
            component.onDataUploaded([['037833100', '40', 'PORT-A'], ['594918104', '30'], ['WMT US', '30', 'PORT-C']]);
            expect(component.securitiesUploaded.emit).toHaveBeenCalledWith({securities: expectedOutput, uploadType: undefined});
        });

        it('tests for create portfolios from pasted calls', () => {
            component.modellingType = ModellingType.PORTFOLIO;
            component.onDataUploaded([
                ['What-if BGIO 1 rule baseddd', 'WHATIF_RULES', 'ktalwar', '40,000'],
                ['ACPORT126_1', 'ADHOC_PORT', 'tushshar', '40000'],
                ['PEP', '20,000']
            ]);
            expect(component.securitiesUploaded.emit).toHaveBeenCalledWith({
                securities: new Map([
                    [
                        'What-if BGIO 1 rule baseddd',
                        {
                            'currentValue': 0,
                            'error': 'Portfolio not found',
                            'newValue': NaN,
                            'owner': 'ktalwar',
                            'portfolioType': '40,000',
                            'ticker': 'What-if BGIO 1 rule baseddd',
                        }
                    ],
                    [
                        'ACPORT126_1',
                        {
                            'currentValue': 0,
                            'error': 'Portfolio not found',
                            'newValue': NaN,
                            'owner': 'tushshar',
                            'portfolioType': '40000',
                            'ticker': 'ACPORT126_1',
                        }
                    ],
                    [
                        'PEP',
                        {
                            currentValue: 0,
                            error: 'Portfolio not found',
                            newValue: 20000,
                            owner: undefined,
                            portfolioType: undefined,
                            ticker: 'PEP',
                        }
                    ]
                ]),
                'uploadType': undefined
            });
        });
    });
});
