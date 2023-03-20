import { SDK } from '@ringcentral/sdk';
import { fastify } from 'fastify';
import fs from 'fs';
import open from 'open';
const ENV_PATH = '.env.json';

(async () => {
  const server = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
        },
      },
    },
  });

  // check for .env.json file
  if (!fs.existsSync(ENV_PATH)) {
    server.log.error(new Error('.env.json file not found...'));
    process.exit(1);
  }
  const envConfig: {
    clientId: string;
    clientSecret: string;
    server: string;
    hostname: string;
    redirectUri: string;
    port: number;
    webhookUri: string;
  } = JSON.parse(fs.readFileSync(ENV_PATH, 'utf-8'));
  server.log.info(envConfig);

  // let subscription: unknown = null;

  const redirectUri = `http://${envConfig.hostname}:${envConfig.port}${envConfig.redirectUri}`;
  // setup redirect uri
  server.get<{
    Querystring: {
      code: string;
    };
  }>(envConfig.redirectUri, async (req) => {
    const code = req.query?.code ?? null;
    if (!code) {
      setImmediate(() => {
        process.exit(1);
      });
      return 'Code not found...';
    }
    // try login
    try {
      await sdk.login({
        code,
        redirect_uri: redirectUri,
      });
    } catch (err) {
      setImmediate(() => {
        process.exit(1);
      });
      return 'Login failed...';
    }

    // create subscription
    await sdk.platform().post('/restapi/v1.0/subscription', {
      eventFilters: [
        '/restapi/v1.0/account/~/extension/~/presence?detailedTelephonyState=true&sipData=true',
        '/restapi/v1.0/subscription/~?threshold=60&interval=30',
      ],
      deliveryMode: {
        transportType: 'WebHook',
        address: envConfig.webhookUri,
      },
      expiresIn: 3 * 60,
    });
    return 'OK';
  });
  server.listen({
    host: envConfig.hostname,
    port: envConfig.port,
  });

  // generate login uri
  const sdk = new SDK({
    clientId: envConfig.clientId,
    clientSecret: envConfig.clientSecret,
    server: envConfig.server,
  });
  const loginUri = sdk.loginUrl({
    brandId: '1210',
    redirectUri,
  });
  open(loginUri);
})();
