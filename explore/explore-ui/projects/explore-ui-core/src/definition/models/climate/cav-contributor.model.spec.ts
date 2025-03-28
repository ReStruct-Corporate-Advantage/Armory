import {CavContributor} from './cav-contributor.model';

describe('CavContributor', () => {

    it('should initialize', () => {
        const cavContributor = new CavContributor();
        expect(cavContributor.field).toBeUndefined();
        expect(cavContributor.name).toBeUndefined();
    });

    it('should serialize and deserialize', () => {
        const cavContributor = new CavContributor({field: 'pct_change_damage_hurricane', name: 'Hurricane Cost'});
        const serializedData = cavContributor.serialize();
        const cavContributor2 = new CavContributor();
        expect(cavContributor.equals(cavContributor2)).toBe(false);
        cavContributor2.deserialize(serializedData);
        expect(cavContributor.equals(cavContributor2)).toBe(true);
    });

    it('should check if equal', () => {
        const cavContributor = new CavContributor({field: 'pct_change_damage_hurricane', name: 'Hurricane Cost'});
        const cavContributor2 = new CavContributor();
        expect(cavContributor.equals(null)).toBe(false);
        expect(cavContributor.equals(undefined)).toBe(false);
        expect(cavContributor.equals(cavContributor2)).toBe(false);
        expect(cavContributor.equals(cavContributor)).toBe(true);
        cavContributor2.deserialize(cavContributor.serialize());
        expect(cavContributor.equals(cavContributor2)).toBe(true);
    });

    it('should check if valid', () => {
        const cavContributor = new CavContributor();
        expect(cavContributor.isValid()).toBe(false);
        cavContributor.name = 'Hurricane Cost';
        expect(cavContributor.isValid()).toBe(false);
        cavContributor.name = undefined;
        cavContributor.field = 'pct_change_damage_hurricane';
        expect(cavContributor.isValid()).toBe(false);
        cavContributor.name = 'Hurricane Cost';
        cavContributor.field = 'pct_change_damage_hurricane';
        expect(cavContributor.isValid()).toBe(true);
    });

});
