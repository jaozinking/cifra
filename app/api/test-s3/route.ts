/**
 * Тестовый API route для проверки работы S3
 * GET /api/test-s3
 */

import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from '@/lib/s3';

export async function GET() {
  try {
    // Проверяем конфигурацию
    if (!process.env.YANDEX_ACCESS_KEY_ID || !process.env.YANDEX_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'S3 storage not configured', configured: false },
        { status: 500 }
      );
    }

    // Пытаемся получить список объектов в бакете (первые 10)
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 10,
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      success: true,
      configured: true,
      bucket: BUCKET_NAME,
      region: process.env.YANDEX_REGION || "ru-central1",
      objectCount: response.KeyCount || 0,
      objects: response.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
      })) || [],
    });
  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка подключения к S3',
        configured: !!process.env.YANDEX_ACCESS_KEY_ID,
      },
      { status: 500 }
    );
  }
}

