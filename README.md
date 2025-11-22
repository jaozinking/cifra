# Cifra - Платформа для продажи цифровых товаров

Платформа для создания и продажи цифровых продуктов с интеграцией AI для генерации описаний, цен и обложек.

## Быстрый старт

### Prerequisites

- Node.js 18+
- PocketBase (включен в проект)

### Установка и запуск

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Настройте переменные окружения:**
   
   Создайте файл `.env.local` и добавьте:
   ```env
   GEMINI_API_KEY=ваш_api_ключ_gemini
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
   ```
   
   **Примечание:** `NEXT_PUBLIC_` префикс необходим для переменных окружения, доступных в браузере (Next.js).

3. **Запустите PocketBase:**
   ```bash
   ./pocketbase serve
   ```
   
   PocketBase автоматически:
   - Создаст все необходимые коллекции
   - Заполнит тестовыми данными (пользователи, продукты, продажи)

4. **Запустите фронтенд:**
   ```bash
   pnpm dev
   # или
   npm run dev
   ```

   Приложение будет доступно на http://localhost:3000

   **Примечание:** Проект использует Next.js 16 с App Router. Для разработки используется `next dev`.

## Тестовые аккаунты

После запуска PocketBase автоматически создаются тестовые пользователи:

### Основной тестовый аккаунт (рекомендуется)

- **Email:** `test@cifra.ru`
- **Пароль:** `test123456`
- **Описание:** Аккаунт с готовыми продуктами, продажами и промокодами

### Дополнительные тестовые аккаунты

- **Email:** `demo@cifra.ru` | **Пароль:** `demo123456`
- **Email:** `seller@cifra.ru` | **Пароль:** `seller123`

## Что включено в тестовые данные

### Пользователь `test@cifra.ru` содержит:

- **5 продуктов:**
  - Premium Notion Template (1999₽, 15 продаж)
  - UI Kit для Figma (2999₽, 8 продаж)
  - React Hook для API (1499₽, 23 продажи)
  - Гайд по монетизации SaaS (999₽, черновик)
  - Набор звуковых эффектов (799₽, 12 продаж)

- **5 продаж** с разными покупателями

- **3 промокода:**
  - `WELCOME10` - 10% скидка (активен, 5 использований)
  - `SUMMER20` - 20% скидка (активен, 2 использования)
  - `EXPIRED50` - 50% скидка (неактивен)

- **3 выплаты:**
  - 5000₽ (выплачено, карта)
  - 10000₽ (выплачено, СБП)
  - 3000₽ (в ожидании, карта)

## Структура проекта

```
cifra/
├── app/                # Next.js App Router
│   ├── (protected)/    # Защищенные страницы (route group)
│   │   ├── dashboard/  # Дашборд
│   │   ├── products/   # Управление продуктами
│   │   ├── marketing/  # Маркетинг и промокоды
│   │   ├── customers/  # Клиенты
│   │   └── settings/   # Настройки
│   ├── auth/           # Авторизация
│   ├── product/[id]/   # Публичная страница товара (SSR)
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Главная страница
│   └── globals.css     # Глобальные стили
├── components/         # React компоненты (Client Components)
├── lib/                # Утилиты и серверные функции
│   └── pocketbase-server.ts  # Серверный PocketBase клиент
├── services/           # Сервисы
│   ├── pocketbase.ts   # PocketBase клиент (инициализация)
│   ├── pbService.ts    # PocketBase сервис (основной API)
│   ├── geminiService.ts # Gemini AI сервис
│   └── storage.ts      # ⚠️ Legacy localStorage fallback (deprecated)
├── hooks/              # React хуки
├── types.ts            # TypeScript типы
├── constants.ts        # Константы
├── pb_migrations/      # Миграции PocketBase
│   ├── 1734900000_create_cifra_collections.js  # Создание коллекций
│   └── 1734900100_seed_test_data.js            # Тестовые данные
├── proxy.ts            # Next.js Proxy (аутентификация)
├── next.config.ts      # Конфигурация Next.js
├── postcss.config.mjs  # PostCSS конфигурация
└── tsconfig.json       # TypeScript конфигурация
```

## Основные возможности

- ✅ Аутентификация пользователей
- ✅ Создание и управление цифровыми продуктами
- ✅ Загрузка файлов продуктов
- ✅ AI-генерация описаний, цен и обложек (Gemini)
- ✅ Публичные страницы товаров
- ✅ Система промокодов
- ✅ История продаж и аналитика
- ✅ Управление выплатами
- ✅ Настройки профиля продавца

## Документация

- [PocketBase миграции](pb_migrations/README.md)

## Архитектура

### Структура данных

- **Основной источник данных**: PocketBase (PostgreSQL через PocketBase)
- **Fallback**: localStorage (graceful degradation при ошибках сети/сервера)
- **Аутентификация**: PocketBase Auth (JWT токены в cookies)

**Примечание**: StorageService используется как fallback для повышения отказоустойчивости.
Если PocketBase временно недоступен, приложение продолжает работать с данными из localStorage.
Это стандартная практика для production-приложений.

### Компоненты

- Все компоненты в `components/` являются Client Components (`'use client'`)
- Страницы в `app/` используют Server Components по умолчанию
- SSR используется для публичных страниц товаров (`/product/[id]`)

### Сервисы

- `services/pbService.ts` - основной API для работы с PocketBase
- `services/pocketbase.ts` - инициализация PocketBase клиента
- `services/geminiService.ts` - интеграция с Google Gemini AI
- `services/storage.ts` - fallback на localStorage для обработки ошибок (graceful degradation)

## Разработка

### Добавление новых миграций

1. Создайте файл в `pb_migrations/` с именем `{timestamp}_описание.js`
2. Используйте формат:
   ```javascript
   migrate((app) => {
     // Ваш код
   }, (app) => {
     // Откат (опционально)
   });
   ```

### Сброс тестовых данных

Удалите папку `pb_data/` и перезапустите PocketBase - все данные будут созданы заново.

## Лицензия

MIT
