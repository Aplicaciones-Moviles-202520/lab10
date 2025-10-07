# Lab 10 — PWA detrás de CloudFront y API Gateway

Este laboratorio se basa en desplegar una PWA basada en una infraestructura serverless para entender los aspectos centrales de un deployment de estas características. Este deployment se volverá base para el trabajo con service workers en el siguiente laboratorio. Esta guía considera los siguientes pasos:

-   Crear un certificado público en ACM (N. Virginia)
-   Desplegar la infraestructura en CloudFormation (São Paulo)
-   Compilar la aplicación PWA localmente
-   Publicar el build en S3
-   Validar el sitio activo como web app
-   Instalar el manifest de la PWA
-   Verificar la instalabilidad de la PWA
-   Probar las funcionalidades de la API

A lo largo de este laboratorio se utilizará un dominio personalizado que corresponde a una ruta de la forma `12345678k.www.exampledomain.cloud`, donde `12345678k` es el RUT del estudiante sin puntos ni guión

## Requisitos previos

-   Cuenta de AWS con permisos para ACM, CloudFormation, S3, CloudFront, API Gateway y DynamoDB
-   Acceso a la funcionalidad de instalación de registros DNS para el dominio `exampledomain.cloud`
-   Node.js y npm instalados en el computador local

## Procedimiento

### 1. Crear certificado público en ACM (us-east-1)

La aplicación será desplegada en CloudFront. Esta herramienta es una CDN que otorga un dominio propio (ej: `d1234abcd.cloudfront.net`), sin embargo, como parte de este desarrollo se utilizará un dominio personalizado (`12345678k.www.exampledomain.cloud`)

Para que CloudFront pueda servir contenido bajo HTTPS con un dominio personalizado, es necesario contar con un certificado SSL/TLS válido. AWS Certificate Manager (ACM) permite crear y gestionar estos certificados de forma gratuita. La herramienta mostrada en clases `https://exampledomain.cloud/dns/` permite a los estudiantes del curso gestionar los registros DNS necesarios para validar dominios en ACM y luego apuntar a los recursos de AWS. El acceso a estas funcionalidades es posible mediante el correo electrónico y contraseña entregados vía correo electrónico

El procedimiento es el siguiente:

1. Ingresa a AWS Console y cambiar la región a us-east-1 (N. Virginia)
2. Ve a "Certificate Manager (ACM)" → "Request" → "Request a public certificate"
3. Solicita un certificado para el dominio `12345678k.www.exampledomain.cloud` con el resto de las configuraciones por omisión
4. Al generar el certificado este quedará en estado "Pending validation". En la misma página será posible ver un registro CNAME que debe ser agregado en el DNS del dominio para validar la propiedad del mismo
5. Utiliza el servicio de instalación de registros DNS `https://exampledomain.cloud/dns/` para agregar el registro CNAME proporcionado por ACM. Esto permitirá que ACM verifique que tienes control sobre el dominio solicitado. CNAME name y value se deben copiar exactamente como aparecen en ACM (puede usar el mismo botón de copiar)
6. Espera a que el estado sea "Issued"
7. Copia el Certificate ARN o solo el Certificate ID (el GUID) para usarlo en el siguiente paso. Se debe copiar solo el identificador, no el ARN completo

### 2. Desplegar el template en CloudFormation (sa-east-1)

Este laboratorio cuenta con un template de CloudFormation (`infrastructure.yaml`) que crea toda la infraestructura necesaria para servir la PWA y su backend serverless. El template debe ser desplegado en la región sa-east-1 (São Paulo). El template crea la infraestructura que se puede apreciar en la siguiente imagen:

[Infraestructura del laboratorio](./figures/architecture.png)

Para desplegar el template se debe seguir el siguiente procedimiento en la consola web de AWS:

1. Cambiar la región a sa-east-1 (São Paulo)
2. Ir a "CloudFormation" → "Create stack (With new resources)"
3. En "Specify template", elige "Upload a template file" y selecciona el archivo `infrastructure.yaml` de este laboratorio
4. Continúa a "Stack details" y configura los parámetros de acuerdo a lo que corresponda:
    - `Stack name`: por ejemplo, `SpaceshipsPWA`
    - `CustomDomainName`: `12345678k.www.exampledomain.cloud`
    - `SSLCertificateId`: pega el Certificate ID copiado desde ACM en us-east-1 (solo el GUID, no el ARN completo)
    - Dejar el resto de parámetros como están (por defecto `DeploymentType` es `dev`)
