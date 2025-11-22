// PocketBase Collections Reference Schema
// This file contains reference schemas for manual collection creation
// For automatic creation, see: 1734900000_create_cifra_collections.js
// 
// NOTE: Collections are now created automatically via migration!
// This file is kept as reference only.

const collections = [
  {
    name: 'users',
    type: 'auth',
    schema: [
      {
        name: 'displayName',
        type: 'text',
        required: false,
        options: {}
      },
      {
        name: 'bio',
        type: 'text',
        required: false,
        options: {}
      },
      {
        name: 'avatarUrl',
        type: 'file',
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880, // 5MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'accentColor',
        type: 'text',
        required: false,
        options: {},
        defaultValue: '#8b5cf6'
      },
      {
        name: 'emailNotifications',
        type: 'bool',
        required: false,
        options: {},
        defaultValue: true
      }
    ],
    indexes: [
      'CREATE INDEX idx_users_email ON users (email)'
    ],
    options: {
      listRule: '@request.auth.id = id',
      viewRule: '@request.auth.id = id',
      createRule: '',
      updateRule: '@request.auth.id = id',
      deleteRule: '@request.auth.id = id',
      passwordAuth: {
        enabled: true,
        identityFields: ['email']
      }
    }
  },
  {
    name: 'products',
    type: 'base',
    schema: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 200
        }
      },
      {
        name: 'description',
        type: 'text',
        required: true,
        options: {
          min: 10
        }
      },
      {
        name: 'priceRub',
        type: 'number',
        required: true,
        options: {
          min: 0
        }
      },
      {
        name: 'category',
        type: 'select',
        required: true,
        options: {
          values: [
            'Notion Template',
            'Design Asset',
            'Code Snippet/Plugin',
            'E-book/Guide',
            'Audio/Preset',
            'Other'
          ]
        }
      },
      {
        name: 'coverImage',
        type: 'file',
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 10485760, // 10MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'productFiles',
        type: 'file',
        required: false,
        options: {
          maxSelect: 10,
          maxSize: 2147483648, // 2GB
          mimeTypes: ['*']
        }
      },
      {
        name: 'sales',
        type: 'number',
        required: false,
        options: {
          min: 0
        },
        defaultValue: 0
      },
      {
        name: 'revenue',
        type: 'number',
        required: false,
        options: {
          min: 0
        },
        defaultValue: 0
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          values: ['published', 'draft']
        },
        defaultValue: 'draft'
      },
      {
        name: 'owner',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      }
    ],
    indexes: [
      'CREATE INDEX idx_products_owner ON products (owner)',
      'CREATE INDEX idx_products_status ON products (status)',
      'CREATE INDEX idx_products_category ON products (category)'
    ],
    options: {
      listRule: "status = 'published' OR owner = @request.auth.id",
      viewRule: "status = 'published' OR owner = @request.auth.id",
      createRule: '@request.auth.id != ""',
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id'
    }
  },
  {
    name: 'sales',
    type: 'base',
    schema: [
      {
        name: 'product',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'products',
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: 'customerEmail',
        type: 'email',
        required: true,
        options: {}
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
        options: {
          min: 0
        }
      },
      {
        name: 'platformFee',
        type: 'number',
        required: true,
        options: {
          min: 0
        }
      },
      {
        name: 'netAmount',
        type: 'number',
        required: true,
        options: {
          min: 0
        }
      },
      {
        name: 'owner',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: false,
          maxSelect: 1
        }
      }
    ],
    indexes: [
      'CREATE INDEX idx_sales_owner ON sales (owner)',
      'CREATE INDEX idx_sales_product ON sales (product)',
      'CREATE INDEX idx_sales_date ON sales (created)'
    ],
    options: {
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: '', // Public for webhook payments
      updateRule: '', // Admin only
      deleteRule: '' // Admin only
    }
  },
  {
    name: 'promos',
    type: 'base',
    schema: [
      {
        name: 'code',
        type: 'text',
        required: true,
        unique: true,
        options: {
          min: 3,
          max: 50
        }
      },
      {
        name: 'discountPercent',
        type: 'number',
        required: true,
        options: {
          min: 0,
          max: 100
        }
      },
      {
        name: 'uses',
        type: 'number',
        required: false,
        options: {
          min: 0
        },
        defaultValue: 0
      },
      {
        name: 'isActive',
        type: 'bool',
        required: false,
        options: {},
        defaultValue: true
      },
      {
        name: 'owner',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: true,
          maxSelect: 1
        }
      }
    ],
    indexes: [
      'CREATE INDEX idx_promos_owner ON promos (owner)',
      'CREATE INDEX idx_promos_code ON promos (code)',
      'CREATE INDEX idx_promos_active ON promos (isActive)'
    ],
    options: {
      listRule: 'owner = @request.auth.id',
      viewRule: '', // Public for promo code validation
      createRule: '@request.auth.id != ""',
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id'
    }
  },
  {
    name: 'payouts',
    type: 'base',
    schema: [
      {
        name: 'amount',
        type: 'number',
        required: true,
        options: {
          min: 0
        }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          values: ['pending', 'completed', 'failed']
        },
        defaultValue: 'pending'
      },
      {
        name: 'method',
        type: 'text',
        required: false,
        options: {
          max: 100
        }
      },
      {
        name: 'owner',
        type: 'relation',
        required: true,
        options: {
          collectionId: 'users',
          cascadeDelete: false,
          maxSelect: 1
        }
      }
    ],
    indexes: [
      'CREATE INDEX idx_payouts_owner ON payouts (owner)',
      'CREATE INDEX idx_payouts_status ON payouts (status)',
      'CREATE INDEX idx_payouts_date ON payouts (created)'
    ],
    options: {
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '', // Admin only
      deleteRule: '' // Admin only
    }
  }
];

// Export for use in migration scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = collections;
}

