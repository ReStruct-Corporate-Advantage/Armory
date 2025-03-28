import {TestBed} from '@angular/core/testing';
import {FavoriteConstants} from '@constants/favorite.constants';
import * as rxjs from 'rxjs';
import {forkJoin, of, throwError} from 'rxjs';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Widget} from '@models/widget/widget.model';
import {HttpUtils} from '../../../utils';
import {TestUtils} from '@utils/test.utils';
import {MandateStore, WorkspaceStore} from '../../../stores';
import {FavoriteService, Http2BmsService, MandateMappingService} from '..';
import * as loadMandateResponseMock from '../../../../../mocks/loadMandateResponseMock.json';
import * as loadMandateSettingsResponseMock from '../../../../../mocks/loadMandateSettingsResponseMock.json';
import {ColumnConfig, CoreFavoriteConstants, Favorite, FavoriteType, WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {TestScheduler} from 'rxjs/testing';

describe('MandateMappingService', () => {
    let service: MandateMappingService;

    const saveMandateSettingsResponse = {
        'status': 'SUCCESS',
        'message': 'Successfully saved the favorite',
        'favoriteId': 1421773,
        'owner': '_ADMIN',
        'type': 'MANDATE_MAP'
    };
    const httpServiceStub = {
        get$: jest.fn(() => of(loadMandateResponseMock))
    };

    const favoriteServiceStub = {
        getFavoriteByTypeAndUser$: jest.fn(() => of(loadMandateSettingsResponseMock)),
        getSlimFavorites$: jest.fn((favType: string) => {
            const fav = new Favorite();
            fav.type = favType;
            return of(fav);
        }),
        saveFavorite$: jest.fn(),
        getFavorite$: jest.fn((id: number, isGlobalFavorite: boolean) => {
            const columnSet = new ColumnSet();
            columnSet.columns.push(ColumnConfig.createColumn('cusip', 'ALL'));
            columnSet.columns.push(ColumnConfig.createColumn('sec_desc', 'ALL'));
            columnSet.columns.push(ColumnConfig.createColumn('market_val', 'PORT'));
            columnSet.columns.push(ColumnConfig.createColumn('market_val', 'BENCH'));
            return of(columnSet);
        }),
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
            ]
        });
        service = TestBed.inject(MandateMappingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize$ Test', () => {
        it('should return forkJoin of the observable queue', () => {
            jest.spyOn(rxjs, 'forkJoin');
            jest.spyOn(service, 'loadMandateSettings$');
            jest.spyOn(service, 'loadMandates$');
            jest.spyOn(service, 'loadMandateTypeFavorites$');
            service.initialize$();
            expect(service.loadMandateSettings$).toHaveBeenCalledTimes(1);
            expect(service.loadMandates$).toHaveBeenCalledTimes(1);

            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('MANDATE', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('ATTRIBUTION_SETTING', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('BREAKDOWN', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('PERF_BKD', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('FAC_BKD', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('WIDGETS_REPORT', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('COLUMN_SET', FavoriteConstants.ADMIN_USER);
            expect(service.loadMandateTypeFavorites$).toHaveBeenCalledWith('WIDGETS_REPORT', CoreFavoriteConstants.GLOBAL_USER);

            expect(rxjs.forkJoin).toHaveBeenCalled();
        });
    });

    describe('loadMandateSettings$ Test', () => {
        it('should set mandateSettingsFavorite and mandateSettingsList in MandateStore', (done: any) => {
            MandateStore.mandateSettingsList = undefined;

            const expectedMandateSettingsList = [
                new MandateSettings({
                    MANDATE: 'FI_MANDATE',
                    ATTRIBUTION_SETTING: 'FIXED_INCOME_DXS',
                    BREAKDOWN: 'false;1210587',
                    REPORTS: ['false;1325071', 'false;1325073', 'false;1325075'],
                    PERF_BKD: 'false;1210587'
                }),
                new MandateSettings({
                    MANDATE: 'EQ_MANDATE',
                    ATTRIBUTION_SETTING: 'EQUITY',
                    BREAKDOWN: 'false;1275180',
                    REPORTS: ['false;1325090', 'false;1325091'],
                    FAC_BKD: 'false;1435981'
                }),
                new MandateSettings({
                    MANDATE: 'BAL_MANDATE',
                    ATTRIBUTION_SETTING: 'EQUITY_TD_xFX',
                    REPORTS: ['false;1325094', 'false;1325095'],
                }),
                new MandateSettings({
                    MANDATE: 'EQASXJAP',
                    ATTRIBUTION_SETTING: 'EQUITY',
                    BREAKDOWN: 'false;1275180',
                    REPORTS: ['false;1445064', 'false;1445063', 'false;1445062'],
                    FAC_BKD: 'false;1435981'
                }),
                new MandateSettings({
                    MANDATE: 'BAL-FID',
                    ATTRIBUTION_SETTING: 'EQUITY_TD_xFX',
                    REPORTS: ['false;1456150'],
                })
            ];

            const subscription = service.loadMandateSettings$()
                .subscribe(() => {
                    expect(MandateStore.mandateSettingsList).toEqual(expectedMandateSettingsList);
                    done();
                });
            subscription.unsubscribe();
        });

        it('should just proceed if no mandateSettings data', (done: any) => {
            MandateStore.mandateSettingsList = undefined;

            jest.spyOn(service['favoriteService'], 'getFavoriteByTypeAndUser$').mockReturnValue(of({data: null}));
            const subscription = service.loadMandateSettings$()
                .subscribe(() => {
                    expect(service['mandateSettingsFavorite']).toBeUndefined();
                    expect(MandateStore.mandateSettingsList).toBeUndefined();
                    done();
                });
            subscription.unsubscribe();
        });

        it('should handle error', (done: any) => {
            jest.spyOn(service['favoriteService'], 'getFavoriteByTypeAndUser$').mockReturnValue(throwError('Failed to load the mandate settings'));

            const subscription = service.loadMandateSettings$()
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to load the mandate settings');
                    done();
                });
            subscription.unsubscribe();
        });
    });

    describe('loadMandates$ Test', () => {
        it('should set mandateGroups in MandateStore', (done: any) => {
            const expectedAuxMandateOptions = [
                {
                    'label': 'Model Portfolio Solutions',
                    'values': [{
                        'displayValue': 'Model Portfolio Solutions',
                        'value': 'MPS_MANDATE',
                    }, {
                        'displayValue': 'Model - Research',
                        'value': 'Model-RESEARCH',
                    }, {
                        'displayValue': 'Model - Index',
                        'value': 'Model-INDEX',
                    }, {
                        'displayValue': 'MPS - Research',
                        'value': 'MPS-RESEARCH',
                    }, {
                        'displayValue': 'MPS - BLK Managed',
                        'value': 'MPS-BLKMAN',
                    }, {
                        'displayValue': 'MPS - 3rd Party Managed',
                        'value': 'MPS-3RD',
                    }, {
                        'displayValue': 'Model - 3rd Party Managed',
                        'value': 'Model-3RD',
                    }, {
                        'displayValue': 'MPS - Index',
                        'value': 'MPS-INDEX',
                    }, {
                        'displayValue': 'Model - BLK Managed',
                        'value': 'Model-BLKMAN',
                    }],
                }, {
                    'label': 'Advisory - AUM',
                    'values': [{
                        'displayValue': 'Advisory - AUM',
                        'value': 'ADV_MANDATE',
                    }, {
                        'displayValue': 'Advisory-Portfolio Management Group',
                        'value': 'ADV-FMA-PMG',
                    }, {
                        'displayValue': 'Advisory-Financial Markets Advisory Group',
                        'value': 'ADV-FMA',
                    }],
                },
            ];
            jest.spyOn(HttpUtils, 'getCopiedParamWithLoadingKeyAndMessage');

            const subscription = service.loadMandates$()
                .subscribe(() => {
                    expect(MandateStore.auxMandateOptions).toEqual(expectedAuxMandateOptions);
                    done();
                });
            subscription.unsubscribe();
        });

        it('should handle error', (done: any) => {
            jest.spyOn(service['httpService'], 'get$').mockReturnValue(throwError('Failed to load mandates'));

            const subscription = service.loadMandates$()
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to load mandates');
                    done();
                });
            subscription.unsubscribe();
        });
    });

    describe('loadMandateTypeFavorites$ Test', () => {
        const testScheduler = new TestScheduler((a, e) => expect(a).toEqual(e));

        it('should set mandateTyoeFavorites in MandateStore', () => {
            const fav = [new Favorite()];
            jest.spyOn(service['favoriteService'], 'getSlimFavorites$').mockReturnValue(of(fav));
            jest.spyOn(MandateStore.mandateTypeFavorites, 'set');
            testScheduler.run(() => {
                service.loadMandateTypeFavorites$('PERF_BKD', '_ADMIN')
                    .subscribe(() => {
                        expect(service['favoriteService'].getSlimFavorites$).toHaveBeenCalledWith('_ADMIN', 'BREAKDOWN', 'Loading Mandate Options');
                        expect(MandateStore.mandateTypeFavorites.set).toHaveBeenCalledWith('PERF_BKD', fav);
                    });
            });
            testScheduler.run(() => {
                service.loadMandateTypeFavorites$('PERF_BKD', '_ADMIN')
                    .subscribe(() => {
                        expect(service['favoriteService'].getSlimFavorites$).toHaveBeenCalledWith('_ADMIN', 'BREAKDOWN', 'Loading Mandate Options');
                        expect(MandateStore.mandateTypeFavorites.set).toHaveBeenCalledWith('PERF_BKD', fav);
                    });
            });
            testScheduler.run(() => {
                service.loadMandateTypeFavorites$('WIDGETS_REPORT', '_ADMIN')
                    .subscribe(() => {
                        expect(service['favoriteService'].getSlimFavorites$).toHaveBeenCalledWith('_ADMIN', 'LAYOUT', 'Loading Mandate Options');
                        expect(MandateStore.mandateTypeFavorites.set).toHaveBeenCalledWith('WIDGETS_REPORT', fav);
                    });
            });
            testScheduler.run(() => {
                service.loadMandateTypeFavorites$('COLUMN_SET', '_ADMIN')
                    .subscribe(() => {
                        expect(service['favoriteService'].getSlimFavorites$).toHaveBeenCalledWith('_ADMIN', 'REPORT', 'Loading Mandate Options');
                        expect(MandateStore.mandateTypeFavorites.set).toHaveBeenCalledWith('COLUMN_SET', fav);
                    });
            });
            testScheduler.run(() => {
                service.loadMandateTypeFavorites$('MANDATE', '_ADMIN')
                    .subscribe(() => {
                        expect(service['favoriteService'].getSlimFavorites$).toHaveBeenCalledWith('_ADMIN', 'MANDATE', 'Loading Mandate Options');
                        expect(MandateStore.mandateTypeFavorites.set).toHaveBeenCalledWith('MANDATE', fav);
                    });
            });
        });

        it('should handle error', (done: any) => {
            jest.spyOn(service['favoriteService'], 'getSlimFavorites$').mockReturnValue(throwError('Failed to load mandate type favorites'));

            const subscription = service.loadMandateTypeFavorites$('MANDATE', '_ADMIN')
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to load mandate type favorites');
                    done();
                });
            subscription.unsubscribe();
        });
    });

    describe('saveMandateSettings$ Test', () => {
        it('should save mandateSettingsList', (done: any) => {
            const mandateSettingsList = [
                new MandateSettings({
                    MANDATE: 'FI_MANDATE',
                    ATTRIBUTION_SETTING: 'FIXED_INCOME_DXS',
                    BREAKDOWN: 'false;1210587',
                    REPORTS: ['false;1325071', 'false;1325073', 'false;1325075'],
                    PERF_BKD: 'false;1210587'
                }),
                new MandateSettings({
                    MANDATE: 'EQ_MANDATE',
                    ATTRIBUTION_SETTING: 'EQUITY',
                    BREAKDOWN: 'false;1275180',
                    REPORTS: ['false;1325090', 'false;1325091'],
                    FAC_BKD: 'false;1435981'
                }),
                new MandateSettings({
                    MANDATE: 'BAL_MANDATE',
                    ATTRIBUTION_SETTING: 'EQUITY_TD_xFX',
                    REPORTS: ['false;1325094', 'false;1325095'],
                })
            ];

            jest.spyOn(service['favoriteService'], 'saveFavorite$').mockReturnValue(of(saveMandateSettingsResponse));
            const subscription = service.saveMandateSettings$(mandateSettingsList)
                .subscribe(() => {
                    expect(service['mandateSettingsFavorite'].id).toBe(saveMandateSettingsResponse.favoriteId);
                    expect(MandateStore.mandateSettingsList).toEqual(mandateSettingsList);
                    done();
                });
            subscription.unsubscribe();
        });

        it('should handle error', (done: any) => {
            jest.spyOn(service['favoriteService'], 'saveFavorite$').mockReturnValue(throwError('Failed to save mandate settings'));

            const subscription = service.saveMandateSettings$([new MandateSettings()])
                .subscribe(() => {
                }, error => {
                    expect(error).toBe('Failed to save mandate settings');
                    done();
                });
            subscription.unsubscribe();
        });
    });

    describe('setWidgetDefaultsAsPerMandate Test', () => {
        it('should set widget defaults as per mandate settings', (done: any) => {
            const port = new Portfolio();
            port.mandateSettings = new MandateSettings();
            port.mandateSettings.settings.set(FavoriteType.SINGLE_REPORT, '12345');
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(port);
            const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            forkJoin(service.setWidgetDefaultsAsPerMandate(widget)).toPromise().then(() => {
                expect((widget.dataStore.metaData.inputs.get('columns') as ColumnSet).columns.length).toBe(4);
                done();
            });
        });

        it('should set widget defaults as per mandate settings - Attribution settings', () => {
            const port = new Portfolio();
            port.mandateSettings = new MandateSettings();
            port.mandateSettings.settings.set('ATTRIBUTION_TYPE', 'FIXED_INCOME_DXS');
            jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(port);
            const widget = new Widget(WidgetConfigType.RETURNS);
            const observableQueue = service.setWidgetDefaultsAsPerMandate(widget);
            expect(observableQueue.length).toBe(0);
        });
    });
});
