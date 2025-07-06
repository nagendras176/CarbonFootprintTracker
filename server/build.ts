import { build } from 'esbuild';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outdir: 'dist',
      packages: 'external',
      external: ['@/*', '@/environment', '@/utils/*'],
      sourcemap: true,
      minify: process.env.NODE_ENV === 'production',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DATABASE_URL': JSON.stringify(process.env.DATABASE_URL),
        'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
        'process.env.PORT': JSON.stringify(process.env.PORT),
      },
    });
    console.log('Server build completed successfully');
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

buildServer(); 