import { startCenter } from '@workspace/core';
import { centerModule } from './config/module';
startCenter(centerModule).catch((error) => console.error(error));
