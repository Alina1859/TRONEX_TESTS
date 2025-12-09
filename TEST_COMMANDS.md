# Команды для запуска тестов

## Основные команды

### Запуск всех тестов
```bash
npm test
```
или
```bash
playwright test
```

### Запуск тестов только для client-api проекта
```bash
npm run test:api
```
или
```bash
playwright test --project=client-api
```

## Дополнительные команды

### Запуск тестов в UI режиме (интерактивный режим)
```bash
pnpm exec playwright test --ui
```

### Запуск тестов в режиме отладки
```bash
playwright test --debug
```

### Запуск конкретного теста по имени
```bash
playwright test -g "GET /api/v2/orders/{id} should return correct order data"
```

### Запуск тестов с повторными попытками при ошибках
```bash
playwright test --retries=2
```

### Запуск тестов в headless режиме (по умолчанию)
```bash
playwright test --headed
```

### Просмотр HTML отчета после выполнения тестов
```bash
playwright show-report
```

### Запуск тестов с указанием конкретного файла
```bash
playwright test apps/client-api/tests/get_order_by_id.spec.ts
```

## Настройки выполнения

Тесты настроены на **последовательное выполнение** (один за другим):
- `workers: 1` - используется один воркер
- `fullyParallel: false` - параллельное выполнение отключено

## Требования

Перед запуском тестов убедитесь, что:
1. Установлены все зависимости: `npm install` или `pnpm install`
2. Настроен файл `.env` с необходимыми переменными окружения:
   - `API_KEY_PRIMARY` - API ключ для аутентификации
   - `API_URL` - URL API сервера
   - `USER_ID_PRIMARY` - ID основного пользователя
   - `USER_ID_SECONDARY` - ID вторичного пользователя
   - Переменные для подключения к базе данных

## Примеры использования

### Быстрый запуск всех тестов
```bash
npm test
```

### Запуск с просмотром отчета
```bash
npm test
playwright show-report
```

### Запуск конкретного теста в режиме отладки
```bash
playwright test -g "should return correct order data" --debug
```

