import {ClimateDamageFunction} from './climate-damage-function.model';

describe('ClimateDamageFunction', () => {

    it('should initialize a new damage function', () => {
        const damageFunction = new ClimateDamageFunction();
        expect(damageFunction.damageFunctionField).toBeUndefined();
        expect(damageFunction.damageFunctionDisplayName).toBeUndefined();
    });

    it('should serialize and deserialize', () => {
        const damageFunction = new ClimateDamageFunction();
        damageFunction.damageFunctionDisplayName = 'Hurricane Cost';
        damageFunction.damageFunctionField = 'pct_change_damage_hurricane';

        const serializedData = damageFunction.serialize();
        const newDamageFunction = new ClimateDamageFunction();
        // should not be equal initially
        expect(damageFunction.equals(newDamageFunction)).toBe(false);
        newDamageFunction.deserialize(serializedData);
        expect(damageFunction.equals(newDamageFunction)).toBe(true);
    });

    it('should check if equal', function () {
        const climateDamageFunctionOption = new ClimateDamageFunction();
        climateDamageFunctionOption.damageFunctionDisplayName = 'Hurricane Cost';
        climateDamageFunctionOption.damageFunctionField = 'pct_change_damage_hurricane';

        const newDamageFunction = new ClimateDamageFunction();
        // Not equal
        expect(climateDamageFunctionOption.equals(newDamageFunction)).toStrictEqual(false);

        // Not equals null
        expect(newDamageFunction.equals(null)).toStrictEqual(false);

        // Not equals undefined
        expect(newDamageFunction.equals(undefined)).toStrictEqual(false);

        // Equal
        newDamageFunction.damageFunctionDisplayName = climateDamageFunctionOption.damageFunctionDisplayName;
        newDamageFunction.damageFunctionField = climateDamageFunctionOption.damageFunctionField;
        expect(climateDamageFunctionOption.equals(newDamageFunction)).toStrictEqual(true);
    });

    it('should check if valid', function () {
        const climateDamageFunctionOption = new ClimateDamageFunction();

        // Invalid
        climateDamageFunctionOption.damageFunctionDisplayName = undefined;
        expect(climateDamageFunctionOption.isValid()).toStrictEqual(false);

        climateDamageFunctionOption.damageFunctionDisplayName = 'Hurricane Cost';
        climateDamageFunctionOption.damageFunctionField = undefined;
        expect(climateDamageFunctionOption.isValid()).toStrictEqual(false);

        climateDamageFunctionOption.damageFunctionField = 'pct_change_damage_hurricane';
        // Valid
        expect(climateDamageFunctionOption.isValid()).toStrictEqual(true);
    });
});
