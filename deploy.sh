#!/bin/bash

# Скрипт для гарантированного запуска Vacancy Parser на старых версиях Docker Compose

echo "--- 1. Очистка старых контейнеров и групп ---"
# Мы используем новое имя проекта, чтобы избежать бага ContainerConfig
PROJECT_NAME="vakansai_final"

docker-compose -p $PROJECT_NAME down -v --remove-orphans || true
docker rm -f vakansai_app vakansai_db || true

echo "--- 2. Обновление кода из GitHub ---"
git pull origin main

echo "--- 3. Сборка и запуск контейнеров ---"
# Флаг --build гарантирует пересборку с новым PYTHONPATH и фиксами
docker-compose -p $PROJECT_NAME up -d --build

echo "--- 4. Ожидание запуска базы данных (10 сек) ---"
sleep 10

echo "--- 5. Применение миграций базы данных ---"
docker exec ${PROJECT_NAME}_app_1 alembic upgrade head

echo "------------------------------------------------"
echo "ГОТОВО! Админка должна быть доступна по адресу:"
echo "http://ваш_ip:8000 (пароль 0000)"
echo "------------------------------------------------"
