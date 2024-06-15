import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth-middleware'
import AuthController from './auth-controller'
import AuthService from './auth-service'
import multer from 'multer';

const authRouter = Router()

const authService = new AuthService()
const authController = new AuthController(authService)

const upload = multer({ dest: 'images/' });

authRouter.post('/register', authController.registerUser)
authRouter.post('/login', authController.loginUser)
authRouter.post('/refresh-token', authController.refreshToken)

authRouter.get('/:username', authController.getProfile)
authRouter.post('/artist', authController.registerUser)
authRouter.post('/search', authController.searchSinger)
authRouter.put('/:username', upload.single('image'), authController.updateProfile)

authRouter.post('/like/:id', authMiddleware, authController.like)
authRouter.post('/unlike/:id', authMiddleware, authController.unlike)
authRouter.post('/liked', authMiddleware, authController.liked)


authRouter.post('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You have access to this route!' })
})

export default authRouter