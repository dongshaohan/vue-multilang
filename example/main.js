import Vue from 'vue'
import App from './App.vue'
import VueMultiLang from "../dist/vue-multilang.esm"

Vue.use(VueMultiLang)

let multiLang = new VueMultiLang({
    path: './example/lang',
    version: 1,
    lang: ['ar', 'vi', 'th', 'id']
})
new Vue({
    el: '#app',
    multiLang,
    render: h => h(App)
})
