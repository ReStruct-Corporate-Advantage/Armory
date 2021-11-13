export default class ArmoryEntity {
    private _createdAt: Date = new Date();
    private _createdBy: String = "";
    private _updatedAt: Date = new Date();
    private _updatedBy: String = "";

    constructor (createdAt: Date, createdBy: String) {
        this._createdAt = createdAt;
        this._createdBy = createdBy;
        this._updatedAt = createdAt;
        this._updatedBy = createdBy;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public set createdAt(createdAt: Date) {
        this._createdAt = createdAt;
    }

    public get createdBy(): String {
        return this._createdBy;
    }

    public set createdBy(createdBy: String) {
        this._createdBy = createdBy;
    }

    public get updatedAt() {
        return this._updatedAt;
    }

    public set updatedAt(updatedAt: Date) {
        this._updatedAt = updatedAt;
    }

    public get updatedBy() {
        return this._updatedBy;
    }

    public set updatedBy(updatedBy: String) {
        this._updatedBy = updatedBy;
    }
}