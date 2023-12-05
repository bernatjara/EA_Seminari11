import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import {mongoosePagination, Pagination} from 'mongoose-paginate-ts';
import bcrypt from 'bcrypt';

export interface IUser {
    username: string;
    fullname: string;
    email: string;
    password: string;
    rol: string;
    encryptPassword(password: string): Promise<string>;
    validatePassword(password: string): Promise<boolean>;
}

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true },
        fullname: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        rol: { type: String, required: true }
    },
    {
        versionKey: false
    }
);

UserSchema.methods.encryptPassword = async (password:string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  };
UserSchema.methods.validatePassword = async function (password:string) {
    return bcrypt.compare(password, this.password);
  };

UserSchema.plugin(mongoosePagination);
export default mongoose.model<IUserModel, Pagination<IUserModel>>('User', UserSchema);