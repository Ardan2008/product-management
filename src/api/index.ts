//import axios
import axios from 'axios';

const Api = axios.create({
    //set default endpoint API
    baseURL: 'http://localhost:8000'
})

Api.interceptors.request.use((config) => {
    const token = localStorage.getItem('crud_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default Api