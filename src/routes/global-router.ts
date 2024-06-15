import { Router } from 'express'
import authRouter from './auth/auth-router'
import songRouter from './songs/song-route'
// other routers can be imported here

const globalRouter = Router()

globalRouter.use('/user', authRouter)
// other routers can be added here
globalRouter.use('/song', songRouter)

export default globalRouter
