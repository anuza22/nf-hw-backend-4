import mongoose, { Document, Schema } from 'mongoose';

export interface ISong extends Document {
  title: string 
  author: string 
  image: string 
  song: string 
}

const SongSchema: Schema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Singer', required: true }, 
    image: { type: String, default: "https://nf-2024.s3.eu-north-1.amazonaws.com/profileImages/hjiaewrbfhbhjiaewfrbjire.png" },
    song: { type: String, required: true }
  });

export default mongoose.model<ISong>('Song', SongSchema);