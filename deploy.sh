#!/bin/bash

# Скрипт для гарантированного запуска Vacancy Parser на старых версиях Docker Compose
# Автор: Antigravity

echo "--- 1. Глубокая очистка Docker ---"
PROJECT_NAME="v_final"

# Останавливаем всё, что связано с проектом
docker-compose -p $PROJECT_NAME down -v --remove-orphans || true

# Удаляем контейнеры по именам (на всякий случай)
docker rm -f vakansai_app vakansai_db || true

# Очищаем неиспользуемые сети, которые могут мешать
docker network prune -f

echo "--- 2. Обновление кода из GitHub ---"
git pull origin main

echo "--- 3. Сборка и запуск контейнеров ---"
# Мы используем проект v_final. Контейнеры будут называться v_final_app_1 и v_final_db_1
docker-compose -p $PROJECT_NAME up -d --build

echo "--- 4. Ожидание запуска базы данных (15 сек) ---"
sleep 15

echo "--- 5. Поиск контейнера и применение миграций ---"
APP_CONTAINER=$(docker ps --format "{{.Names}}" | grep "${PROJECT_NAME}_app" | head -n 1)

if [ -z "$APP_CONTAINER" ]; then
    echo "ОШИБКА: Контейнер приложения не найден!"
    docker ps
    exit 1
fi

echo "Применяем миграции в контейнере: $APP_CONTAINER"
docker exec $APP_CONTAINER alembic upgrade head

echo "------------------------------------------------"
echo "ГОТОВО! Проверьте доступность по адресу:"
echo "http://192.168.0.13:8000"
echo "Пароль: 0000"
echo "------------------------------------------------"
