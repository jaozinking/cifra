// PocketBase Migration: Add promo field to orders collection
// This migration adds promo relation field to track which promo code was used

migrate((app) => {
  let ordersCollection;
  try {
    ordersCollection = app.findCollectionByNameOrId("orders");
  } catch (e) {
    console.warn("Orders collection not found, skipping migration");
    return;
  }

  // Check if schema exists
  if (!ordersCollection.schema) {
    console.error("Orders collection schema is not available");
    return;
  }

  // Check if promo field already exists
  let promoField = null;
  try {
    promoField = ordersCollection.schema.findFieldByName("promo");
  } catch (e) {
    // Field doesn't exist
  }

  if (!promoField) {
    // Get promos collection
    let promosCollection;
    try {
      promosCollection = app.findCollectionByNameOrId("promos");
    } catch (e) {
      console.error("Promos collection not found, cannot add promo field");
      return;
    }

    // Add promo field (relation to promos collection)
    const field = new Field({
      type: "relation",
      name: "promo",
      required: false,
      collectionId: promosCollection.id,
      cascadeDelete: false,
      maxSelect: 1,
    });
    
    try {
      ordersCollection.schema.addField(field);
      console.log("Added promo field to orders collection");
    } catch (e) {
      console.error("Failed to add promo field:", e);
    }
  } else {
    console.log("promo field already exists, skipping");
  }

  // Save collection after changes
  app.save(ordersCollection);
}, (app) => {
  // Rollback: remove promo field
  try {
    const ordersCollection = app.findCollectionByNameOrId("orders");
    if (!ordersCollection || !ordersCollection.schema) {
      return;
    }
    try {
      const promoField = ordersCollection.schema.findFieldByName("promo");
      ordersCollection.schema.removeField(promoField.id);
    } catch (e) {
      // Field doesn't exist
    }
    app.save(ordersCollection);
  } catch (e) {
    // Collection doesn't exist, nothing to rollback
  }
});

