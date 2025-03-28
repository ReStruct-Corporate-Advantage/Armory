import {CavContributor} from './cav-contributor.model';
import {CavContributorGroup} from './cav-contributor-group.model';

describe('CavContributorGroup', () => {

    it('should initialize', () => {
        const cavContributorGroup = new CavContributorGroup();
        expect(cavContributorGroup.assetType).toBeUndefined();
        expect(cavContributorGroup.cavContributors).toEqual([]);
    });

    it('should serialize and deserialize', () => {
        const cavContributor = new CavContributor({field: 'pct_change_damage_hurricane', name: 'Hurricane Cost'});
        const cavContributorGroup = new CavContributorGroup({assetType: 'Munis', cavContributors: [cavContributor]});
        const serializedData = cavContributorGroup.serialize();
        const cavContributorGroup2 = new CavContributorGroup();
        expect(cavContributorGroup.equals(cavContributorGroup2)).toBe(false);
        cavContributorGroup2.deserialize(serializedData);
        expect(cavContributorGroup.equals(cavContributorGroup2)).toBe(true);
    });

    it('should check if equal', () => {
        const cavContributor = new CavContributor({field: 'pct_change_damage_hurricane', name: 'Hurricane Cost'});
        const cavContributorGroup = new CavContributorGroup({assetType: 'Munis', cavContributors: [cavContributor]});
        const cavContributorGroup2 = new CavContributorGroup();
        expect(cavContributorGroup.equals(null)).toBe(false);
        expect(cavContributorGroup.equals(undefined)).toBe(false);
        expect(cavContributorGroup.equals(cavContributorGroup2)).toBe(false);
        expect(cavContributorGroup.equals(cavContributorGroup)).toBe(true);
        cavContributorGroup2.deserialize(cavContributorGroup.serialize());
        expect(cavContributorGroup.equals(cavContributorGroup2)).toBe(true);
    });

    it('should check if valid', () => {
        const cavContributor = new CavContributor({field: 'pct_change_damage_hurricane', name: 'Hurricane Cost'});
        const cavContributorGroup = new CavContributorGroup();
        expect(cavContributorGroup.isValid()).toBe(false);
        cavContributorGroup.assetType = 'Munis';
        expect(cavContributorGroup.isValid()).toBe(false);
        cavContributorGroup.assetType = undefined;
        cavContributorGroup.cavContributors = [cavContributor];
        expect(cavContributorGroup.isValid()).toBe(false);
        cavContributorGroup.assetType = 'Munis';
        cavContributorGroup.cavContributors = [cavContributor];
        expect(cavContributorGroup.isValid()).toBe(true);
    });

});
