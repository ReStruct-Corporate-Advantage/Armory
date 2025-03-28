import {calculateNewColorAxisGradient, updateChartColor, generatePalette, calculateMedian} from './explore-chart-color.utils';
import { ColorScaleMidpointOption } from '@enums/color-scale-midpoint-option';
import { ColorScaleGradientOption } from '@enums/color-scale-gradient-option.enum';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';

describe('updateChartColor Test', () => {
    const chart: any = {
        series: [
            {
                setData: jest.fn()
            }
        ],
        addData: jest.fn(),
        addSeries: jest.fn(),
        update: jest.fn()
    };
    beforeAll(() => {
        chart.colorAxis = [{ min: -25000000, max: 75000000, update: jest.fn() }];
    });

    it('should calculateMedianEven', () => {
        const newData =  [ { name: 'Market Value 1', colorValue: 1 },
            { name: 'Market Value 2', colorValue: 2 },
            { name: 'Market Value 3', colorValue: 3 },
            { name: 'Market Value 4', colorValue: 4 }
        ];
        expect(calculateMedian(newData)).toEqual(2.5);
    });

    it('should calculateMedianOdd', () => {
        const newData =  [ { name: 'Market Value 1', colorValue: 1 },
            { name: 'Market Value 2', colorValue: 2 },
            { name: 'Market Value 3', colorValue: 3 }
        ];
        expect(calculateMedian(newData)).toEqual(2);
    });

    it('should updateChartColor', () => {

        const colorScaleOptions = {
            colorRangeSelection: ColorScaleGradientOption.PINK_TO_BLUE ,
            colorMidPointSelection: ColorScaleMidpointOption.ZERO_CENTERED ,
            colorFormatSelection: ColorScaleFormatOption.THREE_COLOR_SCALE
        };
        updateChartColor(chart, [0, 10000], colorScaleOptions);


        expect(chart.series[0].setData).not.toHaveBeenCalled();
    });
    describe('calculateNewColorAxisGradient Test', () => {
        it('should calculateNewColorAxisGradient', () => {
            const colorScaleOptions = {
                colorRangeSelection: ColorScaleGradientOption.PINK_TO_BLUE,
                colorMidPointSelection: ColorScaleMidpointOption.ZERO_CENTERED ,
                colorFormatSelection: ColorScaleFormatOption.THREE_COLOR_SCALE
            };
            const colorScaleOptions1 = {
                colorRangeSelection: ColorScaleGradientOption.RED_TO_GREEN,
                colorMidPointSelection: ColorScaleMidpointOption.AUTO_SCALE ,
                colorFormatSelection: ColorScaleFormatOption.THREE_COLOR_SCALE
            };
            const colorScaleOptions2 = {
                colorRangeSelection: ColorScaleGradientOption.RED_TO_GREEN ,
                colorMidPointSelection: ColorScaleMidpointOption.AUTO_SCALE ,
                colorFormatSelection: ColorScaleFormatOption.THREE_COLOR_SCALE
            };
            // Case 1: DEFAULT gradient OR both min and max are positive
            expect(calculateNewColorAxisGradient([0, 10000], colorScaleOptions)).toEqual({
                stops: [
                    [
                        0,
                        "#e4f4fe"
                    ],
                    [
                        0,
                        "#cdeafe"
                    ],
                    [
                        0,
                        "#F1F2F4"
                    ],
                    [1, '#69c0fa']
                ]
        });
        expect(calculateNewColorAxisGradient([0, 10000], colorScaleOptions1)).toEqual({
            stops: [
                [
                    0,
                    "#c5fbcf"
                ],
                [
                    0,
                    "#95f7a7"
                ],
                [
                    0,
                    "#67f280"
                ],
                [
                    0,
                    "#F1F2F4"
                ],
                [
                    0.3333333333333333,
                    "#13e236"
                ],
                [
                    0.6666666666666666,
                    "#04bd24"
                ],

                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([0, 10000], colorScaleOptions2)).toEqual({
                stops: [
                    [
                        0,
                        "#c5fbcf"
                    ],
                    [
                        0,
                        "#95f7a7"
                    ],
                    [
                        0,
                        "#67f280"
                    ],
                    [
                        0,
                        "#F1F2F4"
                    ],
                    [
                        0.3333333333333333,
                        "#13e236"
                    ],
                    [
                        0.6666666666666666,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 2: both min and max are negative=
        expect(calculateNewColorAxisGradient([-10000, 0], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'],
                [
                    0,
                    '#f49bed'
                ],
                [
                    0,
                    '#ef6ce5'
                ],
                [
                    0.5,
                    '#fff4fe'
                ],
                [
                    1,
                    "#F1F2F4"
                ]
            ]
        });
        expect(calculateNewColorAxisGradient([-10000, 0], colorScaleOptions1)).toEqual({
            stops: [
                [0, '#8c0200'],
                [
                    0,
                    '#bc0300'
                ],
                [
                    0,
                    '#d90400'
                ],
                [
                    0,
                    "#ff2825"
                ],
                [
                    0,
                    "#8c0200"
                ],
                [
                    0.3333333333333333,
                    "#ff8a89"
                ],
                [
                    0.6666666666666666,
                    "#ffbbbb"
                ],
                [
                    1,
                    "#F1F2F4"
                ]
            ]
        });
            expect(calculateNewColorAxisGradient([-10000, 0], colorScaleOptions2)).toEqual({
                stops: [
                    [0, '#8c0200'],
                    [
                        0,
                        '#bc0300'
                    ],
                    [
                        0,
                        '#d90400'
                    ],
                    [
                        0,
                        '#ff2825'
                    ],
                    [
                        0,
                        '#8c0200'
                    ],
                    [
                        0.3333333333333333,
                        '#ff8a89'
                    ],
                    [
                        0.6666666666666666,
                        '#ffbbbb'
                    ],

                    [
                        1,
                        '#F1F2F4'
                    ]
                ]
            });
        // Case 3: (50 : 50 ratio -- symmetric) - absMin / max ~= 1
        expect(calculateNewColorAxisGradient([-0.49961863999971623, 0.5003813600002838], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'], // Purple-Red50
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-0.49961863999971623, 0.5003813600002838], colorScaleOptions1)).toEqual({
            stops: [
                [0, '#8c0200'],
                [
                    0.07142857142857142,
                    "#bc0300"
                ],
                [
                    0.14285714285714285,
                    "#d90400"
                ],
                [
                    0.21428571428571427,
                    "#ff2825"
                ],
                [
                    0.2857142857142857,
                    "#ff5755"
                ],
                [
                    0.3571428571428571,
                    "#ff8a89"
                ],
                [
                    0.42857142857142855,
                    "#ffbbbb"
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.5714285714285714,
                    "#c5fbcf"
                ],
                [
                    0.6428571428571428,
                    "#95f7a7"
                ],
                [
                    0.7142857142857143,
                    "#67f280"
                ],
                [
                    0.7857142857142857,
                    "#3aef59"
                ],
                [
                    0.8571428571428571,
                    "#13e236"
                ],
                [
                    0.9285714285714286,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-0.49961863999971623, 0.5003813600002838], colorScaleOptions2)).toEqual({
                stops: [
                    [0, '#8c0200'],
                    [
                        0.07142857142857142,
                        '#bc0300'
                    ],
                    [
                        0.14285714285714285,
                        '#d90400'
                    ],
                    [
                        0.21428571428571427,
                        '#ff2825'
                    ],
                    [
                        0.2857142857142857,
                        '#ff5755'
                    ],
                    [
                        0.3571428571428571,
                        '#ff8a89'
                    ],
                    [
                        0.42857142857142855,
                        '#ffbbbb'
                    ],
                    [
                        0.5,
                        "#F1F2F4"
                    ],
                    [
                        0.5714285714285714,
                        "#c5fbcf"
                    ],
                    [
                        0.6428571428571428,
                        "#95f7a7"
                    ],
                    [
                        0.7142857142857143,
                        "#67f280"
                    ],
                    [
                        0.7857142857142857,
                        "#3aef59"
                    ],
                    [
                        0.8571428571428571,
                        "#13e236"
                    ],
                    [
                        0.9285714285714286,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 4: (33 : 66 or 1 : 2 ratio)
        expect(calculateNewColorAxisGradient([-5000, 10000], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'],
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-5000, 10000], colorScaleOptions1)).toEqual({
            stops: [
                [0, '#8c0200'],
                [
                    0.047619047619047616,
                    "#bc0300"
                ],
                [
                    0.09523809523809523,
                    "#d90400"
                ],
                [
                    0.14285714285714285,
                    "#ff2825"
                ],
                [
                    0.19047619047619047,
                    "#ff5755"
                ],
                [
                    0.23809523809523808,
                    "#ff8a89"
                ],
                [
                    0.2857142857142857,
                    "#ffbbbb"
                ],
                [
                    0.3333333333333333,
                    "#F1F2F4"
                ],
                [
                    0.42857142857142855,
                    "#c5fbcf"
                ],
                [
                    0.5238095238095238,
                    "#95f7a7"
                ],
                [
                    0.6190476190476191,
                    "#67f280"
                ],
                [
                    0.7142857142857143,
                    "#3aef59"
                ],
                [
                    0.8095238095238095,
                    "#13e236"
                ],
                [
                    0.9047619047619049,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-5000, 10000], colorScaleOptions2)).toEqual({
                stops: [
                    [0, '#8c0200'],
                    [
                        0.047619047619047616,
                        '#bc0300'
                    ],
                    [
                        0.09523809523809523,
                        '#d90400'
                    ],
                    [
                        0.14285714285714285,
                        '#ff2825'
                    ],
                    [
                        0.19047619047619047,
                        '#ff5755'
                    ],
                    [
                        0.23809523809523808,
                        '#ff8a89'
                    ],
                    [
                        0.2857142857142857,
                        '#ffbbbb'
                    ],
                    [
                        0.3333333333333333,
                        "#F1F2F4"
                    ],
                    [
                        0.42857142857142855,
                        "#c5fbcf"
                    ],
                    [
                        0.5238095238095238,
                        "#95f7a7"
                    ],
                    [
                        0.6190476190476191,
                        "#67f280"
                    ],
                    [
                        0.7142857142857143,
                        "#3aef59"
                    ],
                    [
                        0.8095238095238095,
                        "#13e236"
                    ],
                    [
                        0.9047619047619049,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 5: (25 : 75 or 1 : 3 ratio)
        expect(calculateNewColorAxisGradient([-25000000, 75000000], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'],
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-25000000, 75000000], colorScaleOptions1)).toEqual({
            stops: [
                [0, '#8c0200'],
                [
                    0.03571428571428571,
                    "#bc0300"
                ],
                [
                    0.07142857142857142,
                    "#d90400"
                ],
                [
                    0.10714285714285714,
                    "#ff2825"
                ],
                [
                    0.14285714285714285,
                    "#ff5755"
                ],
                [
                    0.17857142857142855,
                    "#ff8a89"
                ],
                [
                    0.21428571428571427,
                    "#ffbbbb"
                ],
                [
                    0.25,
                    "#F1F2F4"
                ],
                [
                    0.35714285714285715,
                    "#c5fbcf"
                ],
                [
                    0.4642857142857143,
                    "#95f7a7"
                ],
                [
                    0.5714285714285714,
                    "#67f280"
                ],
                [
                    0.6785714285714286,
                    "#3aef59"
                ],
                [
                    0.7857142857142857,
                    "#13e236"
                ],
                [
                    0.8928571428571428,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-25000000, 75000000], colorScaleOptions2)).toEqual({
                stops: [
                    [0, '#8c0200'],
                    [
                        0.03571428571428571,
                        '#bc0300'
                    ],
                    [
                        0.07142857142857142,
                        '#d90400'
                    ],
                    [
                        0.10714285714285714,
                        '#ff2825'
                    ],
                    [
                        0.14285714285714285,
                        '#ff5755'
                    ],
                    [
                        0.17857142857142855,
                        '#ff8a89'
                    ],
                    [
                        0.21428571428571427,
                        '#ffbbbb'
                    ],
                    [
                        0.25,
                        "#F1F2F4"
                    ],
                    [
                        0.35714285714285715,
                        "#c5fbcf"
                    ],
                    [
                        0.4642857142857143,
                        "#95f7a7"
                    ],
                    [
                        0.5714285714285714,
                        "#67f280"
                    ],
                    [
                        0.6785714285714286,
                        "#3aef59"
                    ],
                    [
                        0.7857142857142857,
                        "#13e236"
                    ],
                    [
                        0.8928571428571428,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 6: (20 : 80 or 1 : 4 ratio)
        expect(calculateNewColorAxisGradient([-20000000, 80000000], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'],
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-20000000, 80000000], colorScaleOptions1)).toEqual({
            stops: [
                [0, '#8c0200'],
                [
                    0.028571428571428574,
                    "#bc0300"
                ],
                [
                    0.05714285714285715,
                    "#d90400"
                ],
                [
                    0.08571428571428572,
                    "#ff2825"
                ],
                [
                    0.1142857142857143,
                    "#ff5755"
                ],
                [
                    0.14285714285714288,
                    "#ff8a89"
                ],
                [
                    0.17142857142857143,
                    "#ffbbbb"
                ],
                [
                    0.2,
                    "#F1F2F4"
                ],
                [
                    0.3142857142857143,
                    "#c5fbcf"
                ],
                [
                    0.4285714285714286,
                    "#95f7a7"
                ],
                [
                    0.5428571428571429,
                    "#67f280"
                ],
                [
                    0.6571428571428573,
                    "#3aef59"
                ],
                [
                    0.7714285714285716,
                    "#13e236"
                ],
                [
                    0.8857142857142857,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-20000000, 80000000], colorScaleOptions2)).toEqual({
                stops: [
                    [0, '#8c0200'],
                    [
                        0.028571428571428574,
                        '#bc0300'
                    ],
                    [
                        0.05714285714285715,
                        '#d90400'
                    ],
                    [
                        0.08571428571428572,
                        '#ff2825'
                    ],
                    [
                        0.1142857142857143,
                        '#ff5755'
                    ],
                    [
                        0.14285714285714288,
                        '#ff8a89'
                    ],
                    [
                        0.17142857142857143,
                        '#ffbbbb'
                    ],
                    [
                        0.2,
                        "#F1F2F4"
                    ],
                    [
                        0.3142857142857143,
                        "#c5fbcf"
                    ],
                    [
                        0.4285714285714286,
                        "#95f7a7"
                    ],
                    [
                        0.5428571428571429,
                        "#67f280"
                    ],
                    [
                        0.6571428571428573,
                        "#3aef59"
                    ],
                    [
                        0.7714285714285716,
                        "#13e236"
                    ],
                    [
                        0.8857142857142857,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 7: (66 : 33 or 2 : 1 ratio)
        expect(calculateNewColorAxisGradient([-10000, 5000], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'], // Purple-Red50
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-10000, 5000], colorScaleOptions1)).toEqual({
            stops: [
                [0, '#8c0200'],
                [
                    0.09523809523809523,
                    "#bc0300"
                ],
                [
                    0.19047619047619047,
                    "#d90400"
                ],
                [
                    0.2857142857142857,
                    "#ff2825"
                ],
                [
                    0.38095238095238093,
                    "#ff5755"
                ],
                [
                    0.47619047619047616,
                    "#ff8a89"
                ],
                [
                    0.5714285714285714,
                    "#ffbbbb"
                ],
                [
                    0.6666666666666666,
                    "#F1F2F4"
                ],
                [
                    0.7142857142857143,
                    "#c5fbcf"
                ],
                [
                    0.7619047619047619,
                    "#95f7a7"
                ],
                [
                    0.8095238095238095,
                    "#67f280"
                ],
                [
                    0.8571428571428571,
                    "#3aef59"
                ],
                [
                    0.9047619047619048,
                    "#13e236"
                ],
                [
                    0.9523809523809523,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-10000, 5000], colorScaleOptions2)).toEqual({
                stops: [
                    [0, '#8c0200'],
                    [
                        0.09523809523809523,
                        '#bc0300'
                    ],
                    [
                        0.19047619047619047,
                        '#d90400'
                    ],
                    [
                        0.2857142857142857,
                        '#ff2825'
                    ],
                    [
                        0.38095238095238093,
                        '#ff5755'
                    ],
                    [
                        0.47619047619047616,
                        '#ff8a89'
                    ],
                    [
                        0.5714285714285714,
                        '#ffbbbb'
                    ],
                    [
                        0.6666666666666666,
                        "#F1F2F4"
                    ],
                    [
                        0.7142857142857143,
                        "#c5fbcf"
                    ],
                    [
                        0.7619047619047619,
                        "#95f7a7"
                    ],
                    [
                        0.8095238095238095,
                        "#67f280"
                    ],
                    [
                        0.8571428571428571,
                        "#3aef59"
                    ],
                    [
                        0.9047619047619048,
                        "#13e236"
                    ],
                    [
                        0.9523809523809523,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 8: (75 : 25 ratio or 3 : 1)
        expect(calculateNewColorAxisGradient([-75000000, 25000000], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'], // Purple-Red50
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-75000000, 25000000], colorScaleOptions1)).toEqual({
            stops: [
                [0,  '#8c0200'],
                [
                    0.10714285714285714,
                    "#bc0300"
                ],
                [
                    0.21428571428571427,
                    "#d90400"
                ],
                [
                    0.3214285714285714,
                    "#ff2825"
                ],
                [
                    0.42857142857142855,
                    "#ff5755"
                ],
                [
                    0.5357142857142857,
                    "#ff8a89"
                ],
                [
                    0.6428571428571428,
                    "#ffbbbb"
                ],
                [
                    0.75,
                    "#F1F2F4"
                ],
                [
                    0.7857142857142857,
                    "#c5fbcf"
                ],
                [
                    0.8214285714285714,
                    "#95f7a7"
                ],
                [
                    0.8571428571428571,
                    "#67f280"
                ],
                [
                    0.8928571428571428,
                    "#3aef59"
                ],
                [
                    0.9285714285714286,
                    "#13e236"
                ],
                [
                    0.9642857142857143,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-75000000, 25000000], colorScaleOptions2)).toEqual({
                stops: [
                    [0,  '#8c0200'],
                    [
                        0.10714285714285714,
                        '#bc0300'
                    ],
                    [
                        0.21428571428571427,
                        '#d90400'
                    ],
                    [
                        0.3214285714285714,
                        '#ff2825'
                    ],
                    [
                        0.42857142857142855,
                        '#ff5755'
                    ],
                    [
                        0.5357142857142857,
                        '#ff8a89'
                    ],
                    [
                        0.6428571428571428,
                        '#ffbbbb'
                    ],
                    [
                        0.75,
                        "#F1F2F4"
                    ],
                    [
                        0.7857142857142857,
                        "#c5fbcf"
                    ],
                    [
                        0.8214285714285714,
                        "#95f7a7"
                    ],
                    [
                        0.8571428571428571,
                        "#67f280"
                    ],
                    [
                        0.8928571428571428,
                        "#3aef59"
                    ],
                    [
                        0.9285714285714286,
                        "#13e236"
                    ],
                    [
                        0.9642857142857143,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
        // Case 9: (80 : 20 or 4 : 1 ratio)
        expect(calculateNewColorAxisGradient([-8000000, 2000000], colorScaleOptions)).toEqual({
            stops: [
                [0, '#ef6ce5'],
                [
                    0.125,
                    '#f49bed'
                ],
                [
                    0.25,
                    '#f9c6f5'
                ],
                [
                    0.375,
                    '#fff4fe'
                ],
                [
                    0.5,
                    "#F1F2F4"
                ],
                [
                    0.625,
                    "#e4f4fe"
                ],
                [
                    0.75,
                    "#cdeafe"
                ],
                [
                    0.875,
                    "#9bd5fc"
                ],
                [1, '#69c0fa']
            ]
        });
        expect(calculateNewColorAxisGradient([-8000000, 2000000], colorScaleOptions1)).toEqual({
            stops: [
                [0,  '#8c0200'],
                [
                    0.1142857142857143,
                    "#bc0300"
                ],
                [
                    0.2285714285714286,
                    "#d90400"
                ],
                [
                    0.34285714285714286,
                    "#ff2825"
                ],
                [
                    0.4571428571428572,
                    "#ff5755"
                ],
                [
                    0.5714285714285715,
                    "#ff8a89"
                ],
                [
                    0.6857142857142857,
                    "#ffbbbb"
                ],
                [
                    0.8,
                    "#F1F2F4"
                ],
                [
                    0.8285714285714286,
                    "#c5fbcf"
                ],
                [
                    0.8571428571428572,
                    "#95f7a7"
                ],
                [
                    0.8857142857142857,
                    "#67f280"
                ],
                [
                    0.9142857142857143,
                    "#3aef59"
                ],
                [
                    0.9428571428571428,
                    "#13e236"
                ],
                [
                    0.9714285714285714,
                    "#04bd24"
                ],
                [1, '#048119']
            ]
        });
            expect(calculateNewColorAxisGradient([-8000000, 2000000], colorScaleOptions2)).toEqual({
                stops: [
                    [0,  '#8c0200'],
                    [
                        0.1142857142857143,
                        '#bc0300'
                    ],
                    [
                        0.2285714285714286,
                        '#d90400'
                    ],
                    [
                        0.34285714285714286,
                        '#ff2825'
                    ],
                    [
                        0.4571428571428572,
                        '#ff5755'
                    ],
                    [
                        0.5714285714285715,
                        '#ff8a89'
                    ],
                    [
                        0.6857142857142857,
                        '#ffbbbb'
                    ],
                    [
                        0.8,
                        "#F1F2F4"
                    ],
                    [
                        0.8285714285714286,
                        "#c5fbcf"
                    ],
                    [
                        0.8571428571428572,
                        "#95f7a7"
                    ],
                    [
                        0.8857142857142857,
                        "#67f280"
                    ],
                    [
                        0.9142857142857143,
                        "#3aef59"
                    ],
                    [
                        0.9428571428571428,
                        "#13e236"
                    ],
                    [
                        0.9714285714285714,
                        "#04bd24"
                    ],
                    [1, '#048119']
                ]
            });
    });

});

});

describe('palette.utils', function() {
    const NEUTRAL_COLOR = '#f1f2f4';
    const colorRangeSelection =  {
        '0': '#005e9b',
            '1': '#007ac9',
            '2': '#0998f6',
            '3': '#3badf8',
            '4': '#69c0fa',
            '5': '#9bd5fc',
            '6': '#cdeafe',
            '7': '#f9c6f5',
            '8': '#f49bed',
            '9': '#ef6ce5',
            '10': '#df48d4',
            '11': '#cb2cc0',
            '12': '#a02398',
            '13': '#7d1276'
    };
    describe('14-color palette', function() {
        let colors;
        beforeAll(() => {
            colors = Object.values(colorRangeSelection);
        });

        it('should generate symmetric', function() {
            const palette = generatePalette(colors, 0.5, NEUTRAL_COLOR);

            expect(palette).toEqual({'stops':
                    [
                [0, '#005e9b'],
                [0.07142857142857142, '#007ac9'],
                [0.14285714285714285, '#0998f6'],
                [0.21428571428571427, '#3badf8'],
                [0.2857142857142857, '#69c0fa'],
                [0.3571428571428571, '#9bd5fc'],
                [0.42857142857142855, '#cdeafe'],
                [0.5, '#f1f2f4'],
                [0.5833333333333334, '#f49bed'],
                [0.6666666666666666, '#ef6ce5'],
                [0.75, '#df48d4'],
                [0.8333333333333333, '#cb2cc0'],
                [0.9166666666666666, '#a02398'],
                [1, '#7d1276']
                ]}
            );
        });

        it('should generate left-skew', function() {
            const palette = generatePalette(colors, 1 / 3, NEUTRAL_COLOR);

            expect(palette).toEqual({'stops': [
                [0, '#005e9b'],
                [0.047619047619047616, '#007ac9'],
                [0.09523809523809523, '#0998f6'],
                [0.14285714285714285, '#3badf8'],
                [0.19047619047619047, '#69c0fa'],
                [0.23809523809523808, '#9bd5fc'],
                [0.2857142857142857, '#cdeafe'],
                [0.3333333333333333, '#f1f2f4'],
                [0.4444444444444444, '#f49bed'],
                [0.5555555555555556, '#ef6ce5'],
                [0.6666666666666667, '#df48d4'],
                [0.7777777777777778, '#cb2cc0'],
                [0.8888888888888888, '#a02398'],
                [1, '#7d1276']
            ]});
        });

        it('should generate right skew', function() {
            const palette = generatePalette(colors, 2 / 3, NEUTRAL_COLOR);

            expect(palette).toEqual({'stops': [
                [0, '#005e9b'],
                [0.09523809523809523, '#007ac9'],
                [0.19047619047619047, '#0998f6'],
                [0.2857142857142857, '#3badf8'],
                [0.38095238095238093, '#69c0fa'],
                [0.47619047619047616, '#9bd5fc'],
                [0.5714285714285714, '#cdeafe'],
                [0.6666666666666666, '#f1f2f4'],
                [0.7222222222222222, '#f49bed'],
                [0.7777777777777778, '#ef6ce5'],
                [0.8333333333333333, '#df48d4'],
                [0.8888888888888888, '#cb2cc0'],
                [0.9444444444444444, '#a02398'],
                [1, '#7d1276']
            ]});
        });
    });

    describe('10-color palette', function() {
        let colors;
        beforeAll(() => {
            colors = Object.values(colorRangeSelection).slice(2, 11);
        });

        it('should generate symmetric', function() {
            const palette = generatePalette(colors, 0.5, NEUTRAL_COLOR);

            expect(palette).toEqual({'stops': [
                [0, '#0998f6'],
                [0.125, '#3badf8'],
                [0.25, '#69c0fa'],
                [0.375, '#9bd5fc'],
                [0.5, '#f1f2f4'],
                [0.625, '#f9c6f5'],
                [0.75, '#f49bed'],
                [0.875, '#ef6ce5'],
                [1, '#df48d4']
            ]});
        });

        it('should generate left-skew', function() {
            const palette = generatePalette(colors, 1 / 3, NEUTRAL_COLOR);

            expect(palette).toEqual({'stops': [
                [0, '#0998f6'],
                [0.08333333333333333, '#3badf8'],
                [0.16666666666666666, '#69c0fa'],
                [0.25, '#9bd5fc'],
                [0.3333333333333333, '#f1f2f4'],
                [0.5, '#f9c6f5'],
                [0.6666666666666667, '#f49bed'],
                [0.8333333333333333, '#ef6ce5'],
                [1, '#df48d4']
            ]});
        });

        it('should generate right skew', function() {
            const palette = generatePalette(colors, 2 / 3, NEUTRAL_COLOR);

            expect(palette).toEqual({'stops': [
                [0, '#0998f6'],
                [0.16666666666666666, '#3badf8'],
                [0.3333333333333333, '#69c0fa'],
                [0.5, '#9bd5fc'],
                [0.6666666666666666, '#f1f2f4'],
                [0.75, '#f9c6f5'],
                [0.8333333333333333, '#f49bed'],
                [0.9166666666666666, '#ef6ce5'],
                [1, '#df48d4']
            ]});
        });
    });
});
