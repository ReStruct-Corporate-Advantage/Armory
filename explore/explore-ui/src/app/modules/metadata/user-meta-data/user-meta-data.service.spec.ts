import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';

import {MetadataModule} from '../metadata.module';
import {UserMetaDataService} from './user-meta-data.service';
import {Http2BmsService} from '../../../shared/services/bms/http2bms.service';
import {UserMetaData} from '@blk/explore-ui-core';

describe('UserMetaDataService', () => {
    let service: UserMetaDataService;
    const http2BmsServiceStub = {
        get$: jest.fn()
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [MetadataModule],
            providers: [{provide: Http2BmsService, useValue: http2BmsServiceStub}]
        });
        service = TestBed.inject(UserMetaDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('fetchUserMetaData Test', () => {
        let payload: any;

        /**
         * Setup the test data for the tests.
         */
        beforeEach(() => {
            payload = {
                data: {
                    access: true,
                    email: null,
                    firstName: null,
                    fullName: null,
                    globalFavPerms: true,
                    lastName: null,
                    launchApps: ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'],
                    location: null,
                    login: 'seakim',
                    perfDataPerms: true,
                    pricePopupAccess: true,
                    sharedFavPerms: true,
                    teamName: null,
                    preferences: {
                        pref1: 'abc',
                        pref2: 'xyz'
                    },
                    userOrg: 'DEV',
                    atxAccess: true,
                    apiAccess: true
                }
            };
        });

        it('should return UserMetaData in Observable', () => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of(payload));

            const expectedResult = new UserMetaData();
            expectedResult.access = true;
            expectedResult.pricePopupAccess = true;
            expectedResult.launchApps = ['SECURITY_MASTER'];
            expectedResult.login = 'seakim';
            expectedResult.globalFavPerms = true;
            expectedResult.perfDataPerms = true;
            expectedResult.sharedFavPerms = true;
            expectedResult.userOrg = 'DEV';

            service.fetchUserMetaData$().subscribe(data => {
                expect(data).toEqual(expectedResult);
            }, (err) => {
                fail(err);
            });
        });

        it('should create UserMetaData with access false if access is undefined', () => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of(payload));

            payload.data.access = undefined;
            service.fetchUserMetaData$().subscribe(data => {
                expect(data.access).toBeFalsy();
            }, (err) => {
                fail(err);
            });
        });

        it('should create UserMetaData with access false if web request returns no data', () => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of({}));
            service.fetchUserMetaData$().subscribe(data => {
                expect(data.access).toBeFalsy();
            }, (err) => {
                fail(err);
            });
        });

        it('should return HttpErrorResponse in Observable', () => {
            jest.spyOn(service['http2BmsService'], 'get$').mockImplementation(() => of(new Error('Error')));

            const expectedResult = new Error('Error');
            service.fetchUserMetaData$().subscribe(data => {
                expect(data).toEqual(expectedResult);
            }, (err) => {
                fail(err);
            });
        });
    });
});
