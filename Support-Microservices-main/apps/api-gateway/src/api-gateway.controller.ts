import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as proxy from 'express-http-proxy';

@Controller()
export class ApiGatewayController {
  @All('auth/*path')
  handleAuth(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return proxy('http://localhost:3001')(req, res);
  }

  @All('users/*path')
  handleUsers(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return proxy('http://localhost:3002')(req, res);
  }

  @All('tickets/*path')
  handleTickets(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return proxy('http://localhost:3003')(req, res);
  }
}