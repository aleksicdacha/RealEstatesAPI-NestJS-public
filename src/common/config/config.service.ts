import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

const myEnv = dotenv.config();  // Load .env file
dotenvExpand.expand(myEnv);     // Expands variables in the .env file

@Injectable()
export class ConfigService {
  private readonly config: Record<string, string>;

  constructor() {
    this.config = process.env; // Load all environment variables
  }

  get(key: string): string {
    return this.config[key];
  }

  getNumber(key: string): number {
    return parseInt(this.config[key], 10);
  }
}
