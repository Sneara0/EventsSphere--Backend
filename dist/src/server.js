import app from './app';
import config from './config/env';
async function main() {
    try {
        app.listen(config.PORT, () => {
            console.log(`📡 EventSphere is listening on port ${config.PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Server Error:', error);
    }
}
main();
