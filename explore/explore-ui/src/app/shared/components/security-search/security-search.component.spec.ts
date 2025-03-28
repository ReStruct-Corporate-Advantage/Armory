import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SecuritySearchComponent} from './security-search.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ICellRendererParams, RowNode, ValueFormatterParams, ValueSetterParams} from 'ag-grid-community';
import {AgGridModule} from 'ag-grid-angular';
import {Security} from '@interfaces/security.interface';
import {SecuritySearchItem} from '@interfaces/security-search-item.interface';
import {Observable, of} from 'rxjs';
import {SecuritySearchService} from '@services/security-search/security-search.service';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {ModellingType} from '@enums/modelling-type.enum';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {TestUtils} from '@utils/test.utils';
import {
    AddPortfolioTrackingParameters,
    ColumnConfig,
    ColumnConstants,
    DateValue,
    TelemetryActionConstants,
    TelemetryAddEntitiesParameters,
    TelemetryService,
    WayToAddSecurity
} from '@blk/explore-ui-core';
import {FavoriteService} from '@services/favorite';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {CompositionConstants} from '@constants/composition.constants';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {DesignateValueList} from '@interfaces/designate-value-list.interface';
import {NumberUtils} from '@utils/number.utils';
import {OptimizationConstants} from '@constants/optimization.constants';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {SecuritySearchTypeEnum} from '@enums/security-search-type.enum';
import {PortfolioService} from '@services/portfolio';

