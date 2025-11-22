// PocketBase Migration: Create Cifra Collections
// This migration automatically creates all required collections for Cifra app
// Run automatically when PocketBase starts

migrate(
	(app) => {
		// 1. Create users collection (auth) - skip if already exists
		let usersCollection;
		try {
			usersCollection = app.findCollectionByNameOrId('users');
		} catch (_e) {
			usersCollection = new Collection({
				type: 'auth',
				name: 'users',
				listRule: '@request.auth.id = id',
				viewRule: '@request.auth.id = id',
				createRule: '',
				updateRule: '@request.auth.id = id',
				deleteRule: '@request.auth.id = id',
				fields: [
					{
						type: 'text',
						name: 'displayName',
						required: false,
					},
					{
						type: 'text',
						name: 'bio',
						required: false,
					},
					{
						type: 'file',
						name: 'avatarUrl',
						required: false,
						options: {
							maxSelect: 1,
							maxSize: 5242880, // 5MB
							mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
						},
					},
					{
						type: 'text',
						name: 'accentColor',
						required: false,
						defaultValue: '#8b5cf6',
					},
					{
						type: 'bool',
						name: 'emailNotifications',
						required: false,
						defaultValue: true,
					},
				],
				passwordAuth: {
					enabled: true,
					identityFields: ['email'],
				},
				indexes: ['CREATE INDEX idx_users_email ON users (email)'],
			});
			app.save(usersCollection);
		}

		// 2. Create products collection (base)
		let productsCollection;
		try {
			productsCollection = app.findCollectionByNameOrId('products');
		} catch (_e) {
			productsCollection = new Collection({
				type: 'base',
				name: 'products',
				listRule: "status = 'published' || owner = @request.auth.id",
				viewRule: "status = 'published' || owner = @request.auth.id",
				createRule: "@request.auth.id != ''",
				updateRule: 'owner = @request.auth.id',
				deleteRule: 'owner = @request.auth.id',
				fields: [
					{
						type: 'text',
						name: 'title',
						required: true,
						min: 1,
						max: 200,
					},
					{
						type: 'text',
						name: 'description',
						required: true,
						min: 10,
					},
					{
						type: 'number',
						name: 'priceRub',
						required: true,
						min: 0,
					},
					{
						type: 'select',
						name: 'category',
						required: true,
						values: [
							'Notion Template',
							'Design Asset',
							'Code Snippet/Plugin',
							'E-book/Guide',
							'Audio/Preset',
							'Other',
						],
					},
					{
						type: 'file',
						name: 'coverImage',
						required: false,
						options: {
							maxSelect: 1,
							maxSize: 10485760, // 10MB
							mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
						},
					},
					{
						type: 'file',
						name: 'productFiles',
						required: false,
						options: {
							maxSelect: 10,
							maxSize: 2147483648, // 2GB
							mimeTypes: ['*'],
						},
					},
					{
						type: 'number',
						name: 'sales',
						required: false,
						min: 0,
						defaultValue: 0,
					},
					{
						type: 'number',
						name: 'revenue',
						required: false,
						min: 0,
						defaultValue: 0,
					},
					{
						type: 'select',
						name: 'status',
						required: true,
						values: ['published', 'draft'],
						defaultValue: 'draft',
					},
					{
						type: 'relation',
						name: 'owner',
						required: true,
						collectionId: usersCollection.id,
						cascadeDelete: true,
						maxSelect: 1,
					},
				],
				indexes: [
					'CREATE INDEX idx_products_owner ON products (owner)',
					'CREATE INDEX idx_products_status ON products (status)',
					'CREATE INDEX idx_products_category ON products (category)',
				],
			});
			app.save(productsCollection);
		}

		// 3. Create sales collection (base)
		let salesCollection;
		try {
			salesCollection = app.findCollectionByNameOrId('sales');
		} catch (_e) {
			salesCollection = new Collection({
				type: 'base',
				name: 'sales',
				listRule: 'owner = @request.auth.id',
				viewRule: 'owner = @request.auth.id',
				createRule: '', // Public for webhook payments
				updateRule: '', // Admin only
				deleteRule: '', // Admin only
				fields: [
					{
						type: 'relation',
						name: 'product',
						required: true,
						collectionId: productsCollection.id,
						cascadeDelete: false,
						maxSelect: 1,
					},
					{
						type: 'email',
						name: 'customerEmail',
						required: true,
					},
					{
						type: 'number',
						name: 'amount',
						required: true,
						min: 0,
					},
					{
						type: 'number',
						name: 'platformFee',
						required: true,
						min: 0,
					},
					{
						type: 'number',
						name: 'netAmount',
						required: true,
						min: 0,
					},
					{
						type: 'relation',
						name: 'owner',
						required: true,
						collectionId: usersCollection.id,
						cascadeDelete: false,
						maxSelect: 1,
					},
				],
				indexes: [
					'CREATE INDEX idx_sales_owner ON sales (owner)',
					'CREATE INDEX idx_sales_product ON sales (product)',
				],
			});
			app.save(salesCollection);
		}

		// 4. Create promos collection (base)
		let promosCollection;
		try {
			promosCollection = app.findCollectionByNameOrId('promos');
		} catch (_e) {
			promosCollection = new Collection({
				type: 'base',
				name: 'promos',
				listRule: 'owner = @request.auth.id',
				viewRule: '', // Public for promo code validation
				createRule: "@request.auth.id != ''",
				updateRule: 'owner = @request.auth.id',
				deleteRule: 'owner = @request.auth.id',
				fields: [
					{
						type: 'text',
						name: 'code',
						required: true,
						unique: true,
						min: 3,
						max: 50,
					},
					{
						type: 'number',
						name: 'discountPercent',
						required: true,
						min: 0,
						max: 100,
					},
					{
						type: 'number',
						name: 'uses',
						required: false,
						min: 0,
						defaultValue: 0,
					},
					{
						type: 'bool',
						name: 'isActive',
						required: false,
						defaultValue: true,
					},
					{
						type: 'relation',
						name: 'owner',
						required: true,
						collectionId: usersCollection.id,
						cascadeDelete: true,
						maxSelect: 1,
					},
				],
				indexes: [
					'CREATE INDEX idx_promos_owner ON promos (owner)',
					'CREATE INDEX idx_promos_code ON promos (code)',
					'CREATE INDEX idx_promos_active ON promos (isActive)',
				],
			});
			app.save(promosCollection);
		}

		// 5. Create payouts collection (base)
		let payoutsCollection;
		try {
			payoutsCollection = app.findCollectionByNameOrId('payouts');
		} catch (_e) {
			payoutsCollection = new Collection({
				type: 'base',
				name: 'payouts',
				listRule: 'owner = @request.auth.id',
				viewRule: 'owner = @request.auth.id',
				createRule: "@request.auth.id != ''",
				updateRule: '', // Admin only
				deleteRule: '', // Admin only
				fields: [
					{
						type: 'number',
						name: 'amount',
						required: true,
						min: 0,
					},
					{
						type: 'select',
						name: 'status',
						required: true,
						values: ['pending', 'completed', 'failed'],
						defaultValue: 'pending',
					},
					{
						type: 'text',
						name: 'method',
						required: false,
						max: 100,
					},
					{
						type: 'relation',
						name: 'owner',
						required: true,
						collectionId: usersCollection.id,
						cascadeDelete: false,
						maxSelect: 1,
					},
				],
				indexes: [
					'CREATE INDEX idx_payouts_owner ON payouts (owner)',
					'CREATE INDEX idx_payouts_status ON payouts (status)',
				],
			});
			app.save(payoutsCollection);
		}
	},
	(app) => {
		// Rollback: delete collections in reverse order
		const collections = ['payouts', 'promos', 'sales', 'products', 'users'];

		for (const name of collections) {
			try {
				const collection = app.findCollectionByNameOrId(name);
				app.delete(collection);
			} catch (_e) {
				// Collection might not exist, ignore
			}
		}
	}
);
