// PocketBase Migration: Seed Test Data
// This migration creates mock users, products, sales, promos, and payouts for testing

migrate((app) => {
  // Get collections
  const usersCollection = app.findCollectionByNameOrId("users");
  const productsCollection = app.findCollectionByNameOrId("products");
  const salesCollection = app.findCollectionByNameOrId("sales");
  const promosCollection = app.findCollectionByNameOrId("promos");
  const payoutsCollection = app.findCollectionByNameOrId("payouts");

  // Create test users
  const testUsers = [
    {
      email: "test@cifra.ru",
      password: "test123456",
      passwordConfirm: "test123456",
      displayName: "Тестовый Продавец",
      bio: "Привет! Я тестовый продавец цифровых товаров. Здесь вы найдете качественные шаблоны и ресурсы.",
      accentColor: "#8b5cf6",
      emailNotifications: true,
    },
    {
      email: "demo@cifra.ru",
      password: "demo123456",
      passwordConfirm: "demo123456",
      displayName: "Демо Аккаунт",
      bio: "Демонстрационный аккаунт для тестирования платформы Cifra.",
      accentColor: "#3b82f6",
      emailNotifications: true,
    },
    {
      email: "seller@cifra.ru",
      password: "seller123",
      passwordConfirm: "seller123",
      displayName: "Профессиональный Продавец",
      bio: "Создаю качественные цифровые продукты уже более 5 лет.",
      accentColor: "#10b981",
      emailNotifications: true,
    },
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existing = app.findAuthRecordByEmail("users", userData.email);
      createdUsers.push(existing);
    } catch (e) {
      // User doesn't exist, create it
      const userRecord = new Record(usersCollection);
      userRecord.set("email", userData.email);
      userRecord.set("password", userData.password);
      userRecord.set("passwordConfirm", userData.passwordConfirm);
      userRecord.set("displayName", userData.displayName);
      userRecord.set("bio", userData.bio);
      userRecord.set("accentColor", userData.accentColor);
      userRecord.set("emailNotifications", userData.emailNotifications);
      app.save(userRecord);
      createdUsers.push(userRecord);
    }
  }

  const mainUser = createdUsers[0]; // test@cifra.ru

  // Create test products for main user
  const testProducts = [
    {
      title: "Premium Notion Template - Управление проектами",
      description: "Профессиональный шаблон Notion для управления проектами с автоматизацией, трекингом задач и аналитикой. Включает готовые базы данных, шаблоны страниц и интеграции.",
      priceRub: 1999,
      category: "Notion Template",
      status: "published",
      sales: 15,
      revenue: 28485,
    },
    {
      title: "UI Kit для Figma - Современный дизайн",
      description: "Полный набор компонентов для создания современных интерфейсов. Включает кнопки, формы, карточки, навигацию и многое другое. Совместим с Figma Auto Layout.",
      priceRub: 2999,
      category: "Design Asset",
      status: "published",
      sales: 8,
      revenue: 22792,
    },
    {
      title: "React Hook для работы с API",
      description: "Готовый React хук для работы с REST API. Включает обработку ошибок, кэширование, оптимистичные обновления и TypeScript типы.",
      priceRub: 1499,
      category: "Code Snippet/Plugin",
      status: "published",
      sales: 23,
      revenue: 32777,
    },
    {
      title: "Гайд по монетизации SaaS",
      description: "Подробное руководство по монетизации SaaS продуктов. Стратегии ценообразования, метрики, кейсы успешных компаний и практические советы.",
      priceRub: 999,
      category: "E-book/Guide",
      status: "draft",
      sales: 0,
      revenue: 0,
    },
    {
      title: "Набор звуковых эффектов",
      description: "Коллекция из 50 профессиональных звуковых эффектов для видео и подкастов. WAV формат, высокое качество, без роялти.",
      priceRub: 799,
      category: "Audio/Preset",
      status: "published",
      sales: 12,
      revenue: 9118,
    },
  ];

  const createdProducts = [];

  for (const productData of testProducts) {
    try {
      // Check if product with same title exists
      const existing = app.findFirstRecordByFilter(
        productsCollection.name,
        "title = {:title} && owner = {:owner}",
        { title: productData.title, owner: mainUser.id }
      );
      createdProducts.push(existing);
    } catch (e) {
      // Product doesn't exist, create it
      const productRecord = new Record(productsCollection);
      productRecord.set("title", productData.title);
      productRecord.set("description", productData.description);
      productRecord.set("priceRub", productData.priceRub);
      productRecord.set("category", productData.category);
      productRecord.set("status", productData.status);
      productRecord.set("sales", productData.sales);
      productRecord.set("revenue", productData.revenue);
      productRecord.set("owner", mainUser.id);
      app.save(productRecord);
      createdProducts.push(productRecord);
    }
  }

  // Create test sales
  const testSales = [
    {
      product: createdProducts[0].id,
      customerEmail: "buyer1@example.com",
      amount: 1999,
      platformFee: 130,
      netAmount: 1869,
      owner: mainUser.id,
    },
    {
      product: createdProducts[0].id,
      customerEmail: "buyer2@example.com",
      amount: 1999,
      platformFee: 130,
      netAmount: 1869,
      owner: mainUser.id,
    },
    {
      product: createdProducts[1].id,
      customerEmail: "buyer3@example.com",
      amount: 2999,
      platformFee: 180,
      netAmount: 2819,
      owner: mainUser.id,
    },
    {
      product: createdProducts[2].id,
      customerEmail: "buyer4@example.com",
      amount: 1499,
      platformFee: 105,
      netAmount: 1394,
      owner: mainUser.id,
    },
    {
      product: createdProducts[4].id,
      customerEmail: "buyer5@example.com",
      amount: 799,
      platformFee: 70,
      netAmount: 729,
      owner: mainUser.id,
    },
  ];

  for (const saleData of testSales) {
    try {
      const saleRecord = new Record(salesCollection);
      saleRecord.set("product", saleData.product);
      saleRecord.set("customerEmail", saleData.customerEmail);
      saleRecord.set("amount", saleData.amount);
      saleRecord.set("platformFee", saleData.platformFee);
      saleRecord.set("netAmount", saleData.netAmount);
      saleRecord.set("owner", saleData.owner);
      app.save(saleRecord);
    } catch (e) {
      // Sale might already exist, skip
    }
  }

  // Create test promo codes
  const testPromos = [
    {
      code: "WELCOME10",
      discountPercent: 10,
      uses: 5,
      isActive: true,
      owner: mainUser.id,
    },
    {
      code: "SUMMER20",
      discountPercent: 20,
      uses: 2,
      isActive: true,
      owner: mainUser.id,
    },
    {
      code: "EXPIRED50",
      discountPercent: 50,
      uses: 0,
      isActive: false,
      owner: mainUser.id,
    },
  ];

  for (const promoData of testPromos) {
    try {
      // Check if promo exists
      app.findFirstRecordByFilter(
        promosCollection.name,
        "code = {:code} && owner = {:owner}",
        { code: promoData.code, owner: mainUser.id }
      );
    } catch (e) {
      // Promo doesn't exist, create it
      const promoRecord = new Record(promosCollection);
      promoRecord.set("code", promoData.code);
      promoRecord.set("discountPercent", promoData.discountPercent);
      promoRecord.set("uses", promoData.uses);
      promoRecord.set("isActive", promoData.isActive);
      promoRecord.set("owner", mainUser.id);
      app.save(promoRecord);
    }
  }

  // Create test payouts
  const testPayouts = [
    {
      amount: 5000,
      status: "completed",
      method: "Банковская карта",
      owner: mainUser.id,
    },
    {
      amount: 10000,
      status: "completed",
      method: "СБП",
      owner: mainUser.id,
    },
    {
      amount: 3000,
      status: "pending",
      method: "Банковская карта",
      owner: mainUser.id,
    },
  ];

  for (const payoutData of testPayouts) {
    try {
      const payoutRecord = new Record(payoutsCollection);
      payoutRecord.set("amount", payoutData.amount);
      payoutRecord.set("status", payoutData.status);
      payoutRecord.set("method", payoutData.method);
      payoutRecord.set("owner", payoutData.owner);
      app.save(payoutRecord);
    } catch (e) {
      // Payout might already exist, skip
    }
  }
}, (app) => {
  // Rollback: delete test data
  try {
    const usersCollection = app.findCollectionByNameOrId("users");
    const productsCollection = app.findCollectionByNameOrId("products");
    const salesCollection = app.findCollectionByNameOrId("sales");
    const promosCollection = app.findCollectionByNameOrId("promos");
    const payoutsCollection = app.findCollectionByNameOrId("payouts");

    // Delete test users and their related data
    const testEmails = ["test@cifra.ru", "demo@cifra.ru", "seller@cifra.ru"];
    
    for (const email of testEmails) {
      try {
        const user = app.findAuthRecordByEmail("users", email);
        
        // Delete user's products
        const products = arrayOf(new Record);
        app.recordQuery(productsCollection.name)
          .andWhere($dbx.hashExp({ owner: user.id }))
          .all(products);
        for (const product of products) {
          app.delete(product);
        }
        
        // Delete user's sales
        const sales = arrayOf(new Record);
        app.recordQuery(salesCollection.name)
          .andWhere($dbx.hashExp({ owner: user.id }))
          .all(sales);
        for (const sale of sales) {
          app.delete(sale);
        }
        
        // Delete user's promos
        const promos = arrayOf(new Record);
        app.recordQuery(promosCollection.name)
          .andWhere($dbx.hashExp({ owner: user.id }))
          .all(promos);
        for (const promo of promos) {
          app.delete(promo);
        }
        
        // Delete user's payouts
        const payouts = arrayOf(new Record);
        app.recordQuery(payoutsCollection.name)
          .andWhere($dbx.hashExp({ owner: user.id }))
          .all(payouts);
        for (const payout of payouts) {
          app.delete(payout);
        }
        
        // Delete user
        app.delete(user);
      } catch (e) {
        // User might not exist, skip
      }
    }
  } catch (e) {
    // Silent error
  }
});

