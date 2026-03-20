import app from './app';
import config from './config/env';

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`📡 EventSphere is listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
  }
}

main();