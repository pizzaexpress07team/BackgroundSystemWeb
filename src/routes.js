import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'

import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'

let routes = [
  {
    path: '/login',
    component: Login,
    name: '',
    hidden: true
  },
  {
    path: '/404',
    component: NotFound,
    name: '',
    hidden: true
  },
  //{ path: '/main', component: Main },
  {
    path: '/',
    component: Home,
    name: '订单管理',
    iconCls: 'fa fa-id-card-o',//图标样式class
    children: [
      {path: '/main', component: Main, name: 'Main', hidden: true},
      {path: '/table', component: Table, name: '订单信息'},
      //{path: '/form', component: Form, name: 'Form'},
      //{path: '/user', component: user, name: 'user'},
    ]
  },
  {
    path: '/',
    component: Home,
    name: '配送管理',
    iconCls: 'fa fa-id-card-o',
    children: [
      {path: '/page4', component: Page4, name: '配送信息'},
      //{path: '/page5', component: Page5, name: '菜单展示'}
    ]
  },
  {
    path: '/',
    component: Home,
    name: '菜单展示',
    iconCls: 'fa fa-address-card',
    children: [
      {path: '/page6', component: Page6, name: '菜单信息'}
    ]
  },
  {
    path: '/',
    component: Home,
    name: '用户信息',
    iconCls: 'fa fa-bar-chart',
    //leaf: true,//只有一个节点
    children: [
      {path: '/echarts', component: echarts, name: '用户列表'}
    ]
  },
  {
    path: '*',
    hidden: true,
    redirect: {path: '/404'}
  }
];

export default routes;
