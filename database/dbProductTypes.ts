
import { isValidObjectId } from 'mongoose';
import { IProductType } from '../interfaces/productTypes';
import { connectDB, disconnectDB } from './db';
import ProductType from '../models/ProductType';

export const getProductTypeById = async(id: string): Promise<IProductType | null> => {

    if(!isValidObjectId(id)){
        return null;
    }

    try{

        await connectDB();

        const productType = await ProductType.findById(id).lean();

        await disconnectDB();

        if(!productType){
            return null;
        }

        return JSON.parse(JSON.stringify(productType));

    } catch (error) {
        return null;
    }

}

export const getAllProductTypes = async(): Promise<IProductType[] | null> => {

    try{

        await connectDB();
        const productTypes = await ProductType.find({ state: 'activo' }).sort({name: 'asc'}).lean();
        await disconnectDB();

        return JSON.parse(JSON.stringify(productTypes));

    } catch (error) {
        return null;
    }

}
