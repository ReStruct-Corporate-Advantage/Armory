export interface FavoriteVersioning {
    id: number|string; // Favorite id
    type: string;
    isOpen: boolean;
    loadFavoriteCallBack?: Function;
}
