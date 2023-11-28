import mongoose, {Model, Schema} from 'mongoose';
import { IReview } from '../interfaces/reviews';

const reviewSchema = new Schema({
    //id: {type: Schema.Types.ObjectId, required: true},

    user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    product: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    review: {type: String, required: true},
    rating: {
        type: Number, 
        enum: {
            values: [1,2,3,4,5],
            message: '{VALUE} no es un tipo válido'
        }, 
        default: 5
    },
},{
    timestamps: true
});

const Review: Model<IReview> = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;