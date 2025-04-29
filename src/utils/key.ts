import fs from 'fs';
import path from 'path';
import { generateKeyPairSync } from 'crypto';

const PRIVATE_KEY_PATH = path.join(__dirname, '../config/private.key');
const PUBLIC_KEY_PATH = path.join(__dirname, '../config/public.key');

export function generateKeyPair() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey.export({ type: 'pkcs1', format: 'pem' }));
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey.export({ type: 'spki', format: 'pem' }));
}

// 获取私钥
export function getPrivateKey(): string {
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    generateKeyPair();
  }
  if (fs.statSync(PRIVATE_KEY_PATH).size === 0) {
    generateKeyPair();
  }
  return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

// 获取公钥
export function getPublicKey(): string {
  if (!fs.existsSync(PUBLIC_KEY_PATH)) {
    generateKeyPair();
  }
  if (fs.statSync(PUBLIC_KEY_PATH).size === 0) {
    generateKeyPair();
  }
  return fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
}