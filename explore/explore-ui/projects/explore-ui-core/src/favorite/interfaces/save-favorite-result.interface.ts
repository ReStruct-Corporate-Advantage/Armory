// Represents the response structure returned from FavoriteService.saveFavorite$
export interface SaveFavoriteResult {
    status: string;
    message: string;
    favoriteId?: number|string;
    owner?: string;
    type?: string;
    currentFavoriteVersion?: string;
    latestFavoriteVersion?: string;
    versionNumber?: number;
}
