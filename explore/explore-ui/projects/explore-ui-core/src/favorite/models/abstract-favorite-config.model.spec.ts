import {CoreFavoriteStore} from '../stores';
import {CoreFavoriteUtils} from '../utils';
import {AbstractFavoriteConfig} from './abstract-favorite-config.model';
import {isObject} from 'lodash';
import {Favorite} from './favorite.model';
import {SerializeFavoriteType} from '../enums';
import {CoreUserMetaDataStore} from '../../user-meta-data/core-user-meta-data.store';
import {UserMetaData} from '../../user-meta-data/user-meta-data.model';
import {CoreFavoriteConstants} from '../constants';
import {ConfigTypeFactory} from '../factories';
import * as momentTz from 'moment-timezone';

/**
 * Test cases for AbstractFavoriteConfig class concrete methods
 */
describe('AbstractFavoriteConfig tests', function() {
    let favConfJson, nestedFavObjJson: any;
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        favConfJson = {
            'id': 127,
            'owner': 'tushshar',
            'title': 'test_favorite',
            'field1': 'value1',
            'field2': {
                'favId': 126,
                userPermGrps: ['Test UserPerm']
            },
        };

        nestedFavObjJson = {
            'id': 126,
            'owner': 'tushshar',
            'title': 'test_favorite2',
            'data': {
                'field1': 'value2',
                userPermGrps: ['Test UserPerm']
            },
        };
        const cacheFav: Favorite = new Favorite(nestedFavObjJson);
        CoreFavoriteStore.favoriteCache.set(CoreFavoriteUtils.getFavoriteKey(false, cacheFav.id).toString(), cacheFav);

        ConfigTypeFactory.registerConfigType(undefined, FavoriteConfig);
        jest.spyOn(momentTz.tz, 'guess').mockReturnValue('America/New_York');
    });

    it('should set enterpriseDescription if data.enterpriseDescription exists', () => {
        const data = { enterpriseDescription: 'Test Description' };
        const favConfObj: FavoriteConfig = new FavoriteConfig(data);
        expect(favConfObj.enterpriseDescription).toEqual('Test Description');
    });

    it('should not set enterpriseDescription if data.enterpriseDescription does not exist', () => {
        const data = {};
        const config = new FavoriteConfig(data);
        expect(config.enterpriseDescription).toBeUndefined();
    });

    it('tests createFavorite method', function() {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const favConfObj: FavoriteConfig = new FavoriteConfig(favConfJson);
        const favObj: Favorite = favConfObj.createFavorite(FavoriteConfig.configType);

        expect(favObj).toBeDefined();
        expect(favObj.id === favConfJson.id).toBeTruthy();
        expect(favObj.title === favConfJson.title).toBeTruthy();
        expect(favObj.type === FavoriteConfig.configType).toBeTruthy();
        expect(favObj.owner === favConfJson.owner).toBeTruthy();
        expect(favObj.data).toBeDefined();

        const favData: any = JSON.parse(favObj.data);

        expect(favData.field1 === favConfJson.field1).toBeTruthy();
        expect(favData.field2).toBeDefined();
        expect(favData.field2.favId === nestedFavObjJson.id).toBeTruthy();
        expect(favData.field2.isGlobalFav).toBeFalsy();
        expect(favData.field2.configType === FavoriteConfig.configType).toBeTruthy();
    });

    it('tests serialize/deserialize methods', function() {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const favConfObj: FavoriteConfig = new FavoriteConfig(favConfJson);
        expect(favConfObj).toBeDefined();
        expect(favConfObj.id === favConfJson.id).toBeTruthy();
        expect(favConfObj.title === favConfJson.title).toBeTruthy();
        expect(favConfObj.owner === favConfJson.owner).toBeTruthy();
        expect(favConfObj.field1 === favConfJson.field1).toBeTruthy();
        expect(favConfObj.field2).toBeDefined();
        expect(favConfObj.field2.id === nestedFavObjJson.id).toBeTruthy();
        expect(favConfObj.field2.field1 === nestedFavObjJson.data.field1).toBeTruthy();
        expect(favConfObj.field2.title === nestedFavObjJson.title).toBeTruthy();
        expect(favConfObj.field2.owner === nestedFavObjJson.owner).toBeTruthy();

        const serializedFavJson1: any = favConfObj.serialize();
        expect(JSON.stringify(serializedFavJson1)).toMatch(JSON.stringify({
            id: 127,
            field1: 'value1',
            field2: {id: 126, field1: 'value2', title: 'test_favorite2'},
            title: 'test_favorite'
        }));

        const serializedFavJson2: any = favConfObj.serialize(true);
        expect(JSON.stringify(serializedFavJson2)).toMatch(JSON.stringify({
            isGlobalFav: false,
            favId: 127,
            configType: FavoriteConfig.configType
        }));

        const serializedFavJson3: any = favConfObj.serialize(SerializeFavoriteType.SERIALIZE_FAVORITE);
        expect(JSON.stringify(serializedFavJson3)).toMatch(JSON.stringify({
            id: 127,
            field1: 'value1',
            field2: {isGlobalFav: false, favId: 126, configType: FavoriteConfig.configType},
            title: 'test_favorite'
        }));

        const serializedFavJson4: any = favConfObj.serialize(SerializeFavoriteType.SERIALIZE_LINKED_FAV);
        expect(JSON.stringify(serializedFavJson4)).toMatch(JSON.stringify({
            isGlobalFav: false,
            favId: 127,
            configType: FavoriteConfig.configType
        }));
    });

    it('test date-time format for lastDateModified ', () => {
        const data = {
            'id': 127,
            'owner': 'tushshar',
            'title': 'test_favorite',
            'field1': 'value1',
            'field2': {
                'favId': 126,
                userPermGrps: ['Test UserPerm']
            },
            'lastUpdatedBy': 'user01',
            'dateLastUpdated': '2021-06-02T07:00:00.000Z'
        };
        let favConfObj: FavoriteConfig = new FavoriteConfig(data);
        expect(favConfObj.dateLastUpdated)
            .toBe(momentTz.utc('2021-06-02T07:00:00.000Z')
                .local().tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz'));
        data.dateLastUpdated = '01/02/2021 07:00 EST';
        favConfObj = new FavoriteConfig(data);
        expect(favConfObj.dateLastUpdated).toBe('01/02/2021 07:00 EST');
    });

    it('tests serialize/deserialize methods with userPermGroups', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const favConfObj: FavoriteConfig = new FavoriteConfig(favConfJson);
        favConfObj.owner = CoreFavoriteConstants.ADMIN;
        favConfObj.field2.owner = CoreFavoriteConstants.ADMIN;

        const serializedFavJson1: any = favConfObj.serialize();
        expect(JSON.stringify(serializedFavJson1)).toMatch(JSON.stringify({
            id: 127,
            field1: 'value1',
            field2: {id: 126, field1: 'value2', title: 'test_favorite2'},
            title: 'test_favorite'
        }));
    });

    it('tests serialize/deserialize methods with userPermGroups as empty', function() {
        const favConfObj = new FavoriteConfig();
        favConfObj.userPermGrps = [];
        const dataSerial = favConfObj.serialize();
        expect(dataSerial.userPermGrps).toBeUndefined();
    });

    it('tests copyFrom method', function() {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const sourceFavConfObj: FavoriteConfig = new FavoriteConfig(favConfJson);
        sourceFavConfObj.aliasId = 'abcde';
        const targetFavConfObj: FavoriteConfig = new FavoriteConfig();
        targetFavConfObj.copyFrom(sourceFavConfObj);
        expect(JSON.stringify(sourceFavConfObj.serialize())).toMatch(JSON.stringify(targetFavConfObj.serialize()));
        expect(targetFavConfObj.aliasId).toEqual('abcde');
    });

    it('tests copyFrom method - source not defined', function() {
        const targetFavConfObj: FavoriteConfig = new FavoriteConfig();
        targetFavConfObj.copyFrom(undefined);
        expect(Object.keys(targetFavConfObj).length).toBe(0);
    });
});


/**
 * Dummy class to test abstract class' concrete methods
 */
export class FavoriteConfig extends AbstractFavoriteConfig {
    field1: string;
    field2: FavoriteConfig;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        const sourceConfig: FavoriteConfig = source as FavoriteConfig;
        this.field1 = sourceConfig.field1;
        this.field2 = sourceConfig.field2;
    }

    protected doDeserialize(data: any): void {
        this.field1 = data['field1'];
        if (data['field2']) {
            this.field2 = new FavoriteConfig(data['field2']);
        }
    }

    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};
        data['id'] = this.id;
        data['field1'] = this.field1;
        if (this.field2) {
            data['field2'] = this.field2.serialize(isNested);
        }
        return data;
    }

    protected getConfigType(): string {
        return FavoriteConfig.configType;
    }

    static get configType(): string {
        return 'TS';
    }
}