5. Avanza a "Configure stack options" (puedes dejar por defecto)
6. En la revisión final, marca la casilla de capacidades de IAM: "I acknowledge that AWS CloudFormation might create IAM resources…"
7. Crea el stack y espera a que el estado llegue a `CREATE_COMPLETE`

Al finalizar, entra a la pestaña "Outputs" del stack y toma nota de:

-   `WebsiteUrl`: El dominio configurado para la CDN
-   `CloudFrontDomainName`: El dominio de CloudFront (ej: `d1234abcd.cloudfront.net`)
-   `BucketName`: El nombre del bucket S3 creado para alojar la PWA

Utilizando el mismo servicio de instalación de registros DNS, instala un registro que apunte `12345678k.www.exampledomain.cloud` al dominio de CloudFront (`CloudFrontDomain`). Esto permitirá que el dominio personalizado funcione correctamente con HTTPS.

En el bucket S3 creado, cargue el archivo `index.html` que se encuentra en la carpeta infrastructure. Luego de esto dirígjase a la URL del sitio web y verifique que el archivo se esté sirviendo correctamente.

### 3. Compilar la aplicación PWA

Como parte de este laboratorio se entrega una aplicación PWA base que debe ser compilada localmente para luego ser desplegada en el bucket S3 creado por el stack. El código fuente de la aplicación se encuentra en la carpeta `app/` dentro del laboratorio.

1. Abrir el terminal en la carpeta de la app
2. Editar el archivo `.env` para configurar el dominio que se utilizará para la PWA
3. Instalar las dependencias: `npm ci` (o `npm install`)
4. Compilar la aplicación: `npm run build`
5. Verifica que se haya generado la carpeta `out/` con `index.html` y los assets
6. Subir el contenido de `out/` al bucket S3 creado por el stack (se debe reemplazar el contenido existente)

Luego de esto, diríjase a la URL del sitio web y verifique que la aplicación se esté sirviendo correctamente.

### 4. Verificar instalabilidad

La aplicación entregada está preparada para funcionar como PWA, pero no cuenta con el manifest necesario para ser instalable. En este paso se verificará que la aplicación es reconocida como PWA por el navegador.

1. Crea el archivo `public/manifest.webmanifest` en tu proyecto con este contenido:
    ```
    {
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#000000",
        "icons": [
            {
            "src": "/icons/web-app-manifest-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
            },
            {
            "src": "/icons/web-app-manifest-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
            }
        ]
    }
    ```
2. Modificar el metadata de la app en `app/src/app/layout.jsx` para incluir el manifest y los detalles adicionales requeridos por Apple:
    ```
    manifest: '/manifest.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Imperial Watch App'
    }
    ```
3. Recompilar la aplicación: `npm run build`
4. Subir el contenido de `out/` al bucket S3 creado por el stack (se debe reemplazar el contenido existente)
5. En el navegador de escritorio, abre DevTools → Application → Manifest:
    - Verifica que el manifest se cargue, que haya íconos válidos y que la app sea "Installable"
    - Revisa Application → Service Workers para confirmar que el SW esté registrado
6. En tu celular, abre el sitio e instala la PWA (debería aparecer la opción en el menú del navegador)

### 5. Verificación

1. Acceder a la APP y utilizar como nombre y contraseña `example_trooper`, validar que se puede ingresar a la aplicación
2. Agregar manualmente un ítem en la tabla de usuarios en DynamoDB con el nombre y contraseña que desee
3. Ingresar a la aplicación con el usuario creado y validar que se puede ingresar a la aplicación
4. Validar que se puede agregar una nave al registro
5. Validar que la nave agregada aparece en la tabla de naves

## Conclusiones

Al finalizar este laboratorio, los estudiantes habrán desplegado una aplicación PWA serverless en AWS utilizando CloudFormation, S3, CloudFront y API Gateway. Además, habrán configurado un dominio personalizado con HTTPS y verificado la instalabilidad de la PWA en dispositivos móviles. Este conocimiento servirá como base para trabajar con service workers y funcionalidades avanzadas de PWA en el siguiente laboratorio.
