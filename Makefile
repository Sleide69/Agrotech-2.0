SHELL := /usr/bin/env bash

.PHONY: up down logs seed build migrate

up:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=200

seed:
	docker compose run --rm db-migrations

build:
	docker compose build

migrate: seed
