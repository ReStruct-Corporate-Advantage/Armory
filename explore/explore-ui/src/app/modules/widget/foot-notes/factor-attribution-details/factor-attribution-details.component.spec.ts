import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FactorAttributionDetailsComponent} from './factor-attribution-details.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ProxyDataService} from '../proxy-data.service';
import {RiskSettings} from '@blk/explore-ui-risk';
import {BehaviorSubject, of} from 'rxjs';

import {getRiskSettings} from '../foot-notes.component.spec';
import {FooterDetails} from '@interfaces/response.interface';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {WorkspaceStore} from '../../../../stores';
import {CusipProxyDataResponse} from '@models/proxy/cusip-proxy-data-response.model';
import {CusipProxy} from '@models/proxy/cusip-proxy.model';

describe('FactorAttributionDetailsComponent', () => {
    let component: FactorAttributionDetailsComponent;
    let fixture: ComponentFixture<FactorAttributionDetailsComponent>;

    let riskSettings: RiskSettings;
    let footerDetails: FooterDetails;
    let portfolio: Portfolio;

    const proxyData = new CusipProxyDataResponse('2016-03-09', [
        new CusipProxy('2016-03-09', 'SYS.CHN.ALL', 'BRT1T4T30'),
        new CusipProxy('2016-03-09', 'SYS.JPN.CDICONSVCS', 'BRW2CNL61'),
        new CusipProxy('2016-03-09', 'SYS.CHN.ALL', 'BRSUMDQT0')
    ], {
        'BRSUMDQT0': 'PROJECT DASH A-17',
        'BRT1T4T30': 'PROJECT DASH A-18',
        'BRW2CNL61': 'ORIENTAL LAND C(INTERIM1)',
        'SYS.CHN.ALL': null,
        'SYS.JPN.CDICONSVCS': null
    });


    const proxyDataServiceStub = {getProxyData$: jest.fn(() => of(proxyData))};

    beforeAll(() => {
        riskSettings = getRiskSettings();
        footerDetails = {
            'PUBLISH_TIME': 0,
            'activeReturn': -0.00013161679212101376,
            'benchmarkActiveReturn': 0.004824846406557979,
            'proxies': {
                'SB6SNRV27': {
                    'sec_desc': 'BHARAT HEAVY ELECTRICALS LTD',
                    'cusip': 'SB6SNRV27',
                    'proxy_cusip': 'S61295234',
                    'type': 'Look-Thru',
                    'proxy_desc': 'BHARAT HEAVY ELECTRICALS LTD.'
                },
                'BRS263R12': {
                    'sec_desc': 'BLK ICS USD LIQ AGENCY DIS',
                    'cusip': 'BRS263R12',
                    'proxy_cusip': 'BRS2GTXW9',
                    'type': 'Look-Thru',
                    'proxy_desc': 'BlackRock ICS US Dollar Liquidity Fund'
                },
                'BRSUMDQT0': {
                    'type': 'UNIT_PROXY',
                    'sec_desc': 'PROJECT DASH A-17',
                    'cusip': 'BRSUMDQT0',
                    'desc': 'CHN '
                }
            },
            'cusipsTitleMap': {
                '01609W102': 'ALIBABA GROUP HOLDING ADR REPRESEN',
                '05278C107': 'AUTOHOME ADR REPRESENTING INC',
                '06684L103': 'BAOZUN ADR REPRESENTING  INC',
                '07725L102': 'BEIGENE ADR REPRESENTING LTD',
                '08653C106': 'BEST ADR REPRESENTING INC CLASS A',
                '31680Q104': '58.COM ADR REPRESENTING INC',
                '36165L108': 'GDS HOLDINGS LIMITED ADR LTD',
                '44332N106': 'HUAZHU GROUP ADR REPRESENTING LTD',
                '44842L103': 'HUTCHISON CHINA MEDITECH ADR REPRE',
                '44852D108': 'HUYA ADR INC',
                '46267X108': 'IQIYI ADS REPRESENTING INC',
                '47215P106': 'JD.COM ADR REPRESENTING INC',
                '54951L109': 'LUCKIN COFFEE ADR REPRESENTING  IN',
                '60879B107': 'MOMO ADR REPRESENTING INC',
                '62914V106': 'NIO AMERICAN DEPOSITARY SHARES REP',
                '64110W102': 'NETEASE ADR INC'
            },
            'assetsCount': 0
        };

        portfolio = new Portfolio('PEP');
        portfolio.title = 'PEP';
        portfolio.fullName = 'BGF Pacific Equity Fund';
        portfolio.benchmark = new Benchmark({
            name: 'MSAC_APACN',
            type: 'PERFORM',
            order: 1
        });
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject(portfolio);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorAttributionDetailsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: ProxyDataService, useValue: proxyDataServiceStub}]
        });

        fixture = TestBed.createComponent(FactorAttributionDetailsComponent);
        component = fixture.componentInstance;

        component.riskSettings$ = new BehaviorSubject<any>(undefined);
        component.footerDetails$ = new BehaviorSubject<any>(undefined);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('setSummaryValueList Test', () => {
        it('should set summaryValueList to pass down to child component', () => {
            component['setSummaryValueList'](riskSettings, footerDetails);

            expect(component.summaryValueList).toEqual([
                'PEP - BGF Pacific Equity Fund',
                'MSAC_APACN',
                '0',
                '-0.00013 %',
                'N/A',
                '0.00482 %',
                ' - ',
                '03/11/2016',
                'FMI',
                'N/A',
            ]);
        });
    });

    describe('getCusipProxyData Test', () => {
        it('should update proxyInfo and publishDate to pass down to child component after getProxyData$', () => {
            component.summaryValueList = [
                'PEP',
                'MSAC_APACN',
                '0',
                'N/A',
                'N/A',
                'N/A',
                ' - ',
                '03/11/2016',
                'FMI',
                'N/A',
            ];

            component['getCusipProxyData'](footerDetails.cusipsTitleMap, new Date('02/28/2016'), new Date('03/10/2016'), 'APWD');

            expect(component.summaryValueList).toEqual([
                'PEP',
                'MSAC_APACN',
                '0',
                'N/A',
                'N/A',
                'N/A',
                ' - ',
                '03/11/2016',
                'FMI',
                '08-Mar-2016',
            ]);
            expect(component.proxyInfo).toEqual({
                'cusips': ['BRT1T4T30 (PROJECT DASH A-18)', 'BRW2CNL61 (ORIENTAL LAND C(INTERIM1))', 'BRSUMDQT0 (PROJECT DASH A-17)'],
                'endDates': ['03/08/2016', '03/08/2016', '03/08/2016'],
                'overrides': ['SYS.CHN.ALL', 'SYS.JPN.CDICONSVCS', 'SYS.CHN.ALL']
            });
        });
    });
});
