import { IProductType } from './../interfaces/productTypes';
import mongoose, {Model, Schema} from 'mongoose';

const productTypeSchema = new Schema({
    //id: {type: Schema.Types.ObjectId, required: true},

    name: {type: String, required: true},
    tax: {type: Number, required: true},
    state: {
        type: String, 
        enum: {
            values: ['activo','inactivo'],
            message: '{VALUE} no es un tipo válido'
        }, 
        default: 'activo'
    },
},{
    timestamps: true
});

const ProductType: Model<IProductType> = mongoose.models.ProductType || mongoose.model('ProductType', productTypeSchema);

export default ProductType;