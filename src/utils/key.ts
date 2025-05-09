import fs from 'fs';
import path from 'path';
import { generateKeyPairSync, randomBytes } from 'crypto';

const PRIVATE_KEY_PATH = path.join(__dirname, '../config/private.key');
const PUBLIC_KEY_PATH = path.join(__dirname, '../config/public.key');
const SYMMETRIC_KEY_PATH = path.join(__dirname, '../config/symmetric.key');

// 生成非对称密钥对
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

// 生成对称密钥
export function generateSymmetricKey() {
  const symmetricKey = randomBytes(32);
  fs.writeFileSync(SYMMETRIC_KEY_PATH, symmetricKey.toString('hex'));
}

// 获取对称密钥
export function getSymmetricKey(): string {
  if (!fs.existsSync(SYMMETRIC_KEY_PATH)) {
    generateSymmetricKey();
  }
  if (fs.statSync(SYMMETRIC_KEY_PATH).size === 0) {
    generateSymmetricKey();
  }
  return fs.readFileSync(SYMMETRIC_KEY_PATH, 'utf8');
}