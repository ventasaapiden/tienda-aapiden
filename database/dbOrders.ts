import { isValidObjectId } from "mongoose";
import { IOrder } from "../interfaces/order";
import Order from "../models/Order";
import { connectDB, disconnectDB } from './db';

export const getOrderById = async(id: string): Promise<IOrder | null> => {

    if(!isValidObjectId(id)){
        return null;
    }

    try{

        await connectDB();

        const order = await Order.findById(id).lean();

        await disconnectDB();

        if(!order){
            return null;
        }

        return JSON.parse(JSON.stringify(order));

    } catch (error) {
        return null;
    }

}

export const getOrdersByUser = async(id: string, state: string): Promise<IOrder[] | null> => {

    if(!isValidObjectId(id)){
        return [];
    }

    let condicion = {};  

    if(state != 'pendiente' && state != 'pagada' && state != 'entregada'){
        condicion = {user: id};
    }else{
        condicion = {user: id, state};
    }

    try{

        await connectDB();

        const orders = await Order.find(condicion).sort({createdAt: 'desc'}).lean();

        await disconnectDB();

        return JSON.parse(JSON.stringify(orders));

    } catch (error) {
        return null;
    }

}