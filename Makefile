init:
	make clean
	docker compose run --rm app npm install
	docker compose down

clean:
	docker compose down --rmi all

bash-app:
	docker compose run --rm --entrypoint /bin/bash app

# build:
# 	docker build --target build -t app-builder .

# prod:
# 	docker build --target prod -t app-prod .