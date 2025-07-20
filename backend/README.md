# Backend de TP Banco Fiuba

## Requerimientos

- Node v22
- PostgreSQL v17

## Instalación

```sh
npm install
```

## Configuración

Copiar el archivo `env.sample` a `.env` y rellenar los datos

## Inicialización de tablas y datos iniciales

```sh
psql $HOST_DE_POSTGRESQL < db/init.sql
```

## Ejecución

```sh
npm run start
```

La aplicación queda corriendo por defecto en el puerto 3000