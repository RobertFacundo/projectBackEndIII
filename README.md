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

### Implementaciones de Pruebas (Mocha, Chai)

`Users.test.js`: Se incluyen pruebas para el modelo de usuario utilizando la base de datos en memoria con MongoMemoryServer. Las pruebas cubren la creación de un nuevo usuario, asegurando que se cree con un arreglo vacío de mascotas por defecto, y la obtención de un usuario por su correo electrónico.

`chaiTest.test.js`: Implementa las mismas pruebas que Users.test.js, pero utilizando la librería de aserciones Chai para una sintaxis más legible y estructurada. Además, se agregan pruebas para actualizar y eliminar un usuario, verificando que estas acciones se realicen correctamente en la base de datos.

`bcryptTest.test.js`: Se incluyen pruebas para verificar el correcto funcionamiento de bcrypt en el proceso de hash y comparación de contraseñas. Se asegura que el hash de la contraseña sea diferente al valor original y que la comparación de contraseñas funcione correctamente, tanto cuando coinciden como cuando no.

`useDtoTest.test.js`: Se prueban las transformaciones aplicadas a los objetos UserDTO. Las pruebas verifican que el nombre y el apellido se unifiquen en una sola propiedad "name", y que las propiedades innecesarias como password, first_name y last_name sean eliminadas correctamente en la transformación del objeto.

`superTestPets.test.js`: Incluye la prueba de los endpoints de mascota y Pruebas para crear una mascota con imagen

- POST /api/pets/withimage - Crear una mascota con imagen 

Se prueba el proceso de creación de una mascota, pero esta vez con una imagen adjunta. La imagen se lee desde una ruta local (../public/img/test-image.jpg), y se envía como parte de la solicitud usando el método .attach().
Verifica que la mascota se haya creado correctamente con la imagen y que la imagen esté presente en la respuesta.

Para una correcta ejecución de las pruebas, se está utilizando mongodb-memory-server, dependencia que permite crear una instancia de MongoDB en memoria para realizar las pruebas de manera aislada y sin afectar una base de datos real.

## Reestructuración del Proyecto y Nuevas Funcionalidades
En lugar de utilizar modelos relacionados con "adoption" y "pets", se ha incorporado un modelo de producto que permite gestionar los artículos de un catálogo en línea.

La reestructuración incluye la creación de los niveles de abstracción necesarios para manejar los productos, tales como el DAO, services, y controllers. Además, se han implementado rutas para interactuar con los productos a través de una API.

### Rutas Disponibles // Ejemplo de Ruta POST para Crear un Producto
http://localhost:8080/api/products 

{
    "name": "Laptop Gaming",
    "description": "Potente laptop con GPU dedicada",
    "price": 1500,
    "stock": 10,
    "category": "Electronics",
    "imageUrl": "https://example.com/laptop.jpg"
}

----------------------
Además tambien se agregó un campo cart a la creacion de un nuevo user, permitiendo poder agregar y eliminar productos al carro del usuario

POST http://localhost:8080/api/users/:uid/cart/:pid
DELETE http://localhost:8080/api/users/:uid/cart/:pid


**Creado por:**  
Facundo Robert