import {HorizonYearColumnOption} from './horizon-year-column-option.model';
import { NotificationType } from '../../../../explore-ui-core/src/ui/enums/notification-type.enum';

describe('HorizonYearColumnOption', () => {
    it('should be defined', () => {
        expect(new HorizonYearColumnOption()).toBeDefined();
    });

    it('should have a configType property', () => {
        expect(new HorizonYearColumnOption().configType).toBeDefined();
    });

    it('Test doSerialize method', () => {
        const horizonYearColumnOption = new HorizonYearColumnOption();
        horizonYearColumnOption.horizonList = [1, 3, 5, 10];
        expect(horizonYearColumnOption.doSerialize()).toEqual({horizonList: [1, 3, 5, 10]});
    });

    it('should have a doAddRequestParams method', () => {
        const horizonYearColumnOption = new HorizonYearColumnOption();
        horizonYearColumnOption.horizonList = [1, 3, 5, 10];
        const requestParams = {};
        horizonYearColumnOption['doAddRequestParams'](requestParams);
        expect(requestParams).toEqual({horizonList: [1, 3, 5, 10]});
    });

    it('test deserialize method', () => {
        const horizonYearColumnOption = new HorizonYearColumnOption();
        horizonYearColumnOption.deserialize({horizonList: [1, 3, 5, 10]});
        expect(horizonYearColumnOption.horizonList).toEqual([1, 3, 5, 10]);
    });

    it('test equals method', () => {
        const horizonYearColumnOption = new HorizonYearColumnOption();
        horizonYearColumnOption.horizonList = [1, 3, 5, 10];
        const otherColOption = new HorizonYearColumnOption();
        otherColOption.horizonList = [1, 3, 5, 10];
        expect(horizonYearColumnOption.equals(otherColOption)).toBeTruthy();
        // Test not equal
        otherColOption.horizonList = [1, 3, 5];
        expect(horizonYearColumnOption.equals(otherColOption)).toBeFalsy();
    });

    it('Test isValid method', () => {
        const horizonYearColumnOption = new HorizonYearColumnOption();
        horizonYearColumnOption.horizonList = [];
        expect(horizonYearColumnOption.isValid()).toBeFalsy();
        horizonYearColumnOption.horizonList = [1, 3, 5, 10];
        expect(horizonYearColumnOption.isValid()).toBeTruthy();
    });

    // test createModelLegacy method
    it('Test createModelLegacy method', () => {
        const horizonYearColumnOption = HorizonYearColumnOption.createModelLegacy({horizonList: [1, 3, 5, 10]});
        expect(horizonYearColumnOption.horizonList).toEqual([1, 3, 5, 10]);
    });

    it('Test isValidColumnOption', () => {
        const horizonYearColumnOption = new HorizonYearColumnOption();
        horizonYearColumnOption.horizonList = [];
        const validationInfo = horizonYearColumnOption.isValidColumnOption();
        expect(validationInfo.notificationType).toEqual(NotificationType.ERROR);
        expect(validationInfo.message).toEqual(HorizonYearColumnOption.ERROR_MESSAGE);
    });
});
