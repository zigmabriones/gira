# Requerimientos

# Requerimientos Funcionales

- Registro de usuario a una lista de correos en donde recibirá notificaciones sobre eventos, noticias, y artículos por correo y/o por teléfono. Éste registro debe contener:
    - Nombre
    - Apellido
    - Correo
    - Teléfono
    - Edad
    - Sexo
    - Universidad, Trabajo o Institución
- Creación, actualización, lectura y eliminación de eventos con imágenes y videos, desplegados en la página de inicio.
- Galería de fotos.
- Habilidad de editar los textos e imágenes de la página de inicio desde el panel de administrador.
- Registro de cuenta de usuario con verificación por correo. Éste registro debe contener:
    - Nombre
    - Apellido
    - Correo
    - Teléfono
    - Edad
    - Sexo
    - Universidad, Trabajo o Institución
    - Contraseña
- Ingreso de usuario a su cuenta con su correo y contraseña.
- Registro de usuarios a eventos.
- Notificación con la liga del evento a los usuarios registrados al evento.
- Habilidad de comentar en eventos, noticias y artículos con la cuenta de usuario.
- Habilidad de editar la información personal de la cuenta del usuario. Los usuarios pueden modificar:
    - Nombre
    - Apellido
    - Correo
    - Teléfono
    - Edad
    - Universidad, Trabajo o Institución
    - Contraseña
- Recuperación de contraseña a través de correo.
- Creación, modificación, lectura y eliminación de usuarios registrados en la lista de correos.
- Habilidad de seleccionar usuarios registrados en la lista de correos y enviar correos masivos.
- Habilidad de descargar la lista de correos en un archivo `.csv`.
- Creación, modificación, lectura y eliminación de noticias y artículos con imágenes y videos.
- Verificación de cuenta en caso de cambio de correo por un usuario antes de poder volver a usar su cuenta.

# Requerimientos No-Funcionales

- Aviso de privacidad y confidencialidad de los usuarios.
- Sistema de seguridad básica con evasión y mitigación de ataques cibernéticos
- Base de datos MongoDB Atlas
- Deployment en Amazon Web Services en un ambiente de Elastic Beanstalk
- Base de datos de imágenes en AWS Simple Storage Service
- Certificado SSL de Amazon Web Services a través de Amazon Certificate Manager
- Servicio de correos electrónicos automáticos a través de AWS Simple Email Service
- Servicio de correo electrónico de contacto a través de AWS WorkMail
- Servicio de dominio a través de AWS Route53
- Deployment automático a través de AWS CodePipeline con GitHub
- Interfaz web con Pug, CSS y JavaScript
- Runtime del servidor con Node.js y Express.js