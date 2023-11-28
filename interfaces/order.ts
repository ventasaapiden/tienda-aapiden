import { IProductType } from "./productTypes";
import { IUser } from "./users";

export interface IOrder {

    _id?: string;
    user?: IUser | string;
    orderItems: IOrderItem[];
    shippingAddress: ShippingAddress;

    numberOfItems: number;
    subTotal: number;
    tax: number;
    shippingFee: number;
    total: number;

    deliveryType: IOrderDeliveryType;
    state: IOrderState;
    paidAt?: string;
    transactionId?: string;

    createdAt?: string;
    updatedAt?: string;
}

export type IOrderDeliveryType = 'envio'|'retiro';
export type IOrderState = 'pendiente'|'pagada'|'entregada';

export interface IOrderItem {
    _id: string;
    title: string;
    quantity: number;
    slug: string;
    weight: number;
    image: string;
    price: number;
    productType: IProductType;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    zip: string;
    district: string;
    canton: string;
    province: string;
    country: string;
    phone: string;
}