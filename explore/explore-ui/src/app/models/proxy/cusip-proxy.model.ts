/**
 * Cusip Proxy Model
 */
export class CusipProxy {
    endDate: Date;
    override: string;
    originalCusip: string;

    /**
     * constructor
     */
    constructor(endDate: string, override: string, originalCusip: string) {
        this.endDate = new Date(endDate);
        this.override = override;
        this.originalCusip = originalCusip;
    }
}
