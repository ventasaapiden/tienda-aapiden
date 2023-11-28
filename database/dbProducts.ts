import { IProduct } from '../interfaces/products';
import Product from '../models/Product';
import { connectDB, disconnectDB } from './db';

export const getProductBySlug = async(slug: string): Promise<IProduct | null> => {

    try{
  
        await connectDB();
        const product = await Product.findOne({slug}).populate('productType', '_id name tax state').lean();

        // console.log(product);
        
        await disconnectDB();

        if(!product){
            return null;
        }

        product.images = product.images.map((image) => {
            return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`
        })

        return JSON.parse(JSON.stringify(product));

    } catch (error) {
        return null;
    }

}

export const getProductsByTerm = async(term: string): Promise<IProduct[] | null> => {

    term = term.toString().toLowerCase();

    try{
        
        await connectDB();
        const products = await Product.find({
            state: 'activo', inStock: { $gte: 1 },
            $text: {$search: term}
        })
        .select('title images price inStock slug -_id')
        .lean();
        await disconnectDB();

        const updatedProducts = products?.map(product => {
            product.images = product.images?.map((image) => {
                return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`
            })
            return product;
        })

        return updatedProducts;

    } catch (error) {
        return null;
    }

}

export const getAllProducts = async(): Promise<IProduct[] | null> => {

    try{

        await connectDB();
        const products = await Product.find({ state: 'activo', inStock: { $gte: 1 } }).lean();
        await disconnectDB();

        const updatedProducts = products?.map(product => {
            product.images = product.images?.map((image) => {
                return image.includes('http') ? image : `${process.env.HOST_NAME}/products/${image}`
            })
            return product;
        })

        return JSON.parse(JSON.stringify(updatedProducts));

    } catch (error) {
        return null;
    }

}

interface productSlug {
    slug: string;
}

export const getAllProductSlugs = async(): Promise<productSlug[] | null> => {

    try{
    
        await connectDB();
        const slugs = await Product.find({ state: 'activo', inStock: { $gte: 1 } }).select('slug -_id').lean();
        await disconnectDB();

        return slugs;

    } catch (error) {
        return null;
    }

}