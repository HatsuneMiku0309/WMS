import { Cookies } from 'quasar'
import { createRouter, createWebHistory } from 'vue-router';
import { get } from './utils/api';
import Product from './views/Product.vue';
import ProductSpec from './views/ProductSpec.vue';
import DashBorad from './views/DashBorad.vue';
import Index from './views/MainLayout.vue';
import Login from './views/Login.vue';
import Vendor from './views/Vendor.vue';
import Stock from './views/Stock.vue';


const routes = [
  // { path: "/:pathMatch(.*)*", redirect: '/' },
  { 
    path: '/', component: Index,
    children: [
      { path: '', component: DashBorad },
      { path: 'products', component: Product },
      { path: 'product_specs', component: ProductSpec },
      { path: 'vendors', component: Vendor },
      { path: 'stocks', component: Stock }
    ],
    meta: {
      requiresAuth: true
    }
  },
  { path: '/login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

async function canUserAccess () {
  return await get('authen');
}

router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    try {
      await canUserAccess();
    } catch (err) {
      return '/login';
    }
  }
})

export default router