import SongService from "./song-service"
import S3Service from '../s3/s3-service'
import { Request, Response } from 'express'


class SongController{
    private s3: S3Service 
    private songService: SongService
    constructor(songService: SongService) {
        this.songService = songService
        this.s3 = S3Service.getInstance()
      }

      getSong = async (req: Request, res: Response) => {
        try{
        const id = req.params.id 
        const resp = await this.songService.getSong(id)
        res.status(200).send(resp)
        }catch (err){
          res.status(400).send({message:`${err}`})
        }

      }

      deleteSong = async (req: Request, res: Response) => {
        try{
        const id = req.params.id 
        await this.songService.deleteSong(id)
        res.status(200).send({message:"success"})
        }catch (err){
          res.status(400).send({message:`${err}`})
        }

      }

      getSongs = async (req: Request, res: Response) => {
        try {
          let { query, page, limit } = req.query;
    
          query = query ? String(query) : '';
          page = page ? String(page) : '1';
          limit = limit ? String(limit) : '6';
    
          const parsedPage = parseInt(page, 10);
          const parsedLimit = parseInt(limit, 10);
    
          const songs = await this.songService.getSongs(query, parsedPage, parsedLimit);
          res.status(200).json(songs);
        } catch (err) {
          res.status(400).json({ message: `${err}` });
        }
      }
      

      updateSong= async (req: Request, res: Response) => {
        try {
            const _id = req.params.id;
            const title = req.query.title as string;
            let imageUrl: string | null = null;

            if ((req as any).file) {
                const file = (req as any).file;
                if (file) {
                    const filePath = file.path;
                    const key = `${_id}.png`;
                    const url = await this.s3.uploadFile(filePath, key);
                    imageUrl = url;
                }
            }

            const updatedSong = await this.songService.updateSong(_id, title, imageUrl);
            res.status(200).send(updatedSong);
        } catch (err) {
            res.status(400).send({ message: `${err}` });
        }
    }
    

      publishSong = async (req: Request, res: Response) => {
        try {
          const {title, author} = req.body;
          // const title = req.query.title as string;
          // const author = req.query.author as string;
          let songUrl: string | null = null; 
          let imageUrl: string | null = null;
    
          if ((req as any).files) {
            const files = (req as any).files;
    
            if (files.song) {
              const filePath = files.song[0].path;
              const key = `${author}-${title}.mp3`;
              const url = await this.s3.uploadFile(filePath, key);
              songUrl = url;
            } else {
              res.status(400).send({ message: "Song is not provided" });
              return;
            }
    
            if (files.songPreview) {
              const file = files.songPreview[0];
              if (file) {
                const filePath = file.path;
                const key = `${author}-${title}.png`;
                const url = await this.s3.uploadFile(filePath, key);
                imageUrl = url;
              }
            }
          }
    
          if (songUrl === null) {
            res.status(400).send({ message: "Song is required" });
            return;
          }
    
          const song = await this.songService.publishSong(title, author, songUrl, imageUrl);
          res.status(200).send(song);
        } catch (err) {
          console.error('Error publishing song:', err);
          res.status(400).send(err);
        }
      };
}

export default SongController