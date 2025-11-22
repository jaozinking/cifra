// PocketBase Migration: Add S3 file keys support to products collection
// This migration adds s3FileKeys field to store S3 object keys instead of PocketBase files

migrate(
	(app) => {
		let productsCollection;
		try {
			productsCollection = app.findCollectionByNameOrId('products');
		} catch (_e) {
			console.warn('Products collection not found, skipping migration');
			return;
		}

		// Check if schema exists and is accessible
		if (!productsCollection.schema) {
			console.error('Products collection schema is not available. Cannot add fields.');
			return;
		}

		// Check if fields already exist by trying to find them
		let hasS3FileKeys = false;
		let hasS3CoverImageKey = false;

		try {
			productsCollection.schema.findFieldByName('s3FileKeys');
			hasS3FileKeys = true;
		} catch (_e) {
			// Field doesn't exist
		}

		try {
			productsCollection.schema.findFieldByName('s3CoverImageKey');
			hasS3CoverImageKey = true;
		} catch (_e) {
			// Field doesn't exist
		}

		// Add s3FileKeys field if it doesn't exist
		if (!hasS3FileKeys) {
			try {
				const field = new Field({
					type: 'json',
					name: 's3FileKeys',
					required: false,
				});
				productsCollection.schema.addField(field);
				console.log('Added s3FileKeys field to products collection');
			} catch (e) {
				console.error('Failed to add s3FileKeys field:', e);
			}
		} else {
			console.log('s3FileKeys field already exists, skipping');
		}

		// Add s3CoverImageKey field if it doesn't exist
		if (!hasS3CoverImageKey) {
			try {
				const field = new Field({
					type: 'text',
					name: 's3CoverImageKey',
					required: false,
				});
				productsCollection.schema.addField(field);
				console.log('Added s3CoverImageKey field to products collection');
			} catch (e) {
				console.error('Failed to add s3CoverImageKey field:', e);
			}
		} else {
			console.log('s3CoverImageKey field already exists, skipping');
		}

		// Save collection after all changes
		app.save(productsCollection);
	},
	(app) => {
		// Rollback: remove fields
		try {
			const productsCollection = app.findCollectionByNameOrId('products');
			if (!productsCollection || !productsCollection.schema) {
				return;
			}
			try {
				const s3FileKeysField = productsCollection.schema.findFieldByName('s3FileKeys');
				productsCollection.schema.removeField(s3FileKeysField.id);
			} catch (_e) {
				// Field doesn't exist
			}
			try {
				const s3CoverImageKeyField =
					productsCollection.schema.findFieldByName('s3CoverImageKey');
				productsCollection.schema.removeField(s3CoverImageKeyField.id);
			} catch (_e) {
				// Field doesn't exist
			}
			app.save(productsCollection);
		} catch (_e) {
			// Collection doesn't exist, nothing to rollback
		}
	}
);
