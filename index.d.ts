import * as express from 'express-serve-static-core';
import { File } from 'multer';

declare global{
    namespace express{
        interface Request{
            customField?:string;
            files: {
                [fieldname: string]: File[];};
            file: File;
        }
    }
}

