import { S3Client, S3ClientConfig, ListBucketsCommand, ListBucketsCommandOutput, S3 } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs';

class S3Service {
    private static instance: S3Service;
    private s3: S3;
    private bucketName?: string;

    private constructor() {
        this.s3 = new S3({
            region: process.env.AWS_REGION!,
            credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });
        this.bucketName = process.env.AWS_BUCKET_NAME!
    }

    public static getInstance(): S3Service {
        if (!S3Service.instance) {
            S3Service.instance = new S3Service();
        }
        return S3Service.instance;
    }

    public setBucketName(bucketName: string): void {
        this.bucketName = bucketName;
    }

    public async createBucket(bucketName: string): Promise<void> {
        try {
            const res = await this.s3.createBucket({ Bucket: bucketName });
            console.log(`Bucket "${bucketName}" created:`, res);
            await this.setBucketPolicy(bucketName);
        } catch (err: any) {
            console.error(`Error creating bucket "${bucketName}": ${err.code}`);
            throw err;
        }
    }

    public async setBucketPolicy(bucketName: string): Promise<void> {
        const bucketPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${bucketName}/*`,
                },
            ],
        };

        try {
            const params = {
                Bucket: bucketName,
                Policy: JSON.stringify(bucketPolicy),
            };
            const data = await this.s3.putBucketPolicy(params);
            console.log(`Bucket policy set for "${bucketName}":`, data);
        } catch (err: any) {
            console.error(`Error setting bucket policy for "${bucketName}":`, err);
            throw err;
        }
    }

    public async listBuckets(): Promise<ListBucketsCommandOutput['Buckets'] | undefined> {
        try {
            const response = await this.s3.send(new ListBucketsCommand({}));
            console.log('List of buckets:', response.Buckets);
            return response.Buckets;
        } catch (err) {
            console.error('Error listing buckets:', err);
            return undefined;
        }
    }

    public async uploadFile(filePath: string, key: string): Promise<string> {
        if (!this.bucketName) {
            throw new Error('Bucket name has not been set. Call setBucketName before uploading files.');
        }
    
        try {
            const fileContent = fs.readFileSync(filePath);
    
            const uploadParams = {
                Bucket: this.bucketName,
                Key: key, 
                Body: fileContent,
            };
    
            const res = await this.s3.putObject(uploadParams);
    
            const bucketName = this.bucketName;
    
            let url: string;
            url = `https://${bucketName}.s3.eu-north-1.amazonaws.com/${key}`;
    
            return url;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error;
        }
    }

    public async deleteFile(key: string): Promise<void> {
        if (!this.bucketName) {
            throw new Error('Bucket name has not been set. Call setBucketName before deleting files.');
        }

        try {
            const deleteParams = {
                Bucket: this.bucketName,
                Key: key 
            };
            const res = await this.s3.deleteObject(deleteParams);
            console.log("File deleted successfully:", res);
        } catch (err) {
            console.error('Error deleting file from S3:', err);
            throw err;
        }
    }
}

export default S3Service;
