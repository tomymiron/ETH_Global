module.exports = {
	apps: [
		{
			name: 'previateapi',
			script: 'index.js',
			cwd: '/home/previateapi/htdocs/api.previateesta.com',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
		},
	],
};