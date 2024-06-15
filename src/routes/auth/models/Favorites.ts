import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorites extends Document {
  userId: string;
  songId: string;
}

const FavoritesSchema: Schema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  songId: {type: Schema.Types.ObjectId, ref: 'Song', required: true}
});

export default mongoose.model<IFavorites>('Favorites', FavoritesSchema);