import { IProductType } from "./productTypes";

export interface ICartProduct {
    _id: string;
    image: string;
    price: number;
    slug: string;
    weight: number;
    title: string;
    quantity: number;
    productType: IProductType;
}