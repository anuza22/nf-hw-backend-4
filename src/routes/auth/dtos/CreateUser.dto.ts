export interface CreateUserDto {
  email: string
  password: string
}

export interface UpdateUserDto {
  bio?: string 
  profileImage?: string 
}
