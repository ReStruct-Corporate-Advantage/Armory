import {TestBed} from '@angular/core/testing';
import {Http2BmsService} from '@services/bms';
import {ProxyDataService} from './proxy-data.service';
import {of} from 'rxjs';
import {CusipProxyDataResponse} from '@models/proxy/cusip-proxy-data-response.model';
import {CusipProxy} from '@models/proxy/cusip-proxy.model';

describe('ProxyDataService', () => {
    let service: ProxyDataService;
    const proxyData = {
        'filePublishedDate': '2019-06-11',
        'data': {
            '05350V106': [
                {
                    'end_date': '2013-05-20',
                    'override': 'SYS.USA.ALL',
                    'bf_date_override': 'BAD DATE**',
                    'original_cusip': '05350V106',
                    'tolerance': 45,
                    'start_date': '2013-05-01',
                    'waterfall_source': 'UnitProxy'
                }
            ],
            'BRSHG64M0': [
                {
                    'end_date': '2013-05-20',
                    'override': 'SYS.KOR.ALL',
                    'bf_date_override': 'BAD DATE**',
                    'original_cusip': 'BRSHG64M0',
                    'tolerance': 45,
                    'start_date': '2013-05-01',
                    'waterfall_source': 'UnitProxy'
                }
            ]
        }
    };

    const httpServiceStub = {
        post$: jest.fn(() => of(proxyData))
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub}
            ]
        });
        service = TestBed.inject(ProxyDataService);
    });

    describe('getProxyData$ Test', () => {
        it('should get proxy data and return data after processing', () => {
            const request = {
                cusips: ['BRSHG64M0', '05350V106', 'BRTJQFYT6', '172967424', '337932107', '655844108', 'XUSD00000', '09062X103'],
                startDate: new Date('2013-05-01'),
                endDate: new Date('2013-05-20'),
                riskModel: 'NAMR'
            };

            const expectedResponse = new CusipProxyDataResponse('2019-06-11', [
                new CusipProxy('2013-05-20T00:00:00.000Z', 'SYS.USA.ALL', '05350V106'),
                new CusipProxy('2013-05-20T00:00:00.000Z', 'SYS.KOR.ALL', 'BRSHG64M0')
            ]);
            service.getProxyData$(request)
                .subscribe((response) => {
                    expect(response).toEqual(expectedResponse);
                });
        });

        describe('translateToCusipProxyData Test', () => {
            it('should not return anything if no data', () => {
                expect(service['translateToCusipProxyData'](null)).toBeUndefined();
            });

            it('should update cusipDescriptions', () => {
                const rawData = {
                    cusipDesc: [
                        {
                            'cusip': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'BRT1T4T30',
                                'object': 'BRT1T4T30',
                                'type': 'STRING',
                                'null': false
                            },
                            'sec_desc': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'PROJECT DASH A-18',
                                'object': 'PROJECT DASH A-18',
                                'type': 'STRING',
                                'null': false
                            }
                        },
                        {
                            'cusip': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'SYS.JPN.CDICONSVCS',
                                'object': 'SYS.JPN.CDICONSVCS',
                                'type': 'STRING',
                                'null': false
                            },
                            'sec_desc': {
                                '_null': true,
                                '_null_or_empty': true,
                                'elemValue': null,
                                'object': null,
                                'type': 'NULL',
                                'null': true
                            }
                        },
                        {
                            'sec_desc': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'PROJECT DASH A-17',
                                'object': 'PROJECT DASH A-17',
                                'type': 'STRING',
                                'null': false
                            },
                            'cusip': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'BRSUMDQT0',
                                'object': 'BRSUMDQT0',
                                'type': 'STRING',
                                'null': false
                            }
                        },
                        {
                            'sec_desc': {
                                '_null': true,
                                '_null_or_empty': true,
                                'elemValue': null,
                                'object': null,
                                'type': 'NULL',
                                'null': true
                            },
                            'cusip': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'SYS.CHN.ALL',
                                'object': 'SYS.CHN.ALL',
                                'type': 'STRING',
                                'null': false
                            }
                        },
                        {
                            'cusip': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'BRW2CNL61',
                                'object': 'BRW2CNL61',
                                'type': 'STRING',
                                'null': false
                            },
                            'sec_desc': {
                                '_null': false,
                                '_null_or_empty': false,
                                'elemValue': 'ORIENTAL LAND C(INTERIM1)',
                                'object': 'ORIENTAL LAND C(INTERIM1)',
                                'type': 'STRING',
                                'null': false
                            }
                        }
                    ]
                };

                expect(service['translateToCusipProxyData'](rawData)).toEqual({'cusipDescriptions': {'BRSUMDQT0': 'PROJECT DASH A-17', 'BRT1T4T30': 'PROJECT DASH A-18', 'BRW2CNL61': 'ORIENTAL LAND C(INTERIM1)', 'SYS.CHN.ALL': null, 'SYS.JPN.CDICONSVCS': null}, 'cusipProxyData': undefined});
            });
        });
    });
});
