import {ICellRendererComp, ICellRendererParams} from 'ag-grid-community';
import {WidgetUtils} from '@utils/widget.utils';
import {CommonConstants} from '@constants/common.constants';

/**
 * cell renderer class for explore pivot table
 */
export class ListCellRenderer implements ICellRendererComp {
    eDiv: HTMLElement;

    /**
     * initialize the renderer template
     */
    init(params: ICellRendererParams): void {
        this.eDiv = document.createElement('table');
        this.eDiv.setAttribute('style', 'width: 100%;');
        this.eDiv.innerHTML = this.getUpdatedHTML(params);
    }

    /**
     * return the renderer template
     */
    getGui(): HTMLElement {
        return this.eDiv;
    }

    /**
     * gets called on the call of grid api refreshCells funtion
     */
    refresh(params: any): boolean {
        this.eDiv.innerHTML = this.getUpdatedHTML(params);
        return true;
    }

    /**
     * logic to update the template with formatted values
     */
    private getUpdatedHTML(params: ICellRendererParams): string {
        const formatter = params['vizPivotColumnObject'].formatter;
        // assumption - entries in 'scaledAt' must only be present in case of scaling via shortcuts
        // else we default to regular approach (widget loads for first time / widget data reloads)
        const previousScaling: number = params.context && params.context[CommonConstants.INITIAL_SCALING_INFO] && params.context[CommonConstants.INITIAL_SCALING_INFO][params.colDef.field];
        return Array.isArray(params.value)
            ? params.value.map(row => `<tr><td style="text-align: left;">${row.name}</td><td style="text-align: right;">${formatter.format(WidgetUtils.getInputValueToFormat(row.value, formatter, false, previousScaling))}</td></tr>`).join('')
            : `<tr><td style="text-align: right;">${formatter.format(WidgetUtils.getInputValueToFormat(params.value, formatter, false, previousScaling))}</td></tr>`;
    }
}
