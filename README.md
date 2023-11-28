# AAPIDEN Web Store
Para correr localmente, se necesita la base de datos
```
docker-compose up -d
```

* El -d, significa __detached__

## Configurar las variables de entorno
Renombra el archivo __.env.template__ a __.env__

* MongoDB URL local:
```
mongodb://localhost:27017/aapidendb
```

* Reconstruir los node_modules y levantar Next
```
npm install
npm run dev
```

## Llenar la base de datos con informacion de pruebas

Llamar:
```
http://localhost:3000/api/seed
```


