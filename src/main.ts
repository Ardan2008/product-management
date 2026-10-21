import { createApp } from 'vue';
import './style.css'
import App from './App.vue';

import routes from './routes'

// section masuk ke dalam viewport -> animasi blur reveal
import { reveal } from './directives/reveal'

const app = createApp(App);

app.use(routes);

app.directive('reveal', reveal)

app.mount('#app');