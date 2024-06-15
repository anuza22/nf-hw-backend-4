import dotenv from "dotenv";
import Song, { ISong } from "./models/song"; // Adjust the import as per your file structure
import Artist from "../auth/models/User";

dotenv.config();

class SongService {
    async publishSong(title: string, author: string, songUrl: string, imageUrl: string | null) {
        try {
            let song: ISong; 
            if (imageUrl) {
                song = new Song({
                    title,
                    author,
                    song: songUrl,
                    image: imageUrl
                });
            } else {
                song = new Song({
                    title,
                    author,
                    song: songUrl,
                });
            }        
            const savedSong = await song.save();
            return savedSong;
        } catch (err) {
            console.error('err saving song:', err);
            throw err; 
        }
    }

    async updateSong(_id: string, title: string, imageUrl: string|null) {
        try {
            const song = await Song.findById(_id).populate('author', '-password -bio');;
            if (!song) {
                throw new Error(`not found`);
            }
            if (title) {
                song.title = title;
            }
            if (imageUrl) {
                song.image = imageUrl;
            }
            const updatedSong = await song.save();
            return updatedSong;
        } catch (err) {
            console.error('err updating song:', err);
            throw err;
        }
    }

    async getAuthorId(songId: string): Promise<string | null> {
        try {
            const song = await Song.findById(songId);
            if (!song) {
                console.error('Song not found');
                return null;
            }
            const authorId = song.author.toString();
            return authorId;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async deleteSong(_id: string){
        try{
            await Song.findByIdAndDelete(_id)
        }
        catch (err){
            console.error('err deleting song:', err)
            throw err;
        }
    }

    async getSong(_id: string) {
        try {
            const song = await Song.findById(_id).populate('author', '-password -bio');
            if (!song) {
                throw new Error('Song not found');
            }
            return song;
        } catch (err) {
            console.error('Error getting song:', err);
            throw err;
        }
    }

    async getSongs(query, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
    
        const songs = await Song.find({
            $or: [
                { title: { $regex: new RegExp(query.trim(), 'i') } },
                { author: { $in: await Artist.find({ username: { $regex: new RegExp(query.trim(), 'i') } }).select('_id') } }
            ]
        })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username _id');
    
        return songs;
    }
    
      
      
}

export default SongService;