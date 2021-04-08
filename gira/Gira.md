# Gira

# Documentación

[Requerimientos](Gira/Requerimientos%20f2c02cd936cc4d448c4a00c3b9f02d52.md)

[Rutas](Gira/Rutas%20dcf1646a492a4696a362a6fb01eddc14.md)

[Base de Datos](Gira/Base%20de%20Datos%20c857a1c79823476bbac08cb8c68135e5.md)

[Funciónes](Gira/Funcio%CC%81nes%2070fbaf8cac6b47db91c7c3336262c2da.md)

[Campos](Gira/Campos%200c00b81547d4406c87ee8a490819e1b0.md)

[Seguridad](Gira/Seguridad%2035e1e15b951d4423b88ec8d77f56599e.md)

[Diagrama de Actividades](Gira/Diagrama%20de%20Actividades%20835a1be637ff4cc58a84e28dd9e8d219.md)

[Mapa de Navegación](Gira/Mapa%20de%20Navegacio%CC%81n%2081b8706c767d4968ac13748845bd8a20.md)

[Arquitectura](Gira/Arquitectura%20a8e2fabd8f864e1f917539a78dbf0a57.md)

[Funcionalidades Futuras](Gira/Funcionalidades%20Futuras%2096e604bce0914ae3924c12827dcab359.md)

# Plan

- Funciones
    - Explicacion
    - Comentarios Javadoc en codigo
- Campos
    - Valores aceptados, valores no aceptados
- Seguridad
    - Dependencies
    - Rate limiter, sanitization, validation, etc
- Diagrama de actividades
    - Funciones, rutas, db, etc.
- Mapa de Navegacion
- Arquitectura
    - Elastic Beanstalk
        - Config Vars
        - Bucket
        - Instance
        - SSH Access
    - S3
        - mediadb
        - infodb
    - CodePipeline
        - Bucket
        - Deployment
    - WorkMail
    - SES
        - no-reply@mexicogira processes
    - IAM
    - Route53
        - Hosted Zone
    - ACM
        - SSL Certificate
    - MongoDB
        - Admin access, connection to elastic beanstalk
- Planned Features
- Add note on unfinished/wip features, and non-implemented features from requirements

[Costos Documentación](Gira/Costos%20Documentacio%CC%81n%200183bf80551940ea9778ac159e374339.csv)

[Costos Funcionalidades "Finales"](Gira/Costos%20Funcionalidades%20Finales%201e2ed53f3d6741c19f3bc12ee9a96e9a.csv)