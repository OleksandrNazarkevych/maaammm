import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors();

  const dummyDocument: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'API Gateway', version: '1.0.0' },
    paths: {},
    components: {},
  };

  SwaggerModule.setup('docs', app, dummyDocument, {
    explorer: true,
    swaggerOptions: {
      urls: [
        { url: 'http://localhost:3001/docs-json', name: 'Auth Service' },
        { url: 'http://localhost:3002/docs-json', name: 'Users Service' },
        { url: 'http://localhost:3003/docs-json', name: 'Tickets Service' },
      ],
    },
  });

  await app.listen(3000);
  console.log('🚀 Gateway running at http://localhost:3000/docs');
}

bootstrap();
