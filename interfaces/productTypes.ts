import { IState } from "./products";

export interface IProductType {
    _id: string;
    name: string;
    tax: number;
    state: IState;

    createdAt?: string;
    updatedAt?: string;
}