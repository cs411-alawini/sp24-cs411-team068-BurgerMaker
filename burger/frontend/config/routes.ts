export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: 'register-result',
        icon: 'smile',
        path: '/user/register-result',
        component: './user/register-result',
      },
      {
        name: 'register',
        icon: 'smile',
        path: '/user/register',
        component: './user/register',
      },
      {
        component: '404',
        path: '/user/*',
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    component: './dashboard/analysis',
  },
  {
    path: '/crypto-market',
    icon: 'shop',
    name: 'Crypto-Market',
    component: './crypto-market',
  },
  {
    path: '/list',
    icon: 'table',
    name: 'Community',
    routes: [
      {
        name: 'Posts',
        icon: 'smile',
        path: '/list/search/articles',
        component: './list/search/articles',
      },
      {
        name: 'Publish',
        icon: 'smile',
        path: '/list/search/publish',
        component: './list/search/publish',
      },
    ],
  },
  {
    name: 'account',
    icon: 'user',
    path: '/account',
    routes: [
      {
        path: '/account',
        redirect: '/account/center',
      },
      {
        name: 'settings',
        icon: 'smile',
        path: '/account/settings',
        component: './account/settings',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    component: '404',
    path: '/*',
  },
];
