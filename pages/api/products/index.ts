import mongoose, { isValidObjectId } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db'
import Product from '../../../models/Product';
import { IProduct } from '../../../interfaces/products';

type Data = 
| { message: string }
| {products: IProduct[], totalProducts: Number, totalPages: Number}
| IProduct

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getProducts(req, res)

            
        default:
            return res.status(400).json({ message: 'Bad request' })
    }

}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {slug} = req.query;

    if(slug){ //GetProductsBySlug

        try {
            await connectDB();
            const productToGet = await Product.findOne({slug}).lean();
            await disconnectDB();
    
            if(!productToGet){
                return res.status(404).json({message: 'No hay un producto con ese slug: ' + slug});
            }

            productToGet.images = productToGet.images.map((image) => {
                return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`
            })        
    
            return res.status(200).json(productToGet!);
    
        } catch (error) {
            await disconnectDB();
            //console.log(error);
    
            return res.status(400).json({message: 'Algo salió mal'});
        }

    }else{ //getAllProducts for home

        try {

            let {filter = ''} = req.query;

            let condition = {};

            if(filter != 'todos' && filter != '' && isValidObjectId(filter)){
                condition = {productType: filter, state: 'activo', inStock: { $gte: 1 }};
            }else{
                condition = { state: 'activo', inStock: { $gte: 1 } };
            }

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

            await connectDB();

            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / parsedPageSize);

            const products = await Product.find(condition).sort({title: 'asc'}).skip(skip).limit(parsedPageSize)
                                        .select('title images price inStock slug -_id')
                                        .populate('productType', '_id name tax state')
                                        .lean();

            await disconnectDB();

            const updatedProducts = products.map(product => {
                product.images = product.images.map((image) => {
                    return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`
                })
                return product;
            })

            return res.status(200).json({ products: updatedProducts, totalProducts, totalPages });
            
        } catch (error) {
            await disconnectDB();
            //console.log(error);
    
            return res.status(400).json({message: 'Algo salió mal'});
        }

    }

}