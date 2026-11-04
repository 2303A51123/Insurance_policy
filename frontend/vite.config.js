import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
plugins: [react()],
base: '/Insurance_policy/',
server: {
proxy: {
'/api': 'http://localhost:5000',
},
},
});
