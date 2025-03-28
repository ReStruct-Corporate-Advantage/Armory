/**
 * Constants class for custom calculation
 */
export class CustomCalculationConstants {

    static readonly CUSTOM_CALCULATION = 'custom_calc';
    static readonly PGS_CUSTOM_CALCULATION = 'pgs_custom_calc';

    static readonly PORTFOLIO = 'portfolio';
    static readonly SECURITY = 'security';
    static readonly PARENT = 'parent';
    static readonly FIRST_LEVEL = 'firstLevel';
    static readonly TOTAL = 'total';

    static readonly Reserved_WORDS: string[] = ['byte','case','char','do','else','enum','for','if','goto','in','int','long','new','null','short','super','this','try','true','try','var','void','with','class','const','top','NaN','eval'];

    static readonly PGS_MEASURE_NODES: string[] = [CustomCalculationConstants.PORTFOLIO, CustomCalculationConstants.PARENT, CustomCalculationConstants.FIRST_LEVEL, CustomCalculationConstants.TOTAL];
    static readonly MEASURE_NODES: string[] = [CustomCalculationConstants.SECURITY, CustomCalculationConstants.PARENT, CustomCalculationConstants.FIRST_LEVEL, CustomCalculationConstants.TOTAL];
    static readonly SINGLE_MEASURE_NODES: string[] = [CustomCalculationConstants.SECURITY];
    static readonly INVALID_JS_EXPRESSION_MESSAGE = 'Invalid custom calculation expression. Expression should not include keywords such as alert, document, confirm, prompt, console, for, forEach, while, window, system, java.type, T(';

    static readonly SHORTCUT_ENTRY: any = {
        '+': '+',
        'x': '*',
        '-': '-',
        '/': '/',
        'equals': '===',
        'comment': '//',
        'if/else': 'if(var1 === var2) {\n' +
            '  VALUE;\n' +
            '} else {\n' +
            '  VALUE;\n' +
            '}',
        '|x|': 'Math.abs(var1)',
        'ceiling': 'Math.ceil(var1)',
        'floor': 'Math.floor(var1)',
        'round': 'Math.round(var1)',
        'max': 'Math.max(var1,var2,var3,...,var(n))',
        'min': 'Math.min(var1,var2,var3,...,var(n))',
        'x^y': 'Math.pow(base, exponent)'
    };

    static readonly MATH_FUNCTION_OPERATIONS: any = [
        {name: 'comment', tooltip: 'comments'},
        {name: 'if/else', tooltip: 'if/else clause'},
        {name: '|x|', tooltip: 'Returns the absolute value of x'},
        {name: 'ceiling', tooltip: 'Returns x, rounded upwards to the nearest integer'},
        {name: 'floor', tooltip: 'Returns x, rounded downwards to the nearest integer'},
        {name: 'round', tooltip: 'Rounds x to the nearest integer'},
        {name: 'max', tooltip: 'Returns the number with the highest value'},
        {name: 'min', tooltip: 'Returns the number with the lowest value'},
        {name: 'x^y', tooltip: 'Returns the value of x to the power of y'}
    ];

    static readonly ARITHMETIC_OPERATIONS: any = [
        {name: '+', tooltip: 'plus'},
        {name: '-', tooltip: 'minus'},
        {name: 'x', tooltip: 'multiply'},
        {name: '/', tooltip: 'divide'}
    ];
}
