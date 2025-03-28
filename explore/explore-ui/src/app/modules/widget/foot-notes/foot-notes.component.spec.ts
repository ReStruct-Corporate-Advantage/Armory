import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    CoreDefinitionStore,
    CoreWidgetConfigStore,
    DateValue,
    WidgetConfig,
    WidgetConfigType, WidgetSize
} from '@blk/explore-ui-core';
import {EconomySettings, ExposureSettings, RiskSettings} from '@blk/explore-ui-risk';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import * as fbaDataStoreDataMock from '../../../../../mocks/fbaDataStoreDataMock.json';
import * as riskSettingsMock from '../../../../../mocks/riskSettingsMock.json';
import {FootNotesComponent} from './foot-notes.component';
import {FooterDetails} from '@interfaces/response.interface';

describe('FootNotesComponent', () => {
    let component: FootNotesComponent;
    let fixture: ComponentFixture<FootNotesComponent>;

    const riskSettings = getRiskSettings();
    const widgetDataStoreData = fbaDataStoreDataMock as unknown as WidgetPayload;
    widgetDataStoreData.requestConfig.columns[1].riskSettings = new RiskSettings(riskSettingsMock);
    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FootNotesComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FootNotesComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.PRA);
        component.widget.dataStore.metaData.inputs.set('riskSettings', riskSettings);
        component.widget.dataStore.data = widgetDataStoreData;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit Test', () => {
        it('should initialize exposureRiskSettings and economyRiskSettings and get details to pass down to presenter components', () => {
            jest.spyOn(component, 'initExposureRiskSettings' as any);
            jest.spyOn(component, 'initEconomyRiskSettings' as any);
            jest.spyOn(component, 'getRiskSettingsSummaryDetails' as any);
            jest.spyOn(component, 'getColumnSettingsOverrideDetails' as any);
            jest.spyOn(component, 'getScenarioDetails' as any);
            jest.spyOn(component, 'getLookThroughProxyDetails' as any);
            jest.spyOn(component, 'getMissingExposureDetails' as any);
            jest.spyOn(component, 'getDateOverrideDetails' as any);
            jest.spyOn(component.riskSettings$, 'next');
            jest.spyOn(component.footerDetails$, 'next');

            component.ngOnInit();

            expect(component['initExposureRiskSettings']).toHaveBeenCalledWith(riskSettings.exposureRiskSettings);
            expect(component['initEconomyRiskSettings']).toHaveBeenCalledWith(riskSettings.economyRiskSettings);
            expect(component['getRiskSettingsSummaryDetails']).toHaveBeenCalledWith(riskSettings.exposureRiskSettings, riskSettings.economyRiskSettings);
            expect(component['getColumnSettingsOverrideDetails']).toHaveBeenCalledWith(riskSettings, widgetDataStoreData.requestConfig.columns);
            expect(component['getScenarioDetails']).toHaveBeenCalledWith(widgetDataStoreData.responseConfig.footerDetails);
            expect(component['getLookThroughProxyDetails']).toHaveBeenCalledWith(widgetDataStoreData.responseConfig.footerDetails);
            expect(component['getMissingExposureDetails']).toHaveBeenCalledWith(widgetDataStoreData.responseConfig.footerDetails);
            expect(component['getDateOverrideDetails']).toHaveBeenCalledWith(widgetDataStoreData.responseConfig);
            expect(component.riskSettings$.next).toHaveBeenCalledWith(riskSettings);
            expect(component.footerDetails$.next).toHaveBeenCalledWith(widgetDataStoreData.responseConfig.footerDetails);
        });

        it('init hvar risk settings', () => {
            const widgetConfig = new WidgetConfig(WidgetConfigType.PNL_TS);
            widgetConfig.inputCategories = [];
            widgetConfig.size = new WidgetSize({sizeX: 100, sizeY: 100});
            CoreWidgetConfigStore.chartConfig.set(WidgetConfigType.PNL_TS, widgetConfig);
            component.widget = new Widget(WidgetConfigType.PNL_TS);
            component.widget.dataStore.metaData.inputs.set('riskSettings', riskSettings);
            component.widget.dataStore.data = widgetDataStoreData;
            component.ngOnInit();
            expect(component.hvarRiskSettingsDetail).toBeTruthy();
        });

        it('init mcvar risk settings', () => {
            const widgetConfig = new WidgetConfig(WidgetConfigType.MCVAR_PNL_TS);
            widgetConfig.inputCategories = [];
            widgetConfig.size = new WidgetSize({sizeX: 100, sizeY: 100});
            CoreWidgetConfigStore.chartConfig.set(WidgetConfigType.MCVAR_PNL_TS, widgetConfig);
            component.widget = new Widget(WidgetConfigType.MCVAR_PNL_TS);
            component.widget.dataStore.metaData.inputs.set('riskSettings', riskSettings);
            component.widget.dataStore.data = widgetDataStoreData;
            component.ngOnInit();
            expect(component.mcVarRiskSettingsDetail).toBeTruthy();
        });

        describe('initExposureRiskSettings Test', () => {
            it('should initialize exposureRiskSettings', () => {
                jest.spyOn(riskSettings.exposureRiskSettings, 'checkGPDefault');

                component['initExposureRiskSettings'](riskSettings.exposureRiskSettings);

                expect(riskSettings.exposureRiskSettings.riskModels).toEqual(CoreDefinitionStore.riskModelList);
                expect(riskSettings.exposureRiskSettings.checkGPDefault).toHaveBeenCalled();
            });
        });

        describe('initEconomyRiskSettings Test', () => {
            it('should initialize economyRiskSettings', () => {
                jest.spyOn(riskSettings.economyRiskSettings, 'initWeightingSchemes');
                jest.spyOn(riskSettings.economyRiskSettings, 'addWeightingSchemeIfItDoesntExist');
                jest.spyOn(riskSettings.economyRiskSettings, 'resetHalfLife');
                jest.spyOn(riskSettings.economyRiskSettings, 'computeConfidenceLevelInPercentage');
                jest.spyOn(riskSettings.economyRiskSettings, 'computeHalfLifeInDays');

                component['initEconomyRiskSettings'](riskSettings.economyRiskSettings);

                expect(riskSettings.economyRiskSettings.riskHorizons).toEqual(CoreDefinitionStore.riskHorizon);
                expect(riskSettings.economyRiskSettings.initWeightingSchemes).toHaveBeenCalled();
                expect(riskSettings.economyRiskSettings.addWeightingSchemeIfItDoesntExist).toHaveBeenCalled();
                expect(riskSettings.economyRiskSettings.resetHalfLife).toHaveBeenCalled();
                expect(riskSettings.economyRiskSettings.computeConfidenceLevelInPercentage).toHaveBeenCalled();
                expect(riskSettings.economyRiskSettings.computeHalfLifeInDays).toHaveBeenCalled();
            });

            describe('processingData Test', () => {
                beforeEach(() => {
                    component['initExposureRiskSettings'](riskSettings.exposureRiskSettings);
                    component['initEconomyRiskSettings'](riskSettings.economyRiskSettings);
                });

                describe('getRiskSettingsSummaryDetails Test', () => {
                    it('should get riskSettingsSummaryDetails to pass down to child component', () => {
                        component['getRiskSettingsSummaryDetails'](riskSettings.exposureRiskSettings, riskSettings.economyRiskSettings);
                        expect(component.riskSettingsSummaryDetails.valueList).toEqual([
                            'GP Default (^APWDA)',
                            '03/11/2016',
                            'Fermi',
                            '312 weeks',
                            '52 weeks',
                            'One Year',
                            '1 σ  OR  84.1345 %',
                        ]);
                    });
                });

                describe('getColumnSettingsOverrideDetails Test', () => {
                    it('should get columnSettingsOverrideDetails to pass down to child component', () => {
                        component['getColumnSettingsOverrideDetails'](riskSettings, widgetDataStoreData.requestConfig.columns);
                        expect(component.columnSettingsOverrideDetails).toEqual([{
                            'columnKey': 'rfv_contrib_port_5ae1aec7858a470',
                            'columnTitle': 'Risk Contribution',
                            'properties': [
                                {'label': 'Risk Model', 'value': 'STORM for Equity'},
                                {'label': 'Economy Date', 'value': '03/01/2016'},
                                {'label': 'Weighting Scheme', 'value': 'Weekly Short-Term Half-Life'},
                                {'columnTitle': 'Risk Contribution', 'label': 'Risk Horizon', 'value': 'One Week'},
                                {'label': 'Confidence Level', 'value': '0.84 σ  OR  79.9546 %'}
                            ]
                        }]);
                    });
                });

                describe('getScenarioDetails Test', () => {
                    it('should get scenarioDetails to pass down to child component', () => {
                        component['getScenarioDetails'](widgetDataStoreData.responseConfig.footerDetails);
                        expect(component.scenarioDetails).toEqual([
                            {
                                'code': 'MS_WORLD',
                                'details': ['MSCI World Net TR = -8.97 (pct)'],
                                'properties': [
                                    {
                                        'label': 'Description',
                                        'value': '1% probability movement of MSCI World Market Down'
                                    },
                                    {'label': 'Noise Dampening', 'value': 'None (0.00)'},
                                    {'label': 'Restrict prediction to Factors', 'value': ''},
                                    {'label': 'Spread Shocks', 'value': 'Relative'},
                                    {'label': 'Horizon'},
                                    {'label': 'Warning'},
                                    {'label': 'Note'},
                                    {'label': 'Definition'},
                                    {'label': 'Economy Date'},
                                    {'label': 'Factors whose shock is floored'}
                                ]
                            }, {
                                'code': 'GR_RES',
                                'details': [
                                    'Greece ASE/General = 40 (pct) target block ALL-BRS_GOLD__2_RATES-BRS_GOLD__2_FX-BRS_GOLD__5_SPREADS-EQVX-BRS_GOLD__2_INFLATION-COMD',
                                    'MSCI World Net TR = 1 (pct) target block ALL-BRS_GOLD__2_RATES-BRS_GOLD__2_FX-BRS_GOLD__5_SPREADS-EQVX-BRS_GOLD__2_INFLATION-COMD',
                                    'MXEU FINANCIALS(EUR) = 5 (pct) target block ALL-BRS_GOLD__2_RATES-BRS_GOLD__2_FX-BRS_GOLD__5_SPREADS-EQVX-BRS_GOLD__2_INFLATION-COMD',
                                    'VSTOXX Implied Vol = -10 (pct) target block EQVX',
                                    'Pan Euro Credit HY = -5 (bps) target block BRS_GOLD__5_SPREADS',
                                    'EU Corp Spain = -10 (bps) target block EUR_CORP_IT,EUR_CORP_IT_HY,EUR_CORP_ES ,EUR_CORP_ES _HY,EUR_CORP_IE,EUR_CORP_IE_HY,EUR_CORP_PT,EUR_CORP_PT_HY',
                                    'EU Corp Greece = -300 (bps) target block EUR_CORP_GR,EUR_CORP_GR_HY',
                                    'ESP 5Y = -20 (bps) target block BRS_GOLD__1_EURSPRD-GRD',
                                    'EUR/USD = 2 (pct) target block BRS_GOLD__2_FX',
                                    'GRD 5Y = -954.354 (bps) target block GRD,USD_CDS_GR_2Y,USD_CDS_GR_5Y',
                                    'Tsy 10Y = 5 (bps) target block BRS_GOLD__2_RATES-BRS_GOLD__1_EURSPRD',
                                    'MSCI EUROPE(EUR) - MSCI World Net TR = 4 (pct) target block ALL-BRS_GOLD__2_RATES-BRS_GOLD__2_FX-BRS_GOLD__5_SPREADS-EQVX-BRS_GOLD__2_INFLATION-COMD'
                                ],
                                'properties': [
                                    {
                                        'label': 'Description',
                                        'value': 'Syriza and the Troika negotiate additional financing, and the tail-risk of a near-term “Grexit” scenario is removed'
                                    },
                                    {'label': 'Noise Dampening', 'value': 'None (0.00)'},
                                    {'label': 'Restrict prediction to Factors', 'value': ''},
                                    {'label': 'Spread Shocks', 'value': 'Absolute'},
                                    {'label': 'Horizon'},
                                    {'label': 'Warning'},
                                    {'label': 'Note'},
                                    {'label': 'Definition'},
                                    {'label': 'Economy Date'},
                                    {'label': 'Factors whose shock is floored', 'value': 'GRD 5Y'}
                                ]
                            }
                        ]);
                    });
                });

                describe('getLookThroughProxyDetails Test', () => {
                    it('should get lookThroughProxyDetails to pass down to child component', () => {
                        component['getLookThroughProxyDetails'](widgetDataStoreData.responseConfig.footerDetails);
                        expect(component.lookThroughProxyDetails).toEqual([
                            'Look-Thru: BLK ICS USD LIQ AGENCY DIS (BRS263R12) is proxied to BlackRock ICS US Dollar Liquidity Fund (BRS2GTXW9)',
                            'UNIT_PROXY: PROJECT DASH A-17 (BRSUMDQT0) proxied to unit exposure of CHN '
                        ]);
                    });
                });

                describe('getLookThroughProxyDetails RAS Test', () => {
                    it('should get lookThroughProxyDetails to pass down to child component', () => {
                        const footerDetails = {
                            'proxies': {
                                'BRS263R12': {
                                    'sec_desc': 'BLK ICS USD LIQ AGENCY DIS',
                                    'cusip': 'BRS263R12',
                                    'proxy_cusip': 'BRS2GTXW9',
                                    'type': 'UnitProxy',
                                    'proxy_desc': 'BlackRock ICS US Dollar Liquidity Fund'
                                }
                            }
                        };
                        component['getLookThroughProxyDetails'](footerDetails as unknown as FooterDetails);
                        expect(component.lookThroughProxyDetails).toEqual([
                            'UnitProxy: BLK ICS USD LIQ AGENCY DIS (BRS263R12) is proxied to BlackRock ICS US Dollar Liquidity Fund (BRS2GTXW9)'
                        ]);
                    });
                });

                describe('getMissingExposureDetails Test', () => {
                    it('should get missingExposureDetails to pass down to child component', () => {
                        widgetDataStoreData.responseConfig.footerDetails.missingExposures = {
                            test: {
                                title: 'test_title',
                                purpose: 'test_purpose',
                                weight: 1.234,
                                asset: 'test_asset',
                                issuer_cusip: 'test_issuer_cusip',
                                date: '09/03/2020'
                            }
                        } as any;
                        component['getMissingExposureDetails'](widgetDataStoreData.responseConfig.footerDetails);
                        expect(component.missingExposureDetails).toEqual([
                            'No exposure for 1.23% in test_asset (test_issuer_cusip) on 09/03/2020 for purpose test_purpose in test_title'
                        ]);
                    });
                });

                describe('getMissingExposureDetails RAS Test', () => {
                    it('should get missingExposureDetails to pass down to child component', () => {
                        widgetDataStoreData.responseConfig.footerDetails.missingExposures = {
                            BRSXGQRRP: 'No Exposure for BRSXGQRRP'
                        } as any;
                        component['getMissingExposureDetails'](widgetDataStoreData.responseConfig.footerDetails);
                        expect(component.missingExposureDetails).toEqual([
                            'No Exposure for BRSXGQRRP'
                        ]);
                    });
                });

                describe('getDateOverrideDetails Test', () => {
                    it('should get dateOverrideDetails to pass down to child component', () => {
                        component['getDateOverrideDetails'](widgetDataStoreData.responseConfig);
                        expect(component.dateOverrideDetails).toEqual([{
                            'columnKey': 'rfv_contrib_port_5ae1aec7858a470',
                            'columnTitle': 'Risk Contribution',
                            'dates': [{
                                'dateIndex': 0,
                                'dateTitle': 'Prior Day',
                                'econDate': '03/10/2016',
                                'expDate': '03/10/2016'
                            }]
                        }]);
                    });
                });
            });
        });
    });
});

export function getRiskSettings(): RiskSettings {
    const riskSettings = new RiskSettings();

    const exposureRiskSettings = new ExposureSettings();
    exposureRiskSettings.riskModel = '^APWDA';
    exposureRiskSettings.name = 'Port Default';

    const economyRiskSettings = new EconomySettings();
    economyRiskSettings.dateObject = new DateValue({calCode: 'GP_HK_STD', dateString: false, date: '03/11/2016'});
    economyRiskSettings.name = 'Org Default';
    economyRiskSettings.weightingScheme = 'FMI';
    economyRiskSettings.riskHorizon = 4;

    riskSettings.exposureRiskSettings = exposureRiskSettings;
    riskSettings.economyRiskSettings = economyRiskSettings;

    return riskSettings;
}

