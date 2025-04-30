import { expressjwt } from 'express-jwt';
import { getPublicKey } from '@utils/key';

export const authMiddleware = expressjwt({
  secret: getPublicKey(),
  algorithms: ['RS256'],
  requestProperty: 'body.user',
}).unless({
  path: ['/','/test','/user/login','/user/salt', '/user/register'],
});