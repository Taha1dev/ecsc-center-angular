import { startCenter } from '@workspace/core';
import { appConfig } from './app.config';
import { centerModule } from './config/module';
startCenter(centerModule, appConfig).catch((error) => console.error(error));
