import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  public db: Db;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const uri = this.configService.get<string>('MONGODB_URI');
      const dbName = this.configService.get<string>('MONGODB_DATABASE');

      if (!uri) throw new Error('MONGODB_URI is not defined in configuration');
      if (!dbName)
        throw new Error('MONGODB_DATABASE is not defined in configuration');

      const options: MongoClientOptions = {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 50,
        retryWrites: true,
        retryReads: true,
      };

      this.client = await MongoClient.connect(uri, options);
      this.db = this.client.db(dbName);

      // Test the connection
      await this.db.command({ ping: 1 });
      console.log('Successfully connected to MongoDB Atlas');
    } catch (error) {
      console.error('Failed to connect to MongoDB Atlas:', error);
      throw error; // Rethrow to prevent application startup
    }
  }

  async onModuleDestroy() {
    try {
      if (this.client) {
        await this.client.close();
        console.log('MongoDB connection closed');
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }
}
