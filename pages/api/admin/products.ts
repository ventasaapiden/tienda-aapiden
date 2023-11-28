import type { NextApiRequest, NextApiResponse } from 'next'
import { IProduct } from '../../../interfaces/products';
import { connectDB, disconnectDB } from '../../../database/db';
import Product from '../../../models/Product';
import { isValidObjectId } from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config(process.env.CLOUDINARY_URL || '');

type Data = 
| {message: string}
| {products: IProduct[], totalProducts: Number, totalPages: Number}
| IProduct

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const validRoles = ['admin'];
    if(!session || !validRoles.includes(session.user.role)){
        return res.status(400).json({message: 'No autorizado'});
    }

    switch(req.method){
        case 'GET': 
            return getProducts(req, res);

        case 'PUT': 
            return updateProduct(req, res);

        case 'POST': 
            return createProduct(req, res);
        
        default:
            return res.status(400).json({message: 'Bad Request'});
    }

}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

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

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / parsedPageSize);

        const products = await Product.find().sort({title: 'asc'}).skip(skip).limit(parsedPageSize).populate('productType', 'name').lean();

        await disconnectDB();

        const updatedProducts = products.map(product => {
            product.images = product.images.map((image) => {
                return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`
            })
            return product;
        })

        return res.status(200).json({ products: updatedProducts, totalProducts, totalPages });

    } catch (error) {
        return res.status(500).json({ message: 'Error cargando productos'});
    }

}

const updateProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {_id = '', images = []} = req.body as IProduct;

    if(!isValidObjectId(_id)){
        return res.status(400).json({message: 'El ID del producto no es válido'});
    }

    if(images.length < 2){
        return res.status(400).json({message: 'Es necesario al menos 2 imágenes'});
    }

    try {

        await connectDB();

        const product = await Product.findById(_id);

        if(!product){
            await disconnectDB();
            return res.status(400).json({message: 'No existe un producto con ese ID'});
        }

        product.images.forEach(async(image) => {
            if(!images.includes(image)){
                const [fileId, extension] = image.substring(image.lastIndexOf('/') + 1).split('.');
                //console.log({fileId, extension, image});
                
                await cloudinary.uploader.destroy('AAPIDEN/' + fileId);
            }
        })

        await product.update(req.body);
        await disconnectDB();

        return res.status(200).json(product);
        
    } catch (error) {
        //console.log(error);
        await disconnectDB();
        return res.status(400).json({message: 'Revisar la consola del servidor'});
    }

}

const createProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {images = []} = req.body as IProduct;

    if(images.length < 2){
        return res.status(400).json({message: 'Es necesario al menos 2 imágenes'});
    }

    try {

        await connectDB();

        const productInDB = await Product.findOne({slug: req.body.slug});

        if(productInDB){
            await disconnectDB();
            return res.status(400).json({message: 'Ya existe un producto con ese slug'});
        }

        const product = new Product(req.body);
        await product.save();
        await disconnectDB();

        return res.status(201).json(product);
        
    } catch (error) {
        //console.log(error);
        await disconnectDB();
        return res.status(400).json({message: 'Revisar la consola del servidor'});
    }

}