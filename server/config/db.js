import mongoose from 'mongoose';

// Initialize global in-memory database store
global.dbStore = {
  users: [],
  products: [
    {
      _id: '660a1a1a1a1a1a1a1a1a1001',
      name: 'Imperial Solitaire Gold Ring',
      sku: 'RG-IMP-101',
      description: 'A solid 24K gold maharaja signet ring featuring traditional filigree carvings, perfect for auspicious occasions.',
      price: 85000,
      category: 'Rings',
      purity: '24K',
      weight: 11.5,
      images: ['/images/ring.png'],
      stock: 12,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '660a1a1a1a1a1a1a1a1a1002',
      name: 'Royal Heritage Bridal Choker',
      sku: 'NK-HER-201',
      description: 'An intricate traditional 22K gold bridal choker necklace handcrafted by master goldsmiths in Mumbai.',
      price: 195000,
      category: 'Necklaces',
      purity: '22K',
      weight: 28.2,
      images: ['/images/necklace.png'],
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '660a1a1a1a1a1a1a1a1a1003',
      name: 'Divine Blossom Jhumka Set',
      sku: 'ER-DIV-301',
      description: 'A pair of traditional gold jhumka earrings featuring delicate floral motif carvings and dangling beads.',
      price: 125000,
      category: 'Earrings',
      purity: '22K',
      weight: 16.8,
      images: ['/images/earrings.png'],
      stock: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  orders: []
};

global.useInMemoryDB = false;

const chainable = (data) => {
  const promise = Promise.resolve(data);
  promise.sort = function(sortQuery) {
    if (!data || !Array.isArray(data)) return chainable(data);
    let sorted = [...data];
    const key = Object.keys(sortQuery)[0];
    const dir = sortQuery[key];
    sorted.sort((a, b) => {
      if (a[key] < b[key]) return -dir;
      if (a[key] > b[key]) return dir;
      return 0;
    });
    return chainable(sorted);
  };
  promise.populate = function(path) {
    if (!data) return chainable(data);
    const items = Array.isArray(data) ? data : [data];
    
    for (const item of items) {
      if (path === 'wishlist' && item.wishlist) {
        item.wishlist = item.wishlist.map(id => 
          global.dbStore.products.find(p => p._id.toString() === id.toString()) || id
        );
      }
      if (path === 'cart.product' && item.cart) {
        item.cart = item.cart.map(cartItem => ({
          ...cartItem,
          product: global.dbStore.products.find(p => p._id.toString() === (cartItem.product?._id || cartItem.product).toString()) || cartItem.product
        }));
      }
    }
    return chainable(data);
  };
  promise.select = function() {
    return chainable(data);
  };
  return promise;
};

// Hook into Mongoose compile model system to patch functions if needed
const originalModel = mongoose.model;
mongoose.model = function(name, schema) {
  const model = originalModel.apply(this, arguments);

  // Setup static overrides on model
  model.find = function(query) {
    if (!global.useInMemoryDB) return model.originalFind ? model.originalFind(query) : model.find(query);
    
    let data = global.dbStore[name.toLowerCase() + 's'] || [];
    if (query) {
      data = data.filter(item => {
        for (const key of Object.keys(query)) {
          if (key === '$or') {
            return query.$or.some(cond => {
              const k = Object.keys(cond)[0];
              const val = cond[k];
              if (val && val.$regex) {
                return new RegExp(val.$regex, 'i').test(item[k]);
              }
              return item[k] === val;
            });
          }
          if (key === 'price' || key === 'weight') {
            const range = query[key];
            if (range.$gte && item[key] < range.$gte) return false;
            if (range.$lte && item[key] > range.$lte) return false;
            continue;
          }
          const itemVal = item[key];
          const queryVal = query[key];
          if (itemVal && queryVal && typeof itemVal === 'object' && typeof queryVal === 'object') {
            if (itemVal.toString() !== queryVal.toString()) return false;
          } else if (itemVal !== queryVal) {
            return false;
          }
        }
        return true;
      });
    }
    return chainable(data);
  };

  model.findOne = function(query) {
    if (!global.useInMemoryDB) return model.originalFindOne ? model.originalFindOne(query) : model.findOne(query);
    
    const data = global.dbStore[name.toLowerCase() + 's'] || [];
    const found = data.find(item => {
      for (const key of Object.keys(query)) {
        const itemVal = item[key];
        const queryVal = query[key];
        if (itemVal && queryVal && typeof itemVal === 'object' && typeof queryVal === 'object') {
          if (itemVal.toString() !== queryVal.toString()) return false;
        } else if (itemVal !== queryVal) {
          return false;
        }
      }
      return true;
    });

    if (found && name === 'User') {
      found.matchPassword = async function(enteredPassword) {
        return enteredPassword === found.password;
      };
    }
    return chainable(found || null);
  };

  model.findById = function(id) {
    if (!global.useInMemoryDB) return model.originalFindById ? model.originalFindById(id) : model.findById(id);
    
    const data = global.dbStore[name.toLowerCase() + 's'] || [];
    const found = data.find(item => item._id.toString() === id.toString());
    
    if (found && name === 'User') {
      found.matchPassword = async function(enteredPassword) {
        return enteredPassword === found.password;
      };
    }
    return chainable(found || null);
  };

  model.create = function(obj) {
    if (!global.useInMemoryDB) return model.originalCreate ? model.originalCreate(obj) : model.create(obj);
    
    const colName = name.toLowerCase() + 's';
    const newDoc = new model(obj);
    const plainDoc = newDoc.toObject ? newDoc.toObject() : newDoc;
    
    if (!plainDoc._id) {
      plainDoc._id = new mongoose.Types.ObjectId().toString();
    }
    
    // Add save wrapper
    plainDoc.save = async function() {
      const idx = global.dbStore[colName].findIndex(item => item._id.toString() === plainDoc._id.toString());
      if (idx !== -1) {
        global.dbStore[colName][idx] = plainDoc;
      } else {
        global.dbStore[colName].push(plainDoc);
      }
      return plainDoc;
    };

    if (name === 'User') {
      plainDoc.wishlist = [];
      plainDoc.cart = [];
    }

    global.dbStore[colName].push(plainDoc);
    return Promise.resolve(plainDoc);
  };

  model.findByIdAndUpdate = function(id, update) {
    if (!global.useInMemoryDB) return model.originalFindByIdAndUpdate ? model.originalFindByIdAndUpdate(id, update) : model.findByIdAndUpdate(id, update);
    
    const colName = name.toLowerCase() + 's';
    const idx = global.dbStore[colName].findIndex(item => item._id.toString() === id.toString());
    if (idx !== -1) {
      const current = global.dbStore[colName][idx];
      const updated = { ...current, ...update.$set, ...update };
      delete updated.$set;
      delete updated.$inc;

      if (update.$inc) {
        for (const key of Object.keys(update.$inc)) {
          updated[key] = (updated[key] || 0) + update.$inc[key];
        }
      }
      global.dbStore[colName][idx] = updated;
      return chainable(updated);
    }
    return chainable(null);
  };

  model.deleteOne = function(query) {
    if (!global.useInMemoryDB) return model.originalDeleteOne ? model.originalDeleteOne(query) : model.deleteOne(query);
    
    const colName = name.toLowerCase() + 's';
    const idx = global.dbStore[colName].findIndex(item => {
      for (const key of Object.keys(query)) {
        if (item[key].toString() !== query[key].toString()) return false;
      }
      return true;
    });
    if (idx !== -1) {
      global.dbStore[colName].splice(idx, 1);
    }
    return Promise.resolve({ deletedCount: 1 });
  };

  model.bulkWrite = function(ops) {
    if (!global.useInMemoryDB) return model.originalBulkWrite ? model.originalBulkWrite(ops) : model.bulkWrite(ops);
    
    const colName = name.toLowerCase() + 's';
    let modifiedCount = 0;
    let upsertedCount = 0;

    for (const op of ops) {
      if (op.updateOne) {
        const { filter, update, upsert } = op.updateOne;
        const sku = filter.sku;
        const idx = global.dbStore[colName].findIndex(item => item.sku === sku);
        if (idx !== -1) {
          global.dbStore[colName][idx] = { ...global.dbStore[colName][idx], ...update.$set };
          modifiedCount++;
        } else if (upsert) {
          const newDoc = {
            _id: new mongoose.Types.ObjectId().toString(),
            ...update.$set,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          global.dbStore[colName].push(newDoc);
          upsertedCount++;
        }
      }
    }
    return Promise.resolve({ modifiedCount, upsertedCount });
  };

  // Add save prototype wrapper for model instances (e.g. const doc = new Product(); doc.save())
  model.prototype.save = async function() {
    if (!global.useInMemoryDB) {
      const originalSave = Object.getPrototypeOf(this).save;
      return originalSave ? originalSave.apply(this) : Promise.resolve(this);
    }
    
    const colName = name.toLowerCase() + 's';
    const doc = this.toObject ? this.toObject() : this;
    if (!doc._id) {
      doc._id = new mongoose.Types.ObjectId().toString();
    }
    
    const idx = global.dbStore[colName].findIndex(item => item._id.toString() === doc._id.toString());
    if (idx !== -1) {
      global.dbStore[colName][idx] = { ...global.dbStore[colName][idx], ...doc };
    } else {
      global.dbStore[colName].push(doc);
    }
    return doc;
  };

  return model;
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aryansh-gold', {
      serverSelectionTimeoutMS: 2000 // Short 2-second timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB not running. Enabling robust In-Memory Database Fallback mode.`);
    global.useInMemoryDB = true;
  }
};

export default connectDB;
