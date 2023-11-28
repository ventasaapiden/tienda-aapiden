import type { NextApiRequest, NextApiResponse } from 'next'
import { IReview } from '../../../interfaces/reviews';
import { getSession } from 'next-auth/react';
import { connectDB, disconnectDB } from '../../../database/db';
import Review from '../../../models/Review';
import { isValidObjectId } from 'mongoose';


type Data = 
| {message: string}
| {reviews: IReview[], totalReviews: Number, totalPages: Number, averageRating: Number}
| IReview;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch(req.method){
        case 'GET': 
            return getProductReviews(req, res);
        case 'POST': 
            return createReview(req, res);
        case 'PUT': 
            return updateReview(req, res);
        case 'DELETE': 
            return deleteReview(req, res);
        
        default:
            return res.status(400).json({message: 'Bad Request'});
    }

}

const getProductReviews = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    try {

        let condition = {};

        const { page = 1, pageSize = 10, product } = req.query;
        const parsedPage = parseInt(page as string, 10);
        const parsedPageSize = parseInt(pageSize as string, 10);

        if(!isValidObjectId(product)){
            return res.status(400).json({message: 'El ID del producto no es válido'});
        }

        if (isNaN(parsedPage) || isNaN(parsedPageSize)) {
            return res.status(400).json({ message: 'Los parámetros de paginación deben ser números válidos.' });
        }

        if (parsedPage <= 0 || parsedPageSize <= 0) {
            return res.status(400).json({ message: 'Los números de página y tamaño de página deben ser mayores a cero.' });
        }

        const skip = (parsedPage - 1) * parsedPageSize;

        condition = {product};

        await connectDB();

        const totalReviews = await Review.countDocuments(condition);

        const totalPages = Math.ceil(totalReviews / parsedPageSize);

        const allReviews = await Review.find(condition);

        let averageRating = 0;
        if (allReviews.length > 0) {
            const totalRatings = allReviews.reduce((total, review) => total + review.rating, 0);
            averageRating = totalRatings / allReviews.length;
        }

        const reviews = await Review.find(condition).sort({updatedAt: 'desc'}).skip(skip).limit(parsedPageSize).populate('user', '_id name').lean();

        await disconnectDB();

        return res.status(200).json({ reviews, totalReviews, totalPages, averageRating });
        
    } catch (error) {
        await disconnectDB();
        //console.log(error);

        return res.status(400).json({message: 'Algo salió mal'});
    }

}

const createReview = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {product, rating, review} = req.body as IReview;    

    const session: any = await getSession({req});

    if(!session){
        return res.status(401).json({message: 'Debe de estar autenticado para hacer esto'});
    }    

    if(!product){
        return res.status(400).json({message: 'El producto es requerido'});
    }

    if(!review){
        return res.status(400).json({message: 'La opinión es requerida'});
    }

    if(rating < 1 || rating > 5){
        return res.status(400).json({message: 'La calificación debe ser del 1 al 5'});
    }

    try {

        await connectDB();

        const user = session.user._id;
        const oldReview = await Review.findOne({product, user});

        if(!oldReview){
            const newReview = new Review({product, rating, review, user});
            await newReview.save(); 
            await disconnectDB();
            return res.status(201).json(newReview);
        }else{
            await oldReview.update(req.body);
            await disconnectDB();
            return res.status(201).json(oldReview);
        }

    } catch (error: any) {
        await disconnectDB();
        //console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor'
        })
        
    }

}

const updateReview = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {_id = ''} = req.body as IReview;

    if(!isValidObjectId(_id)){
        return res.status(400).json({message: 'El ID de la opinión no es válido'});
    }


    try {

        await connectDB();

        const review = await Review.findById(_id);

        if(!review){
            await disconnectDB();
            return res.status(400).json({message: 'No existe una opinión con ese ID'});
        }

        await review.update(req.body);
        await disconnectDB();

        return res.status(200).json(review);
        
    } catch (error) {
        //console.log(error);
        await disconnectDB();
        return res.status(400).json({message: 'Revisar la consola del servidor'});
    }
    
}

const deleteReview = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const {_id = ''} = req.body;

    try {

        await connectDB();
        
        const review = await Review.findById(_id);

        await review?.delete();

        await disconnectDB();

        return res.status(201).json({message: 'Opinión eliminada correctamente'});

    } catch (error: any) {
        await disconnectDB();
        //console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor'
        })
        
    }
    
}