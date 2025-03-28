/**
 * FavoriteReportParameters serves to capture the data inputs needed for
 * report configurations
 */
export class FavoriteConfigParameters {
   favoriteId: number|string;
   favoriteType: string;
   title: string;
   owner: string;

    constructor(favoriteId: number|string, favoriteType: string, title: string, owner: string) {
        this.favoriteId = favoriteId;
        this.favoriteType = favoriteType;
        this.title = title;
        this.owner = owner;
    }
}
