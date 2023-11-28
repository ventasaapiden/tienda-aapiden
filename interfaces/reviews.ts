import { IProduct } from "./products";
import { IUser } from "./users";

export interface IReview {
    _id: string;
    user?: IUser | string;
    product?: IProduct | string;
    rating: number;
    review: string;

    createdAt?: string;
    updatedAt?: string;
}