describe('SecuritySearchComponent', () => {
    let component: SecuritySearchComponent;
    let fixture: ComponentFixture<SecuritySearchComponent>;

    const securitySearchServiceStub = {
        searchSecurity$: jest.fn((): Observable<SecuritySearchItem[]> => {
            return of([
                {
                    cusip: '037833100',
                    description: 'APPLE INC',
                    securityGroup: 'EQUITY',
                    securityType: 'EQUITY',
                    ticker: 'AAPL',
                },
                {
                    cusip: '594918104',
                    description: 'MICROSOFT CORP C',
                    securityGroup: 'EQUITY',
                    securityType: 'EQUITY',
                    ticker: 'MSFT',
                },
            ]);
        }),
        updateDesignateValue$: jest.fn((): Observable<DesignateValueList> => {
            return of({'designateValue': '100.0',
                'securitySearchItems': [
                    {
                        cusip: '037833100',
                        description: 'APPLE INC',
                        securityGroup: 'EQUITY',
                        securityType: 'EQUITY',
                        ticker: 'AAPL',
                    },
                    {
                        cusip: '594918104',
                        description: 'MICROSOFT CORP C',
                        securityGroup: 'EQUITY',
                        securityType: 'EQUITY',
                        ticker: 'MSFT',
                    },
                ]} as unknown as DesignateValueList);
        })
    };

    const explorePortfolioSearchServiceStub = {
        searchPortfolio$: jest.fn((): Observable<any> => {
            return of({searchResults: []});
        }),
        enableWhatIfSearch: jest.fn(_a => {})
    };

    const favoriteServiceStub = {
        getFavorite$: jest.fn((): Observable<any> => {
            return of({});
        }),
        getSlimFavorites$: jest.fn((): Observable<any> => {
            return of([
                {
                    ticker: 'What-if SNP100 1',
                    owner: 'tushshar',
                    type: 'WHATIF_POS'
                }
            ]);
        })
    };

    let securitySearchItemMock: SecuritySearchItem;
    let securityMock: Security;

    let securitySearchItem1Mock: SecuritySearchItem;
    let security1Mock: Security;

    let securitySearchItem2Mock: SecuritySearchItem;
    let security2Mock: Security;

    let securitySearchItem3Mock: SecuritySearchItem;
    let security3Mock: Security;

    let securitySearchItem4Mock: SecuritySearchItem;
    let security4Mock: Security;

    let securitySearchItem5Mock: SecuritySearchItem;
    let security5Mock: Security;


    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AgGridModule],
            declarations: [SecuritySearchComponent],
            providers: [
                {provide: SecuritySearchService, useValue: securitySearchServiceStub},
                {provide: ExplorePortfolioSearchService, useValue: explorePortfolioSearchServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SecuritySearchComponent);
        component = fixture.componentInstance;

        component.selectedSecurities = new Map<string, Security>();

        component['gridApi'] = {};
        component['gridApi'].applyTransaction = jest.fn();
        component['gridApi'].sizeColumnsToFit = jest.fn();
        component['gridApi'].updateGridOptions = jest.fn();
        component['gridApi'].forEachNode = jest.fn();
        component['gridApi'].showLoadingOverlay = jest.fn();
        component['gridApi'].getRenderedNodes = () => [];
        component['gridApi'].setFocusedCell = jest.fn();
        component['gridApi'].updateGridOptions = jest.fn();

        securitySearchItemMock = {
            bbTicker: 'AAPL US',
            cusip: '037833100',
            description: 'APPLE INC',
            securityGroup: 'EQUITY',
            securityType: 'EQUITY',
            ticker: 'AAPL',
            sedol: '2046251',
        };

        securityMock = {
            cusip: '037833100',
            description: 'APPLE INC',
            securityGroup: 'EQUITY',
            currentValue: 0,
            newValue: 0,
            error: undefined
        };
        securitySearchItem1Mock = {
            bbTicker: '',
            cusip: '345370DA5',
            description: 'FORD MOTOR COMPANY 3.25 12-FEB-2032 (SENIOR)',
            isin: 'US345370DA55',
            securityGroup: 'BND',
            securityType: 'CORP',
            sedol: 'BPLHQR3',
            ticker: 'F',
        };

        security1Mock = {
            currentValue: 0,
            cusip: '345370DA5',
            description: 'FORD MOTOR COMPANY 3.25 12-FEB-2032 (SENIOR)',
            error: undefined,
            newValue: 0,
            securityGroup: 'BND'
        };

        securitySearchItem2Mock = {
            bbTicker: '',
            cusip: '74166MAF3',
            description: 'PRIME SECURITY SERVICES BORROWER L 3.375 31-AUG-2027 144a (SECURED)',
            isin: 'US74166MAF32',
            securityGroup: 'BND',
            securityType: 'CORP',
            sedol: 'BMFBJS2',
            ticker: 'PRSESE',
        };
        security2Mock = {
            currentValue: 0,
            cusip: '74166MAF3',
            description: 'PRIME SECURITY SERVICES BORROWER L 3.375 31-AUG-2027 144a (SECURED)',
            error: undefined,
            newValue: 0,
            securityGroup: 'BND'
        };
        securitySearchItem3Mock = {
            cusip: '0378331F0',
            description: 'APPLE INC',
            securityGroup: 'EQUITY',
            securityType: 'EQUITY',
            ticker: 'AAPL',
        };

        security3Mock = {
            cusip: '0378331F0',
            description: 'APPLE INC',
            securityGroup: 'EQUITY',
            currentValue: 0,
            newValue: 0,
            error: undefined
        };

        securitySearchItem4Mock = {
            cusip: '872350067',
            description: 'APPLE',
            securityGroup: 'EQUITY',
            securityType: 'EQUITY',
            ticker: 'AAFL',
            bbTicker: 'AAFL US',
        };

        security4Mock = {
            cusip: '872350067',
            description: 'APPLE',
            securityGroup: 'EQUITY',
            currentValue: 0,
            newValue: 0,
            error: undefined
        };

        securitySearchItem5Mock = {
            cusip: '594918104',
            description: 'MICROSOFT CORP C',
            securityGroup: 'EQUITY',
            securityType: 'EQUITY',
            ticker: 'MSFT',
        };

        security5Mock = {
            cusip: '594918104',
            description: 'MICROSOFT CORP C',
            securityGroup: 'EQUITY',
            currentValue: 0,
            newValue: 0,
            error: undefined
        };


        component.currentPortfolio = new WhatIfPortfolio('PEP');
        fixture.detectChanges();
    });

    it('should create security search component', () => {
        expect(component).toBeTruthy();
    });

    it('test initializeModelingColumns', () => {
        component.initializeModelingColumns();
        expect(component.selectedModelingColumn).toBeDefined();
        expect(component.modelingColumns[0].values.length).toBe(3);
    });

    describe('isharesModal tests', () => {
        it('open ishares modal', () => {
            component.openIsharesSelectorModal();
            expect(component.isIsharesSelectorModalOpen).toBe(true);
        });

        it('close modal without applying selections', () => {
            // setup data
            component.onSecuritySearchOptionChanged(SecuritySearchTypeEnum.FROM_ISHARES);
            component.openIsharesSelectorModal();

            component.closeIsharesSelectorModal(false);
            expect(component.isIsharesSelectorModalOpen).toBe(false);
            expect(component.ishareDefinitionsTree.length).toBe(0);
            expect((component.inputs?.get('columns') as ColumnSet).columns.length).toBe(0);
        });
    });

    describe('grid initialization tests', () => {
        it('should hide grid when there are no securities selected', () => {
            expect(component.showUploadList).toBe(false);
            expect(component.selectedSecurities.size).toBe(0);
            expect(fixture.debugElement.nativeElement.querySelector('aux-grid').hasAttribute('hidden')).toBe(true);
        });

        it('should show grid when there is a security selected', () => {
            component.addSecurity(securitySearchItemMock);
            fixture.detectChanges();

            expect(component.showUploadList).toBe(false);
            expect(component.selectedSecurities.size).toBe(1);
            expect(fixture.debugElement.nativeElement.querySelector('aux-grid').hasAttribute('hidden')).toBe(false);
        });
    });

    describe('grid cell renderer tests', () => {
        let paramsMock: ICellRendererParams;
        beforeEach(() => {
            paramsMock = {
                data: securityMock
            } as ICellRendererParams;
        });

        it('should render cusip cell without error icon when no error', () => {
            const cell = component['cusipCellRenderer'](paramsMock);
            expect(cell).toBeDefined();
        });

        it('should render cusip cell with error icon', () => {
            paramsMock.data.error = 'Security Error';
            const errorCell = component['cusipCellRenderer'](paramsMock);
            expect(errorCell).toBeDefined();
        });

        it('should create delete icon cell', () => {
            const cell = component['deleteCellRenderer'](paramsMock);
            expect(cell).toBeDefined();
        });
    });

    describe('grid callback function tests', () => {
        describe('percentageFormatter tests', () => {
            it('should format percentages to 4 decimals', () => {
                const paramsMock = {value: '12'} as ValueFormatterParams;
                expect(NumberUtils['numberColumnFormatter'](paramsMock)).toBe('12.0000');
            });
        });

        describe('percentageValueSetter tests', () => {
            it('should set value if it is a percentage', () => {
                const paramsMock = {
                    newValue: '12',
                    colDef: {
                        field: 'newValue'
                    },
                    data: {
                        newValue: 0
                    }
                } as ValueSetterParams;

                expect(NumberUtils['percentageValueSetter'](paramsMock)).toBe(true);
                expect(paramsMock.data.newValue).toBe(12);
            });
            it('should set value if it is a percentage when value is number', () => {
                const paramsMock = {
                    newValue: 12,
                    colDef: {
                        field: 'newValue'
                    },
                    data: {
                        newValue: 0
                    }
                } as ValueSetterParams;

                expect(NumberUtils['percentageValueSetter'](paramsMock)).toBe(true);
                expect(paramsMock.data.newValue).toBe(12);
            });
            it('should not set the value if it is not a percentage', () => {
                const paramsMock = {
                    newValue: 'abc',
                    colDef: {
                        field: 'newValue'
                    },
                    data: {
                        newValue: 0
                    }
                } as ValueSetterParams;

                expect(NumberUtils['percentageValueSetter'](paramsMock)).toBe(false);
                expect(paramsMock.data.newValue).toBe(0);
            });
        });
    });

    it('should resize grid on window resize', () => {
        jest.spyOn(component['gridApi'], 'sizeColumnsToFit');
        component.onResize();
        expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
    });

    describe('addSecurity tests', () => {
        beforeEach(() => {
            jest.spyOn(component['gridApi'], 'applyTransaction');
        });

        it('should add a security', () => {
            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            component.addSecurity(securitySearchItemMock);

            expect(component.selectedSecurities.size).toBe(1);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalledTimes(1);
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalledTimes(1);
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
        });

        it('should not call sizeColumnsToFit when adding security and expanded composition modelling', () => {
            component.expandModellingFlag = true;
            component.addSecurity(securitySearchItemMock);

            expect(component.selectedSecurities.size).toBe(1);
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalledTimes(0);
        });

        it('should not add a duplicate security', () => {
            component.addSecurity(securitySearchItemMock);
            component.addSecurity(securitySearchItemMock);

            expect(component.selectedSecurities.size).toBe(1);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalledTimes(1);
        });


        it('should add a security with notional market value from composition table', () => {
            component.modellingType = ModellingType.POSITION;
            component.currentPortfolio = new WhatIfPortfolio();
            component.currentPortfolio.composition = {
                data: {data: [null, 2, 3], children: [{data: ['037833100', 2, 3]}]},
                columns: ['cusip', 'pct_notional_val_after', 'pct_mv_after']
            };
            component.addSecurity(securitySearchItemMock);

            expect(component.selectedSecurities.size).toBe(1);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalledWith({
                    'add': [{
                        'addToPortfolio': 'PEP',
                        'currentValue': 200,
                        'cusip': '037833100',
                        'description': 'APPLE INC',
                        'error': undefined,
                        'newValue': 0,
                        'securityGroup': 'EQUITY',
                        'alpha': 0.0,
                        'riskContributionPercentage': 0,
                        'sedol' : '2046251',
                        'isin' : undefined
                    }]
                }
            );

            // delete the security now
            component.deleteSecurity({cusip: '037833100', addToPortfolio: 'PEP'} as any);
            expect(component.selectedSecurities.size).toBe(0);
        });

        it('should add a security with notional market value 0 if not present in composition table', () => {
            component.modellingType = ModellingType.POSITION;
            component.currentPortfolio = new WhatIfPortfolio();
            component.currentPortfolio.composition = {
                data: {data: ['037833101', 2, 3]},
                columns: ['cusip', 'pct_notional_val_after', 'pct_mv_after']
            };
            component.isCustomPortfolio = true;
            component.addSecurity(securitySearchItemMock);

            expect(component.telemetryCustomPortfolioStats.length).toBe(1);
            expect(component.telemetryCustomPortfolioStats[0].specificPortfolio).toBeUndefined();
            expect(component.selectedSecurities.size).toBe(1);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalledWith({
                    'add': [{
                        'addToPortfolio': 'PEP',
                        'currentValue': 0,
                        'cusip': '037833100',
                        'description': 'APPLE INC',
                        'error': undefined,
                        'newValue': 0,
                        'securityGroup': 'EQUITY',
                        'alpha': 0.0,
                        'riskContributionPercentage': 0,
                        'isin' : undefined,
                        'sedol' : '2046251'
                    }]
                }
            );
            component.isCustomPortfolio = false;
            const securitySearchItemNew = {
                cusip: '037833102',
                description: 'APPLE INC',
                securityGroup: 'EQUITY',
                securityType: 'EQUITY',
                ticker: 'AAPL',
            };
            component.addSecurity(securitySearchItemNew);
            expect(component.telemetryAddEntityStats.length).toBe(1);
            expect(component.telemetryAddEntityStats[0].specificPortfolio).toBeTruthy();
        });
    });

    describe('onModelingColumnChanged tests', () => {
        it('should update the grid colDef and data', () => {
            const event = {detail: {value: component.modelingColumns[0].values[1]}};
            component['gridApi'].getColumnDefs = jest.fn().mockReturnValue(component.getColDefs());
            component.onModelingColumnChanged(event as CustomEvent);
            expect(component.gridOptions.columnDefs.length).toBe(8);
        });

        it('should show the warning', () => {
            const event = {detail: {value: component.modelingColumns[0].values[1]}};
            component.selectedSecurities.set(securityMock.cusip, securityMock);
            jest.spyOn(component['notificationService'], 'openDialog');
            component.onModelingColumnChanged(event as CustomEvent);
            expect(component['notificationService'].openDialog).toHaveBeenCalled();
        });
    });

    it('test revertChanges', () => {
        component.selectedModelingColumn = component.modelingColumns[0].values[1].value;
        component.revertChanges();
        expect((component.modelingColumns[0].values.filter(option => option.isSelected)[0].value as ColumnConfig).columnTag).toBe(component.selectedModelingColumn.columnTag);
    });

    it('tests isInvalidSecuritiesPresent', () => {
        const securitiesMap = new Map([
            ['037833100', {
                'currentValue': 0,
                'cusip': '037833100',
                'description': null,
                'error': 'Security not found',
                'newValue': 40,
                'securityGroup': null
            }],
            ['594918104', {
                'currentValue': 0,
                'cusip': '594918104',
                'description': null,
                'error': null,
                'newValue': 30,
                'securityGroup': null
            }]
        ]);
        component.selectedSecurities = securitiesMap;
        expect(component.isInvalidSecuritiesPresent()).toBeTruthy();

        component.selectedSecurities.delete('037833100');
        expect(component.isInvalidSecuritiesPresent()).toBeFalsy();
    });


    describe('deleteSecurity/Securities tests', () => {
        it('should delete a single security', () => {
            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            jest.spyOn(component['gridApi'], 'applyTransaction');
            component.selectedSecurities.set(securityMock.cusip, securityMock);
            component.selectedSecurities.set('testCusip', securityMock);

            component.deleteSecurity(securityMock);

            expect(component.selectedSecurities.size).toBe(1);
            expect(component.selectedSecurities.has(securityMock.cusip)).toBeFalsy();
            expect(component['gridApi'].applyTransaction).toHaveBeenCalledTimes(1);
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
        });

        it('should delete all the securities', () => {
            jest.spyOn(component['gridApi'], 'updateGridOptions');
            component.selectedSecurities.set(securityMock.cusip, securityMock);
            component.selectedSecurities.set('testCusip', securityMock);
            jest.spyOn(component.changeInSelectedSecurities, 'emit');

            component.deleteAllSecurities();

            expect(component.selectedSecurities.size).toBe(0);
            expect(component['gridApi'].updateGridOptions).toHaveBeenCalledTimes(1);
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();

        });

        it('should delete all the invalid securities', () => {
            jest.spyOn(component['gridApi'], 'updateGridOptions');
            component.selectedSecurities.set(securityMock.cusip, securityMock);
            component.selectedSecurities.set('testCusip', {
                cusip: '037833100',
                description: 'APPLE INC',
                securityGroup: 'EQUITY',
                currentValue: 0,
                newValue: 0,
                error: 'Analytics not found'
            });
            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            jest.spyOn(component, 'deleteSecurity');

            component.deleteAllSecurities(true);

            expect(component.deleteSecurity).toHaveBeenCalled();
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();

        });
    });

    it('should toggle upload list', () => {
        component.showUploadList = false;
        component.toggleUploadList();
        expect(component.showUploadList).toBe(true);
    });

    describe('validateAndAddSecurities test', () => {

        it('should validate and then add securities to the grid', () => {
            const seucritiesMap = new Map([
                ['037833100', {
                    'currentValue': 0,
                    'cusip': '037833100',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 40,
                    'securityGroup': null
                }],
                ['594918104', {
                    'addToPortfolio': 'PORT-A',
                    'currentValue': 0,
                    'cusip': '594918104',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 30,
                    'securityGroup': null
                }]
            ]);

            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            component.validateAndAddSecurities(seucritiesMap);
            expect(component.selectedSecurities.size).toBe(2);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalled();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
            expect(component.telemetryAddEntityStats[0].specificPortfolio).toBeTruthy();
        });

        it('should validate, calculate NAV and then add securities to the grid', () => {
            const seucritiesMap = new Map([
                ['037833100', {
                    'currentValue': 0,
                    'cusip': '037833100',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 40,
                    'securityGroup': null
                }],
                ['594918104', {
                    'currentValue': 0,
                    'cusip': '594918104',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 30,
                    'securityGroup': null
                }]
            ]);

            component.validateAndAddSecurities(seucritiesMap, WayToAddSecurity.COPY_PASTE_SECURITIES);
            expect(securitySearchServiceStub.updateDesignateValue$).not.toHaveBeenCalled();
            component.adhocPortParams = new AdhocPortParams();
            component.adhocPortParams.date = new DateValue();
            component.adhocPortParams.date.date = '09/04/2018';
            component.validateAndAddSecurities(seucritiesMap, WayToAddSecurity.COPY_PASTE_SECURITIES);
            expect(securitySearchServiceStub.updateDesignateValue$).not.toHaveBeenCalled();
            component.isDesignateValueCalculated = true;
            component.selectedModelingColumn.columnTag = ColumnConstants.CUR_FACE;
            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            component.validateAndAddSecurities(seucritiesMap, WayToAddSecurity.COPY_PASTE_SECURITIES);
            expect(component.selectedSecurities.size).toBe(2);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalled();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
        });

        it('should validate and then add securities to the grid with correct current value', () => {
            const seucritiesMap = new Map([
                ['037833100', {
                    'currentValue': 0,
                    'cusip': '037833100',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 40,
                    'securityGroup': null
                }],
                ['594918104', {
                    'currentValue': 0,
                    'cusip': '594918104',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 30,
                    'securityGroup': null
                }]
            ]);
            component.currentPortfolio.composition = {
                data: {data: [null, 2, 3], children: [{data: ['594918104', 2, 3]}]},
                columns: ['cusip', 'pct_notional_val_after', 'pct_mv_after']
            };
            component.modellingType = ModellingType.POSITION;
            component.isCustomPortfolio = false;

            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            component.validateAndAddSecurities(seucritiesMap);
            expect(component.selectedSecurities.size).toBe(2);
            expect(component.selectedSecurities.get('594918104').currentValue).toBe(2);
            expect(component.selectedSecurities.get('037833100').currentValue).toBe(0);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalled();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
        });


        it('should not add invalid securities to the selected list', () => {
            const invalidSecurityMap = new Map([
                ['037833100', {
                    'currentValue': 0,
                    'cusip': '037833100',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 40,
                    'securityGroup': null
                }],
                ['0i1n9v9l99', {
                    'currentValue': 0,
                    'cusip': '0i1n9v9l99',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 10,
                    'securityGroup': null
                }]
            ]);

            component.validateAndAddSecurities(invalidSecurityMap);
            expect(component.selectedSecurities.size).toBe(1);
            expect(component.selectedSecurities.has('037833100')).toBe(true);
            expect(component.selectedSecurities.get('037833100').description).toBe('APPLE INC');
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
        });

        it('upload Alpha: should validate and then add securities to the grid', () => {
            const securitiesMap = new Map([
                ['037833100', {
                    'cusip': '037833100',
                    'alpha': 40
                }],
                ['594918104', {
                    'cusip': '594918104',
                    'alpha': 30
                }]
            ]);
            component.isUploadAlpha = true;
            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            component.validateAndAddSecurities(securitiesMap);
            expect(component.selectedSecurities.size).toBe(2);
            expect(component['gridApi'].applyTransaction).toHaveBeenCalled();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
        });

        it('upload Alpha: should not add invalid securities to the selected list', () => {
            const securitiesMap = new Map([
                ['037833100', {
                    'cusip': '037833100',
                    'alpha': 0.0
                }],
                ['594918104', {
                    'cusip': '594918104',
                    'alpha': 30
                }],
                ['643516541', {
                    'cusip': '643516541',
                    'newValue': 30
                }]
            ]);

            component.isUploadAlpha = true;
            component.validateAndAddSecurities(securitiesMap);
            console.log(component.selectedSecurities);
            expect(component.selectedSecurities.size).toBe(2);
            expect(component.selectedSecurities.has('594918104')).toBe(true);
            expect(component.selectedSecurities.get('594918104').alpha).toBe(30);
            expect(component.selectedSecurities.has('037833100')).toBe(true);
            expect(component.selectedSecurities.get('037833100').alpha).toBe(0.0);
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
        });

        it('should add portfolios', () => {
            component.modellingType = ModellingType.PORTFOLIO;
            const portfolios = new Map([
                ['POS BASED ILB3', {
                    'owner': 'tushshar',
                    'currentValue': 0,
                    'portfolioType': 'POINT_IN_TIME',
                    'ticker': 'POS BASED ILB3',
                    'error': 'Portfolio not found',
                    'newValue': 40
                }],
                ['PEP', {
                    'currentValue': 0,
                    'ticker': 'PEP',
                    'error': 'Portfolio not found',
                    'newValue': 60
                }]
            ]);

            component.validateAndAddSecurities(portfolios);
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
        });

        it('tests callback after adding portfolios', () => {
            const prodPortfolios = [
                [
                    'PEP',
                    {
                        'error': 'Portfolio not found',
                        'ticker': 'PEP',
                        'currentValue': 0,
                        'newValue': 20
                    }
                ],
                [
                    'BGIORTY',
                    {
                        'error': 'Portfolio not found',
                        'ticker': 'BGIORTY',
                        'currentValue': 0,
                        'newValue': 10
                    }
                ]
            ];

            const whatIfPortfolios = [
                [
                    'What-if BGIO 1 rule baseddd',
                    {
                        'error': 'Portfolio not found',
                        'ticker': 'What-if BGIO 1 rule baseddd',
                        'owner': 'ktalwar',
                        'portfolioType': 'WHATIF_RULES',
                        'currentValue': 0,
                        'newValue': 40
                    }
                ],
                [
                    'ACPORT126_1',
                    {
                        'error': 'Portfolio not found',
                        'ticker': 'ACPORT126_1',
                        'owner': 'tushshar',
                        'portfolioType': 'ADHOC_PORT',
                        'currentValue': 0,
                        'newValue': 50
                    }
                ],
                [
                    'What-if X-83-RO-AG 2dfdfdf PIT',
                    {
                        'error': 'Portfolio not found',
                        'ticker': 'What-if X-83-RO-AG 2dfdfdf PIT',
                        'owner': 'tushshar',
                        'portfolioType': 'WHATIF_POS',
                        'currentValue': 0,
                        'newValue': 6
                    }
                ],
                [
                    'What-if X-83-RO-AG 2 PIT',
                    {
                        'error': 'Portfolio not found',
                        'ticker': 'What-if X-83-RO-AG 2 PIT',
                        'owner': 'tushshar',
                        'portfolioType': 'WHATIF_RULES',
                        'currentValue': 0,
                        'newValue': 7
                    }
                ]
            ];

            const prodPorts = {
                'searchResults': [
                    {
                        'fullName': 'BGF Pacific Equity Fund',
                        'currency': 'USD',
                        'ticker': 'PEP',
                        'code': 9214,
                        'type': 'COMM',
                        'CLASS_TYPE': 'com.bfm.prism.portfolio.PortfolioSearchItem'
                    }
                ]
            };

            const whatIfPorts = [
                {
                    'tool': 'Explore_BETA',
                    'title': 'What-if BGIO 1 rule baseddd',
                    'type': 'WHATIF_RULES',
                    'id': 2473688,
                    'listOrder': 1,
                    'owner': 'ktalwar',
                    'description': 'BGIO',
                    'flagid': {
                        'id': 2473688,
                        '_global': false
                    }
                },
                {
                    'tool': 'Explore_BETA',
                    'title': 'ACPORT126_1',
                    'type': 'ADHOC_PORT',
                    'id': 2135391,
                    'listOrder': 4,
                    'owner': 'tushshar',
                    'description': 'ACPORT126_1-#-09/04/2018',
                    'flagid': {
                        'id': 2135391,
                        '_global': false
                    }
                },
                {
                    'tool': 'Explore_BETA',
                    'title': 'What-if X-83-RO-AG 2 PIT',
                    'type': 'WHATIF_POS',
                    'id': 2502463,
                    'listOrder': 0,
                    'owner': 'tushshar',
                    'description': 'X-83-RO-AG-#-09/04/2020',
                    'flagid': {
                        'id': 2502463,
                        '_global': false
                    }
                },
                {
                    'tool': 'Explore_BETA',
                    'title': 'What-if X-83-RO-AG 2 PIT',
                    'type': 'WHATIF_RULES',
                    'id': 2502464,
                    'listOrder': 3,
                    'owner': 'tushshar',
                    'description': 'X-83-RO-AG',
                    'flagid': {
                        'id': 2502464,
                        '_global': false
                    }
                }
            ];

            jest.spyOn(component['notificationService'], 'error');

            component.currentPortfolio.datePicker = new DateValue({date: '20230506'});
            component['addPortfoliosAfterInfoFetch'](new Map(prodPortfolios as any), new Map(whatIfPortfolios as any), prodPorts, whatIfPorts as any);
            expect(component['notificationService'].error).toBeCalledTimes(2);

            component.currentPortfolio.datePicker = new DateValue();
            component.adhocPortParams = new AdhocPortParams();
            component.adhocPortParams.date = new DateValue({date: '20230506'});
            component['addPortfoliosAfterInfoFetch'](new Map(prodPortfolios as any), new Map(whatIfPortfolios as any), prodPorts, whatIfPorts as any);
            expect(component['notificationService'].error).toBeCalledTimes(4);
        });
    });

    describe('getAfterColumnName test', () => {

        it('should return correct column name according to the input', () => {
            expect(component.getAfterColumnName('Security')).toBe('newNotionalPct');
            expect(component.getAfterColumnName('Portfolio')).toBe('pct_nav_group_after');
        });
    });

    describe('getItemType test', () => {

        it('should return correct item type', () => {
            component.modellingType = 2;
            expect(component.getItemType()).toBe('Portfolio');

            component.modellingType = 1;
            expect(component.getItemType()).toBe('Security');
        });
    });

    describe('Convert table to rules test', () => {

        it('should convert table to rules', () => {
            component.currentPortfolio = new WhatIfPortfolio();
            component.currentPortfolio.modellingType = 0;
            component.modellingType = 1; // setting the modeling type to 'POSITION'
            const rowNode1 = new RowNode();
            rowNode1.data = {
                currentValue: 0,
                cusip: '10138MAC9',
                description: 'PEPSI BOTTLING GROUP INC 4.125 15-JUN-2015 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
            const rowNode2 = new RowNode();
            rowNode2.data = {
                currentValue: 0,
                cusip: '033609AB4',
                description: 'ANDERSON, CLAYTON & CO. 4.25 31-JUL-1998 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
            const validRowNodes = [rowNode1, rowNode2];
            const expectedResult = component.convertTableToRules(validRowNodes);
            expect(expectedResult).toEqual([
                {
                    'lineItem': '10138MAC9',
                    'newWeight': 0,
                    'ruleType': 'Security',
                    'ruleUnit': 'PERCENT_NAV',
                    'savable': false
                },
                {
                    'lineItem': '033609AB4',
                    'newWeight': 0,
                    'ruleType': 'Security',
                    'ruleUnit': 'PERCENT_NAV',
                    'savable': false
                }]);
        });
    });

    describe('Convert rowNodeSplitByError test', () => {

        it('should split node in error nodes and valid nodes', () => {
            jest.spyOn(component['gridApi'], 'forEachNode');
            component.getRowNodesSplitByErrors();
            expect(component['gridApi'].forEachNode).toHaveBeenCalled();
        });
    });

    describe('Convert TableToMap test', () => {

        it('should convert table to a map', () => {
            const rowNode1 = new RowNode();
            rowNode1.data = {
                currentValue: 0,
                cusip: '10138MAC9',
                description: 'PEPSI BOTTLING GROUP INC 4.125 15-JUN-2015 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
            const rowNode2 = new RowNode();
            rowNode2.data = {
                currentValue: 0,
                cusip: '033609AB4',
                description: 'ANDERSON, CLAYTON & CO. 4.25 31-JUL-1998 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
            const validRowNodes = [rowNode1, rowNode2];
            const expectedResult = component.convertTableToMap(validRowNodes);
            expect(expectedResult.get('033609AB4')).toBe(rowNode2);
            expect(expectedResult.get('10138MAC9')).toBe(rowNode1);
            expect(expectedResult.size).toBe(2);
        });
    });

    describe('ApplySecurities test', () => {

        it('should apply securities to composition table', () => {
            component.currentPortfolio = new WhatIfPortfolio();
            component.currentPortfolio.modellingType = 1;
            component.expandModellingFlag = false;
            jest.spyOn(component['gridApi'], 'showLoadingOverlay');
            jest.spyOn(component, 'getRowNodesSplitByErrors');
            jest.spyOn(component, 'convertTableToRules');
            jest.spyOn(component, 'convertTableToMap');
            component.applySecurities(ModellingType.POSITION);
            expect(component['gridApi'].showLoadingOverlay).toHaveBeenCalled();
            expect(component.getRowNodesSplitByErrors).toHaveBeenCalled();
            expect(component.convertTableToRules).toHaveBeenCalled();
            expect(component.convertTableToMap).toHaveBeenCalled();
            expect(component.telemetryAddEntityStats.length).toBe(0);
        });

        it('test apply securities for adhoc portfolio', () => {
            component.createFromScratch = true;
            jest.spyOn(component['gridApi'], 'showLoadingOverlay');
            jest.spyOn(component, 'getRowNodesSplitByErrors');
            jest.spyOn(component, 'convertTableToRules');
            jest.spyOn(component, 'convertTableToMap');
            component.applySecurities(ModellingType.POSITION);
            expect(component['gridApi'].showLoadingOverlay).toHaveBeenCalled();
            expect(component.getRowNodesSplitByErrors).toHaveBeenCalled();
            expect(component.convertTableToRules).not.toHaveBeenCalled();
            expect(component.convertTableToMap).toHaveBeenCalled();
        });
    });

    describe('Update Security Table test', () => {
        let rule1;
        let rule2;
        let rule3;
        let rowNode1;
        let rowNode2;
        let rowNode3;

        beforeEach(() => {
            rule1 = new SecurityRule('033609AB4', 0);
            rule2 = new SecurityRule('10138MAC9', 0);
            rule3 = new SecurityRule('033609ABC', 0);
            rowNode1 = new RowNode();
            rowNode1.data = {
                currentValue: 0,
                cusip: '10138MAC9',
                description: 'PEPSI BOTTLING GROUP INC 4.125 15-JUN-2015 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
            rowNode2 = new RowNode();
            rowNode2.data = {
                currentValue: 0,
                cusip: '033609AB4',
                description: 'ANDERSON, CLAYTON & CO. 4.25 31-JUL-1998 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
            rowNode3 = new RowNode();
            rowNode3.data = {
                currentValue: 0,
                cusip: '033609ABC',
                description: 'ANDERSON, CLAYTON & CO. 4.25 31-JUL-1999 (SENIOR)',
                error: undefined,
                newValue: 0,
                securityGroup: 'BND'
            };
        });

        it('should update security table with skipped securities or error securities', () => {
            component.currentPortfolio = new WhatIfPortfolio();
            component.splitRowNodes = [[], []];
            jest.spyOn(component, 'deleteAllSecurities');
            component.currentPortfolio.skippedRulesForEachDate = [rule1, rule2];
            component.splitRowNodes[1] = [rowNode3];
            const validRowNodes = [rowNode1, rowNode2];
            component.tableMap = component.convertTableToMap(validRowNodes);
            component.updateSecurityTable();
            expect(component['gridApi'].applyTransaction).toHaveBeenCalled();
            expect(component.deleteAllSecurities).toHaveBeenCalled();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalledTimes(1);

            component.expandModellingFlag = true;
            component.updateSecurityTable();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalledTimes(1);
        });

        it('should open notification dialog when skipped securities or error securities', (done) => {
            component.currentPortfolio = new WhatIfPortfolio();
            component.splitRowNodes = [[], []];
            jest.spyOn(component, 'deleteAllSecurities');
            jest.spyOn(component['notificationService'], 'openDialog').mockImplementation(() => {});
            component.currentPortfolio.skippedRulesForEachDate = [rule1, rule2];
            component.splitRowNodes[1] = [rowNode3];
            const validRowNodes = [rowNode1, rowNode2];
            component.tableMap = component.convertTableToMap(validRowNodes);
            component.updateSecurityTable();
            setTimeout(function() {
                expect(component['notificationService'].openDialog).toHaveBeenCalledTimes(1);
                done();
            }, 20);
        });

        it('should update security table when processed and skipped rules are defined', () => {
            jest.spyOn(component, 'deleteAllSecurities');
            component.splitRowNodes = [[], []];
            const validRowNodes = [rowNode1, rowNode2, rowNode3];
            component.tableMap = component.convertTableToMap(validRowNodes);
            component.updateSecurityTable({skippedRules: [rule1, rule2], processedRules: [rule3]});
            expect(component.deleteAllSecurities).toHaveBeenCalled();
            expect(component['gridApi'].applyTransaction).toHaveBeenCalled();
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalledTimes(1);
        });
    });

    it('tests ngOnChanges', () => {
        jest.spyOn(component.clearSecurities, 'emit');
        jest.spyOn(component, 'getColDefs');

        // scenario 0 - no changes in portfolio, gridApi is defined
        component.ngOnChanges({});
        expect(component.clearSecurities.emit).not.toHaveBeenCalled();
        expect(component.getColDefs).not.toHaveBeenCalled();

        // scenario 1 - changes in portfolio, gridApi is undefined
        component['gridApi'] = undefined;
        component.ngOnChanges({currentPortfolio: {}} as any);
        expect(component.clearSecurities.emit).not.toHaveBeenCalled();
        expect(component.getColDefs).not.toHaveBeenCalled();

        // scenario 2 - gridApi is defined with required api methods & modelling type is not changed
        component['gridApi'] = {
            updateGridOptions: () => {}
        } as any;

        jest.spyOn(component['gridApi'], 'updateGridOptions');

        component.selectedSecurities.set('dfd454', {cusip: 'dfd454', description: 'security_1', currentValue: 2, newValue: 5});
        component.ngOnChanges({currentPortfolio: {}} as any);
        expect(component.clearSecurities.emit).toHaveBeenCalled();
        expect(component['gridApi'].updateGridOptions).toHaveBeenCalled();
        expect(component.getColDefs).not.toHaveBeenCalled();

        // scenario 3 - gridApi is defined with required api methods & modelling type is portfolio
        component.selectedSecurities.set('dfd454', {cusip: 'dfd454', description: 'security_1', currentValue: 2, newValue: 5});
        component.ngOnChanges({currentPortfolio: {}, modellingType: ModellingType.PORTFOLIO} as any);
        expect(component.clearSecurities.emit).toHaveBeenCalled();
        expect(component['gridApi'].updateGridOptions).toHaveBeenCalled();
        expect(component.getColDefs).toHaveBeenCalled();
    });

    it('tests getColDefs', () => {
        let columnDefs = component.getColDefs();
        expect(columnDefs[0].headerName).toEqual('Security');
        expect(columnDefs[1].headerName).toBeUndefined();
        expect(columnDefs[2]['hide']).toBeFalsy();
        expect(columnDefs[3].headerName).toEqual('SEDOL');
        expect(columnDefs[4].headerName).toEqual('ISIN');
        expect(columnDefs[5].headerName).toEqual('Add to Portfolio');
        expect(columnDefs[6].headerName).toEqual('Notional Market Value %');

        component.modellingType = ModellingType.PORTFOLIO;
        columnDefs = component.getColDefs();
        expect(columnDefs[0].headerName).toEqual('Portfolio');
        expect(columnDefs[1].headerName).toEqual('Portfolio Name');
        expect(columnDefs[2]['hide']).toBeTruthy();
        expect(columnDefs[3]['hide']).toBeTruthy();
        expect(columnDefs[4]['hide']).toBeTruthy();
        expect(columnDefs[5].headerName).toEqual('Add to Portfolio');
        expect(columnDefs[6].headerName).toEqual('NAV Contribution %');

        component.customColDef = OptimizationConstants.UPLOAD_ALPHA_SECURITY_SEARCH_COL_DEF;
        component.modellingType =  ModellingType.POSITION;
        columnDefs = component.getColDefs();
        expect(columnDefs[0]['field']).toEqual('cusip');
        expect(columnDefs[0]['hide']).toBeFalsy();
        expect(columnDefs[1]['field']).toEqual('description');
        expect(columnDefs[1]['hide']).toBeFalsy();
        expect(columnDefs[2]['field']).toEqual('securityGroup');
        expect(columnDefs[2]['hide']).toBeFalsy();
        expect(columnDefs[3]['field']).toEqual('sedol');
        expect(columnDefs[3]['hide']).toBeTruthy();
        expect(columnDefs[4]['field']).toEqual('isin');
        expect(columnDefs[4]['hide']).toBeTruthy();
        expect(columnDefs[5].headerName).toEqual('Add to Portfolio');
        expect(columnDefs[5]['hide']).toBeTruthy();
        expect(columnDefs[6].headerName).toEqual('Notional Market Value %');
        expect(columnDefs[6]['hide']).toBeFalsy();
        expect(columnDefs[7].headerName).toEqual('Alpha');
    });

    it('tests getNotionalColumnDefs', () => {
        component.isCustomPortfolio = true;
        let notionalColumnDefs = component.getDefaultModelingColumnDefs();
        expect(notionalColumnDefs.children[0]['hide']).toBeTruthy();
        expect(notionalColumnDefs.headerName).toEqual('Notional Market Value %');

        component.isCustomPortfolio = false;
        component.modellingType = ModellingType.PORTFOLIO;
        notionalColumnDefs = component.getDefaultModelingColumnDefs();
        expect(notionalColumnDefs.children[0]['hide']).toBeFalsy();

        // produces a colDef and not a colGroupDef
        component.isCustomPortfolio = true;
        notionalColumnDefs = component.getDefaultModelingColumnDefs();
        expect(notionalColumnDefs).toBeDefined();
        expect(notionalColumnDefs.children).toBeUndefined();
    });

    test('getColDefs createFromScratch', () => {
        component.createFromScratch = true;
        const columnDefs = component.getColDefs();
        expect(columnDefs[0].headerName).toEqual('Security');
        expect(columnDefs.length).toEqual(7);
    });

    it('tests isValidNameForWhatIfToBeAdded', () => {
        const newPortChange1: NewPortfolioHoldingChange = new NewPortfolioHoldingChange();
        newPortChange1.title = 'A';

        component.currentPortfolio = new WhatIfPortfolio();
        component.currentPortfolio.holdingChanges = [newPortChange1];

        jest.spyOn(component['notificationService'], 'openDialog').mockImplementation(() => {});

        // prompt shown
        component['isValidNameForWhatIfToBeAdded'](new PortfolioSearchItem(null, 'A'));
        expect(component['notificationService'].openDialog).toHaveBeenCalledTimes(1);

        // prompt not shown
        component['isValidNameForWhatIfToBeAdded'](new PortfolioSearchItem(null, 'B'));
        expect(component['notificationService'].openDialog).toHaveBeenCalledTimes(1);
    });

    it('tests addPortfolio', () => {
        // scenario 1 - record present in selectedSecurities
        component['gridApi'] = {
            applyTransaction: () => {}
        } as any;
        jest.spyOn(component['gridApi'], 'applyTransaction');
        component.selectedSecurities.set('a-#-123', {cusip: 'a', description: 'security_1', currentValue: 2, newValue: 5});
        component.addPortfolio(new PortfolioSearchItem('a', 'A', null, null, null, 123));
        expect(component['gridApi'].applyTransaction).not.toHaveBeenCalled();

        // scenario 2 - record not present in selectedSecurities
        component.selectedSecurities.clear();
        component.addPortfolio(new PortfolioSearchItem('a', 'A'));
        expect(component['gridApi'].applyTransaction).toHaveBeenCalledWith({
            add: [{cusip: 'a', description: 'A', currentValue: 0.0, newValue: 0.0, isPort: true}]
        });
        expect(component.selectedSecurities.size).toBe(1);

        // scenario 3 - add Position based Portfolio
        const favSpy = jest.spyOn(favoriteServiceStub, 'getFavorite$');
        favSpy.mockReturnValue(of({
            serialize: () => {
                return {};
            }
        }));
        component.selectedSecurities.clear();
        let portfolioSearchItem = new PortfolioSearchItem('a', 'A');
        portfolioSearchItem.type = 'WHATIF_POS';
        portfolioSearchItem.id = '123';
        const workpadPort = new Portfolio('a');
        workpadPort.datePicker = new DateValue({date: '03/07/2017'});
        WorkspaceStore.getCurrentPortfolio = () => {
            return workpadPort;
        };
        component.addPortfolio(portfolioSearchItem);
        expect(component['gridApi'].applyTransaction).not.toHaveBeenCalledWith();
        expect(component.selectedSecurities.size).toBe(0);

        // test when portfolio search item contains date in the ticker
        const portfolioSearchItemNew = new PortfolioSearchItem('a-#-06/05/2022', 'A');
        portfolioSearchItemNew.type = 'WHATIF_POS';
        portfolioSearchItemNew.id = '123';
        workpadPort.datePicker = new DateValue({date: '06/05/2022'});
        const newPort = new PortfolioWithPositions(portfolioSearchItem.ticker, new DateValue({date: '06/05/2022'}), [], null);
        newPort.id = 123;
        newPort.title = portfolioSearchItemNew.fullName;
        newPort.fullName = portfolioSearchItemNew.fullName;
        jest.spyOn(PortfolioService, 'getPortfolioObject').mockReturnValue(newPort);
        component.addPortfolio(portfolioSearchItemNew);
        expect(component['gridApi'].applyTransaction).not.toHaveBeenCalledWith();
        expect(component.selectedSecurities.size).toBe(1);

        // scenario 3.2 - add Adhoc Portfolio
        component.selectedSecurities.clear();
        workpadPort.datePicker = new DateValue({date: '03/07/2017'});
        portfolioSearchItem.type = CompositionConstants.ADHOC_PORT;
        component.addPortfolio(portfolioSearchItem);
        expect(component['gridApi'].applyTransaction).not.toHaveBeenCalledWith();
        expect(component.selectedSecurities.size).toBe(0);

        // scenario 4 - add rule based portfolio with security modeling on it
        component.selectedSecurities.clear();
        portfolioSearchItem = new PortfolioSearchItem('a', 'A');
        portfolioSearchItem.type = CompositionConstants.WHATIF_RULES.TYPE;
        portfolioSearchItem.id = '123';

        let portfolioFav: WhatIfPortfolio = new RulesBasedPortfolio('a');
        portfolioFav.modellingType = ModellingType.SECTOR;

        favSpy.mockReturnValue(of(portfolioFav));

        component.addPortfolio(portfolioSearchItem);
        expect(component.selectedSecurities.size).toBe(1);

        // scenario 5 - add rule based portfolio with port/index modeling on it (not added)
        portfolioFav.modellingType = ModellingType.PORTFOLIO;
        component.addPortfolio(portfolioSearchItem);
        expect(component.selectedSecurities.size).toBe(1);

        // scenario 5.2 - add adhoc portgroup (not added)
        portfolioSearchItem.type = CompositionConstants.ADHOC_PORT_GROUP;
        component.addPortfolio(portfolioSearchItem);
        expect(component.selectedSecurities.size).toBe(1);

        // scenario 6 - add position based portfolio with different date to adhoc port-group
        portfolioSearchItem.type = CompositionConstants.WHATIF_POS.TYPE;
        portfolioSearchItem.id = '234';

        portfolioFav = new PortfolioWithPositions('a');
        portfolioFav.modellingType = ModellingType.POSITION;
        portfolioFav.datePicker = new DateValue();
        portfolioFav.datePicker.date = '09/14/2018';
        favSpy.mockReturnValue(of(portfolioFav));

        component.isCustomPortfolio = true;
        component.adhocPortParams = new AdhocPortParams();
        component.adhocPortParams.date = new DateValue();
        component.adhocPortParams.date.date = '09/04/2018';

        WorkspaceStore.getCurrentPortfolio = () => null;  // for adhoc port-group, current portfolio can be undefined

        component.addPortfolio(portfolioSearchItem);
        expect(component.selectedSecurities.size).toBe(1);

        // scenario 7 - add position based portfolio with same date to adhoc port-group
        component.adhocPortParams.date.date = '09/14/2018';
        portfolioSearchItem = new PortfolioSearchItem('b', 'B');
        component.addPortfolio(portfolioSearchItem);
        expect(component.selectedSecurities.size).toBe(2);

        // scenario 8 - add a different what-if portfolio with same title
        component.addPortfolio(new PortfolioSearchItem('b', 'B', null, null, null, 345));
        expect(component.selectedSecurities.size).toBe(3);

        component.addPortfolio(new PortfolioSearchItem('b', 'B', null, null, null, 765));
        expect(component.selectedSecurities.size).toBe(3);
    });

    describe('tests getSecurityIdentifiers', () => {
        it('tests getSecurityIdentifiers', () => {
            expect(component.getSecurityIdentifiers({
                'cusip': '0i1n9v9l99',
                'description': null,
                'error': 'Security not found',
                'securityGroup': null
            })).toEqual([
                undefined,
                undefined,
                '0i1n9v9l99',
                undefined,
                undefined
            ]);
        }) ;
    });

    describe('tests switchToWhatIfMode', () => {
        it('tests switchToWhatIfMode', () => {
            jest.spyOn(component.portfolioSearchService, 'enableWhatIfSearch').mockImplementationOnce(_a => {});
            jest.spyOn(component.openWhatIfLoadSlimModal, 'emit').mockImplementationOnce(_b => {});

            component.switchToWhatIfMode(false);
            expect(component.portfolioSearchService.enableWhatIfSearch).toHaveBeenCalledTimes(0);
            expect(component.openWhatIfLoadSlimModal.emit).toHaveBeenCalledTimes(0);

            component.favoriteViewToJustSelectWhatIfs = false;
            component.switchToWhatIfMode(true);
            expect(component.portfolioSearchService.enableWhatIfSearch).toHaveBeenCalledTimes(1);
            expect(component.openWhatIfLoadSlimModal.emit).toHaveBeenCalledTimes(0);

            component.favoriteViewToJustSelectWhatIfs = true;
            component.switchToWhatIfMode(true);
            expect(component.portfolioSearchService.enableWhatIfSearch).toHaveBeenCalledTimes(1);
            expect(component.openWhatIfLoadSlimModal.emit).toHaveBeenCalledTimes(1);
        });
    });

    describe('tests trackPortfolioTelemetry', () => {
        it('tests trackPortfolioTelemetry', () => {
            jest.spyOn(TelemetryService, 'track');
            component.trackPortfolioTelemetry({ticker: 'PEP'} as any);
            expect(TelemetryService.track).toHaveBeenNthCalledWith(1, TelemetryActionConstants.USER_BEHAVIOUR.ADD_ENTITIES, new TelemetryAddEntitiesParameters({'addedEntityType': 1, 'addedPortfolioType': 1}));
            expect(TelemetryService.track).toHaveBeenNthCalledWith(2, TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO, new AddPortfolioTrackingParameters('PEP', undefined, 0, 6));
        });

        it('tests trackPortfolioTelemetry with defined fields', () => {
            component.securityResults = [];
            component.invalidSecurities = [];
            component.currentPortfolio = new PortfolioWithPositions('PEP', new DateValue({date: '20230506'}));
            component.trackPortfolioTelemetry({ticker: 'PEP'} as any);
            expect(TelemetryService.track).toHaveBeenNthCalledWith(3, TelemetryActionConstants.USER_BEHAVIOUR.ADD_ENTITIES, new TelemetryAddEntitiesParameters({'addedEntityType': 1, 'addedPortfolioType': 1, 'securitiesFailedToUpload': 0, 'securitiesUploadedSuccessfully': 0}));
            expect(TelemetryService.track).toHaveBeenNthCalledWith(4, TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO, new AddPortfolioTrackingParameters('PEP', '20230506', 0, 6));
        });
    });

    describe('tests addSecuritiesToTheGrid with correct new value', () => {

        it('Upload a list of securities with keys as cusip, isin, sedol, bbTicker or cusip of an underlying portfolio', () => {

            const seucritiesMap = new Map([
                ['594918104', {
                    'currentValue': 0,
                    'cusip': '594918104',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 24000000,
                    'securityGroup': null
                }],
                ['US345370DA55', {
                    'currentValue': 0,
                    'isin': 'US345370DA55',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 1000000,
                    'securityGroup': null
                }],
                ['74166MAF3', {
                    'currentValue': 0,
                    'cusip': '74166MAF3',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 1500000,
                    'securityGroup': null
                }],
                ['AAFL\\ US', {
                    'currentValue': 0,
                    'bbTicker': 'AAFL US',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 14000000,
                    'securityGroup': null
                }],
                ['0378331F0:X-83-RO-AA', {
                    'currentValue': 0,
                    'cusip': '0378331F0:X-83-RO-AA',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 2000000,
                    'securityGroup': null
                }],
                ['2046251', {
                    'currentValue': 0,
                    'sedol' : '2046251',
                    'description': null,
                    'error': 'Security not found',
                    'newValue': 11000000,
                    'securityGroup': null
                }]
            ]);
            component.currentPortfolio.composition = {
                data: {data: ['345370DA5', 2, 3]},
                columns: ['cusip', 'pct_notional_val_after', 'pct_mv_after']
            };
            component.modellingType = ModellingType.POSITION;
            component.isCustomPortfolio = false;
            jest.spyOn(component.changeInSelectedSecurities, 'emit');
            let mockSecurities: SecuritySearchItem[];
            mockSecurities = [securitySearchItem3Mock, securitySearchItem1Mock, securitySearchItem2Mock, securitySearchItemMock, securitySearchItem4Mock, securitySearchItem5Mock];
            jest.spyOn(securitySearchServiceStub, 'searchSecurity$').mockReturnValue(of(mockSecurities));
            component.selectedSecurities.set('345370DA5', security1Mock);
            component.selectedSecurities.set('74166MAF3', security2Mock);
            component.selectedSecurities.set('0378331F0', security3Mock);
            component.selectedSecurities.set('037833100', securityMock);
            component.selectedSecurities.set('872350067', security4Mock);
            component.selectedSecurities.set('594918104', security5Mock);
            component.validateAndAddSecurities(seucritiesMap, WayToAddSecurity.COPY_PASTE_SECURITIES);
            expect(component.selectedSecurities.size).toBe(6);
            expect(component.selectedSecurities.get('345370DA5').newValue).toBe(1000000);
            expect(component.selectedSecurities.get('74166MAF3').newValue).toBe(1500000);
            expect(component.selectedSecurities.get('0378331F0').newValue).toBe(2000000);
            expect(component.selectedSecurities.get('037833100').newValue).toBe(11000000);
            expect(component.selectedSecurities.get('872350067').newValue).toBe(14000000);
            expect(component.selectedSecurities.get('594918104').newValue).toBe(24000000);
            expect(component['gridApi'].sizeColumnsToFit).toHaveBeenCalled();
            expect(component.changeInSelectedSecurities.emit).toHaveBeenCalled();
        });

    });
});
