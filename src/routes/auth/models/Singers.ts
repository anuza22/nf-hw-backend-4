import mongoose, { Document, Schema } from 'mongoose';

export interface ISinger extends Document {
  username: string;
  password: string;
  songs: string[];
  bio: string;
  profileImage: string;
}

const SingerSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' }, 
  profileImage: { type: String, default: 'https://fyepf-nfac24.s3.eu-north-1.amazonaws.com/Bloo-DowntownBaby.jpeg' } ,
});

export default mongoose.model<ISinger>('Singer', SingerSchema);