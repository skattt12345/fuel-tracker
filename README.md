# FuelTracker

Angular-застосунок для обліку автомобілів, пробігу, витрати пального та історії маршрутних листів.

## Запуск проєкту

1. Встанови залежності:

```bash
npm install
```

2. Створи локальні `environment`-файли з шаблонів:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
```

3. Заповни у локальних файлах свої Firebase-налаштування:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Ці файли додані в `.gitignore`, тому реальні ключі не будуть пушитись у репозиторій.

4. Запусти проєкт:

```bash
npm start
```

Після запуску застосунок буде доступний на `http://localhost:4200/`.

## Корисні команди

Запуск dev-сервера:

```bash
npm start
```

Production build:

```bash
npm run build
```

Тести:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Environment-файли

У репозиторій комітяться тільки шаблони:

- `src/environments/environment.example.ts`
- `src/environments/environment.prod.example.ts`

Реальні файли:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

не повинні потрапляти в Git.

Якщо вони вже були додані раніше, прибери їх з індексу:

```bash
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts
```

## Технології

- Angular 14
- AngularFire
- Firebase Realtime Database
- Firebase Authentication
- Karma + Jasmine
