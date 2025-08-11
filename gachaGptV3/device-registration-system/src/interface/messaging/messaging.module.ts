import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ConfigService } from '@nestjs/config';

@Module({ providers: [MessagingService, ConfigService], exports: [MessagingService] })
export class MessagingModule {}