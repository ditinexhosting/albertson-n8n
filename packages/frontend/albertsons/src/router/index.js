import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const NodeView = async () => await import('@/app/views/NodeView.vue');

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('../views/AboutView.vue'),
		},
		{
			path: '/workflow/new',
			name: 'new-workflow',
			components: {
				default: NodeView,
			},
			meta: {
				nodeView: true,
				keepWorkflowAlive: true,
			},
		},
	],
});

export default router;
