import 'jest-preset-angular/setup-jest';
import './jest.global-mocks';

HTMLCanvasElement.prototype.getContext = jest.fn();
