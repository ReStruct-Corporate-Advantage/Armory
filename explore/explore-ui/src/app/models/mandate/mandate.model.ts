/**
 * This class holds a mandate object
 */
export class Mandate {
    value: string;

    // display label
    label: string;

    // mandate type, this mandate belongs to
    mandateType: string;

    // mandate type label field
    mandateTypeLabel: string;

    constructor(value: string, label: string, mandateType: string, mandateTypeLabel?: string) {
        this.value = value;
        this.label = label;
        this.mandateType = mandateType;
        this.mandateTypeLabel = mandateTypeLabel;
    }
}
