# Proyecto de Generación y Gestión de Datos Mock

Este proyecto cuenta con varios endpoints esenciales para la generación y almacenamiento de datos en la base de datos. Los principales son:

### 1. **`/api/mocks/mockingpets`**  
Genera un conjunto de mascotas aleatorias, utilizando el paquete `faker.js` para simular atributos como el nombre, especie, raza, edad y estado de adopción.

### 2. **`/api/mocks/mockingusers`**  
Genera un conjunto de usuarios aleatorios, asignando un nombre, apellido, correo electrónico y una contraseña encriptada. Además, se asigna un rol (admin o user) y se deja un campo de mascotas vacío.

### 3. **`/api/mocks/generateData`**  
Permite insertar en la base de datos la cantidad de usuarios y mascotas especificada en los parámetros de la solicitud. Los datos generados son insertados en las colecciones correspondientes en MongoDB.

## Características Adicionales|| (implementadas en desafios de clases anteriores)

### Logger y Registro de Errores  
El proyecto también implementa un sistema de **loggers** para registrar eventos clave y errores durante el funcionamiento del servidor. Estos registros facilitan la depuración al permitir un seguimiento detallado de las acciones, como la inserción de datos en la base de datos o la ejecución de funciones específicas.

### Middleware de Manejo de Errores  
Además, se han integrado **middlewares de manejo de errores personalizados** que gestionan cualquier problema durante la generación de datos o interacciones con la base de datos. Estos middlewares capturan y responden con mensajes claros y consistentes, lo que mejora la robustez del servidor y la experiencia del desarrollador al enfrentar errores.

#### CAMBIOS DE PREENTREGA
Cambie la conexion de mi base de datos de manera local, y actualice el archivo js principal con la base de datos MongoDB Atlas. 
Además modifique el comando para correr la aplicacion => "start": "node src/app.js".

--------------------------

## Actividad práctica hacia la entrega final del proyecto

### Implementación de Swagger y Archivos YAML

Se ha integrado Swagger para facilitar la documentación y pruebas de nuestra API. Los archivos de configuración YAML(dentro del directorio /docs) son utilizados para definir y estructurar la documentación de la API de forma clara y ordenada, describiendo cada uno de los endpoints, parámetros, respuestas y posibles errores. Estos archivos son utilizados por Swagger para generar automáticamente la interfaz de usuario interactiva y asegurar que la API sea fácilmente accesible y comprensible. 

La url correspondiente es => http://localhost:8080/docs/

**Creado por:**  
Facundo Robert