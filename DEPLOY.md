# Публикация на Vercel — почему нет фото

## Вы ничего не сломали

Сайт на Vercel берёт файлы **только из GitHub**. Если в репозитории есть `index.html`, `styles.css`, `script.js`, но **нет папки `images/` с `.jpg`**, на сайте будут **белые прямоугольники** вместо картинок.

Локально у вас картинки есть в `D:\CRAFT\images\`. Их нужно **отдельно закоммитить и запушить**.

---

## Шаг 1. Загрузить ВСЕ файлы в GitHub

В папке проекта откройте терминал (PowerShell):

```powershell
cd D:\CRAFT

git status
```

Должны быть видны файлы в `images/`, например `images/home-1.jpg`, `images/hero.jpg`.

Если папки `images` в git нет:

```powershell
git add index.html styles.css script.js
git add images/*.jpg
git commit -m "Добавлены локальные изображения для сайта"
git push origin main
```

> Если основная ветка называется `master`, замените `main` на `master`.

**Обязательные JPG** (минимум для карточек SOLO/DUO):

- `images/hero.jpg`
- `images/home-1.jpg`
- `images/home-2.jpg`
- остальные `images/home-*.jpg`, `interior-*.jpg`, `factory-*.jpg` — для галереи и других блоков

Файлы `.svg` и `.py` в `images/` для сайта не нужны — можно не добавлять.

---

## Шаг 2. Проверить деплой в Vercel

1. Зайдите на [vercel.com](https://vercel.com) → ваш проект **modulix**.
2. Вкладка **Deployments** — после `git push` должен появиться новый деплой со статусом **Ready** (1–2 минуты).
3. Если деплоя нет: **Deployments** → **Redeploy** → **Redeploy** (без кэша).

### Preview и Production — разные ссылки

Ссылка вида  
`modulix-xxxxx-kickfost07-debugs-projects.vercel.app`  
— это часто **preview** (черновик ветки), а не основной сайт.

Откройте **Production**:
- в Vercel: **Visit** напротив Production Domain, или
- ваш домен вида `modulix.vercel.app` / `modulix.ru`.

---

## Шаг 3. Убедиться, что картинки на сервере

После деплоя откройте в браузере (подставьте свой домен):

`https://ВАШ-ДОМЕН.vercel.app/images/home-1.jpg`

- **Открылась картинка** — всё ок, обновите главную с **Ctrl+F5**.
- **404** — JPG не попали в GitHub или не тот корень проекта в Vercel.

### Настройки Vercel (редко нужно)

**Settings → General → Root Directory** — должно быть пусто или `.`  
(не подпапка, если `index.html` в корне репозитория).

**Framework Preset** — Other / Static. Build Command можно оставить пустым.

---

## Шаг 4. Свои фото позже

Замените файлы в `images/` на свои JPG с **теми же именами**, снова:

```powershell
git add images/
git commit -m "Обновлены фото проектов"
git push
```

Vercel пересоберёт сайт автоматически.
