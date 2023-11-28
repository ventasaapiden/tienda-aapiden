import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import { isValidObjectId } from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { IProductType } from '../../../interfaces/productTypes';
import ProductType from '../../../models/ProductType';

type Data = 
| {message: string}
| {productTypes: IProductType[], totalProductTypes: Number, totalPages: Number}
| IProductType

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const validRoles = ['admin'];
    if(!session || !validRoles.includes(session.user.role)){
        return res.status(400).json({message: 'No autorizado'});
    }

    switch(req.method){
        case 'GET': 
            return getProductTypes(req, res);

        case 'PUT': 
            return updateProductType(req, res);

        case 'POST': 
            return createProductType(req, res);
        
        default:
            return res.status(400).json({message: 'Bad Request'});
    }

}

const getProductTypes = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { page = 1, pageSize = 10 } = req.query;
    const parsedPage = parseInt(page as string, 10);
    const parsedPageSize = parseInt(pageSize as string, 10);

    if (isNaN(parsedPage) || isNaN(parsedPageSize)) {
        return res.status(400).json({ message: 'Los parámetros de paginación deben ser números válidos.' });
    }

    if (parsedPage <= 0 || parsedPageSize <= 0) {
        return res.status(400).json({ message: 'Los números de página y tamaño de página deben ser mayores a cero.' });
    }

    const skip = (parsedPage - 1) * parsedPageSize;

    try {

        await connectDB();

        const totalProductTypes = await ProductType.countDocuments();
        const totalPages = Math.ceil(totalProductTypes / parsedPageSize);

        const productTypes = await ProductType.find().sort({name: 'asc'}).skip(skip).limit(parsedPageSize).lean();

        await disconnectDB();

        return res.status(200).json({ productTypes, totalProductTypes: totalProductTypes, totalPages });

    } catch (error) {
        return res.status(500).json({ message: 'Error cargando tipos de productos'});
    }

}

const updateProductType = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {_id = ''} = req.body as IProductType;

    if(!isValidObjectId(_id)){
        return res.status(400).json({message: 'El ID del tipo de producto no es válido'});
    }

    try {

        await connectDB();

        const productType = await ProductType.findById(_id);

        if(!productType){
            await disconnectDB();
            return res.status(400).json({message: 'No existe un tipo de producto con ese ID'});
        }

        await productType.update(req.body);
        await disconnectDB();

        return res.status(200).json(productType);
        
    } catch (error) {
        //console.log(error);
        await disconnectDB();
        return res.status(400).json({message: 'Revisar la consola del servidor'});
    }

}

const createProductType = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    try {

        await connectDB();

        const productType = new ProductType(req.body);
        await productType.save();
        await disconnectDB();

        return res.status(201).json(productType);
        
    } catch (error) {
        //console.log(error);
        await disconnectDB();
        return res.status(400).json({message: 'Revisar la consola del servidor'});
    }

}