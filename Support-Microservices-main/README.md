<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://i.postimg.cc/qq9StNtr/server-icon1.jpg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

```bash

docker-compose -f docker/docker-compose.yml up --build

npm install

cd .\apps\auth-service
OR 
cd .\apps\tickets-service 
OR
cd .\apps\users-service

npx prisma generate --schema=./prisma/schema.prisma 
npx prisma db push --schema=./prisma/schema.prisma

npx prisma db pull --schema=./prisma/schema.prisma
npx prisma studio #to see and edit db

cd ../../

nest start auth-service --watch 
OR
nest start tickets-service --watch 
OR
nest start users-service --watch 


nest start api-gateway --watch
```
For docker
```bash

npx prisma generate --schema=apps/auth-service/prisma/schema.prisma
npx prisma generate --schema=apps/users-service/prisma/schema.prisma
npx prisma generate --schema=apps/tickets-service/prisma/schema.prisma

cd docker
docker-compose up --build

docker logs docker-auth-service-1
docker logs docker-users-service-1
docker logs docker-tickets-service-1

cd ../
nest start api-gateway --watch

```