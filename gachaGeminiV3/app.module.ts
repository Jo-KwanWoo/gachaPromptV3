import { Module } from '@nestjs/common';
import { DeviceModule } from './device.module';
import { AuthModule } from './interface/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DeviceModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
