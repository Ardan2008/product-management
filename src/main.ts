//import createApp from Vue
import { createApp } from 'vue';
import './style.css'
//import component App
import App from './App.vue';

//import config routes
import routes from './routes'

//create App Vue
const app = createApp(App);

//gunakan "routes" di Vue dengan plugin "use"
app.use(routes);

app.mount('#app');