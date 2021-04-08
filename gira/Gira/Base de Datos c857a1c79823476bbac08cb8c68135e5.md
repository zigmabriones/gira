# Base de Datos

# Eventos

## Campos

**Campos únicos:**

- `name`

**Campos requeridos:**

- `name`
- `exhibitor`

## Información Adicional

### Name

El campo `name` en el schema de eventos debe ser único, ya que es usado para que los usuarios puedan ver el evento públicamente a través de la ruta de `/eventos/:eventUri` ([Rutas](Rutas%20dcf1646a492a4696a362a6fb01eddc14.md) ).

### Images y Videos

Aunque los campos `images` y `videos` aceptan *n* número de referencias a imágenes y videos del evento, el frontend por el momento sólo soporta como máximo 5 imágenes y 3 videos, para evitar que la vista pública del evento se descomponga.

### Link

Ya que `link` no es un campo requerido, los usuarios deben recibir un correo cuando el administrador o líder que creó el evento llene el campo para que tengan acceso al evento al que se registraron.

### Registered Users

El campo `registered_users` contiene un arreglo con referencia a todos los usuarios que se han registrado al evento. Esto significa que, si un usuario quiere quitar su registro, el usuario debe ser eliminado del arreglo `registered_users` y el evento debe ser eliminado también del arreglo de `events` del usuario.

## Schema

```jsx
{
    name: {
        type: String,
        required: 'Event name is required',
        trim: true,
				unique: true
    },
    date: Date,
    exhibitor: {
        type: String,
        required: 'Event exhibitor is required',
        trim: true
    },
    description: String,
    images: [String],
    videos: [String],
    link: String,
    registered_users: [mongoose.Schema.Types.ObjectId]
}
```

# Usuarios

## Campos

**Campos únicos:**

- `email`

**Campos requeridos:**

- `first_name`
- `last_name`
- `email`
- `password`
- `permissions`

## Información Adicional

Cualquier modificación al correo o contraseña del usuario deben ser hechas a través de la dependencia de `PassportJs` (registro de usuario, inicio de sesión del usuario, cierre de sesión del usuario, modificación de correo o contraseña del usuario).

### Email

El campo `email` en el schema de usuarios debe ser único, ya que es usado como el índice de `username` por la dependencia `PassportJs`.

### Password

El campo `password` hace uso de el plugin de la dependencia de `Bcrypt`, que automáticamente hashea y almacena la contraseña hasheada por seguridad. 

### Permissions

El campo de `permissions` solo acepta los valores en el arreglo de enumeración `['user', 'member', 'leader','admin', 'dev']`, y por lo tanto la dependencia `Mongoose` tirará un error si recibe cualquier otro valor. De inicio, todos los usuarios son `permissions: 'user'`, y cualquier cambio a estos permisos se debe hacer a través del panel de `dev`.

### Verified

El campo `verified` por default es `false`, y hasta que este campo no sea `true` el usuario no podrá hacer uso de su cuenta. Al crear su cuenta, el usuario recibe un correo de verificación, y también al cambiar su correo.

### Events

El campo `events` contiene un arreglo con referencia a todos los eventos a los que se ha registrado un usuario. Esto significa que, si un usuario quiere quitar su registro, el evento debe ser eliminado del arreglo `events` y el usuario debe ser eliminado también del arreglo de `registered_users` del evento.

## Schema

```jsx
{
    first_name: {
        type: String,
        required: 'First name is required',
        trim: true,
    },
    last_name: {
        type: String,
        required: 'Last name is required',
        trim: true,
    },
    email: {
        type: String,
        required: 'Email is required',
        trim: true,
        unique: true,
        lowercase: true
    },
    phone_number: {
        type: String,
        trim: true
    },
    age: Number,
    gender: {
        type: String,
        trim: true
    },
    institution: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: 'Password is required',
        bcrypt: true
    },
    permissions: {
        type: String,
        required: 'Permission level is required',
        trim: true,
        lowercase: true,
				enum: ['user', 'member', 'leader','admin', 'dev']
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    events: [mongoose.Schema.Types.ObjectId]
}
```

# Lista de Correo

## Campos

**Campos únicos:**

- `email`

**Campos requeridos:**

- `first_name`
- `last_name`
- `email`

## Información Adicional

### Email

El campo `email` en el schema de la lista de correo debe ser único para evitar envíos de correos masivos dobles al usuario.

## Schema

```jsx
{
    first_name: {
        type: String,
        required: 'First name is required',
        trim: true,
    },
    last_name: {
        type: String,
        required: 'Last name is required',
        trim: true,
    },
    email: {
        type: String,
        required: 'Email is required',
        trim: true,
        unique: true,
        lowercase: true
    },
    phone_number: {
        type: String,
        trim: true
    },
    age: Number,
    gender: {
        type: String,
        trim: true
    },
    institution: {
        type: String,
        trim: true
    }
}
```