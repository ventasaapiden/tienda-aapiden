import mongoose, {Model, Schema} from 'mongoose';
import { IProduct } from '../interfaces/products';

const productSchema = new Schema({
    //id: {type: Schema.Types.ObjectId, required: true},

    description: {type: String, required: true, default: ''},
    images: [{type: String}],
    inStock: {type: Number, required: true, default: 0},
    weight: {type: Number, required: true, default: 0},
    price: {type: Number, required: true, default: 0},
    slug: {type: String, required: true, unique: true},
    tags: [{type: String}],
    title: {type: String, required: true, default: ''},
    state: {
        type: String, 
        enum: {
            values: ['activo','inactivo'],
            message: '{VALUE} no es un tipo válido'
        }, 
        default: 'activo'
    },
    productType: {type: Schema.Types.ObjectId, required: true, ref: 'ProductType'},
},{
    timestamps: true
});

productSchema.index({title: 'text', tags: 'text'});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;