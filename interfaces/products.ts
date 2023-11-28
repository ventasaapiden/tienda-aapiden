import { IProductType } from "./productTypes";

export interface IProduct {
    _id: string;
    productType?: IProductType | string;
    description: string;
    images: string[];
    inStock: number;
    weight: number;
    price: number;
    slug: string;
    tags: string[];
    title: string;
    state: IState;

    createdAt: string;
    updatedAt: string;
}

export type IState = 'activo'|'inactivo';