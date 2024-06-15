import { Request, Response } from 'express'
import { CreateUserDto, UpdateUserDto } from './dtos/CreateUser.dto'
import AuthService from './auth-service'
import S3Service from '../s3/s3-service'
import { IFavorites } from './models/Favorites'
import FavoritesModel from './models/Favorites'

class AuthController {
  private authService: AuthService;
  private s3: S3Service;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.s3 = S3Service.getInstance();
  }

  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const createUserDto: CreateUserDto = req.body
      const user = await this.authService.registerUser(createUserDto)
      res.status(201).json(user)
    } catch (err) {
      res.status(500).json({ message: 'Error registering user' })
    }
  }

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body
      const result = await this.authService.loginUser(email, password)
      if (!result) {
        res.status(401).json({ message: 'Invalid email or password' })
        return
      }
      res.status(200).json(result)
    } catch (err) {
      res.status(500).json({ message: 'Error logging in' })
    }
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body
      const result = await this.authService.refreshToken(token)
      if (!result) {
        res.status(401).json({ message: 'Invalid or expired refresh token' })
        return
      }
      res.status(200).json(result)
    } catch (err) {
      res.status(500).json({ message: 'Error refreshing token' })
    }
  }

  getProfile = async (req: Request, res: Response):Promise<void> => {
    try{
      const username = req.params.username 
      const result = await this.authService.getProfile(username)
      if (result){
        res.status(200).send(result)
        return 
      }else{
        res.status(400).send({message: "not found"})
      }
    }
    catch (err){
      res.status(400).send({err: err})
    }
  }

  updateProfile = async(req: Request, res: Response):Promise<void> => {
    try{
      const username = req.params.username 
      const updateFields: UpdateUserDto = {}
      const formData = req.body
      if (formData.bio){
        updateFields.bio = formData.bio as string 
      }
      if ((req as any).file){
        const file = (req as any).file 
        if (file){
          const filePath = file.path; 
          const key = `${username}.png`;
          const url = await this.s3.uploadFile(filePath, key); 
          updateFields.profileImage = url;
        }
      }

      const resp = await this.authService.updateSinger(username, updateFields)
      if (resp){
        res.status(200).send({message:'Profile updated successfully'});
      }
      else{
        res.status(400).send({message:'Profile is not updated successfully'});
      }
    }catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).send('Failed to update profile');
    }
  }

  like = async(req: Request, res: Response):Promise<void> => {
    try{
      const userId = (req as any)._id 
      if (!userId){
        res.status(400).send({"message":"userId is not provided"})
        return 
      }
      const songId = req.params.id
      const fav = await this.authService.like(userId, songId)
      res.status(200).send(fav)
    }
    catch (err){
      res.status(500).send(err);
    }
  }

  unlike = async(req: Request, res: Response):Promise<void> => {
    try{
      const userId = (req as any)._id 
      if (!userId){
        res.status(400).send({"message":"userId is not provided"})
        return 
      }
      const songId = req.params.id as string 
      const fav = await this.authService.unlike(userId, songId)
      res.status(200).send(fav)
    }
    catch (err){
      res.status(500).send('Failed to like song');
    }
  }

  liked = async(req: Request, res: Response):Promise<void> => {
    try {
      const userId = (req as any)._id; 

      if (!userId) {
        res.status(400).send({ message: "userId is not provided" });
        return;
      }

      let page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (page < 1){
        page = 1
      }
      if (limit < 1){
        limit = 1
      }

      const likes = await this.authService.liked(userId, page, limit);

      res.status(200).send(likes);
    } catch (err) {
      res.status(400).send({ message: `${err}` });
    }
  }

  searchSinger = async(req: Request, res: Response):Promise<void> => {
    try{
    let page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  
    if (page < 1){
      page = 1
    }
    if (limit < 1){
      limit = 1
    }

    const query = req.query.query as string 

    const resp = await this.authService.searchArtist(query, page, limit)
    res.status(200).send(resp)}
    catch (err){
      res.status(400).send({message:`${err}`})
    }

  }


}

export default AuthController
