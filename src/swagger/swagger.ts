import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

// Function to setup Swagger UI and auto-generated documentation
export const setupSwagger = (app: Application) => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'eve equinox API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          CharacterProfile: require('./schemas/CharacterProfile.json'),
          PortraitUrls: require('./schemas/PortraitUrls.json')
        },
        securitySchemes: {
          OAuth2: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: 'https://login.eveonline.com/v2/oauth/authorize',
              }
            },
          }
        },
      },
    },
    apis: ['./src/routes/*.ts', './src/routes/*/*.ts'],
  };


  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
