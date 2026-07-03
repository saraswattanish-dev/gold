import { supabase } from '../config/supabase.js';

// Normalizes document IDs and properties between MongoDB (_id, camelCase) and Supabase/PostgreSQL (id, snake_case)
const normalize = (doc) => {
  if (!doc) return null;
  const normalized = { ...doc };
  if (normalized.id && !normalized._id) {
    normalized._id = normalized.id.toString();
  }
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id.toString();
  }
  
  // Map snake_case columns from Supabase to camelCase for frontend compatibility
  if (normalized.shipping_address && !normalized.shippingAddress) {
    normalized.shippingAddress = normalized.shipping_address;
  }
  if (normalized.order_status && !normalized.orderStatus) {
    normalized.orderStatus = normalized.order_status;
  }
  if (normalized.payment_method && !normalized.paymentMethod) {
    normalized.paymentMethod = normalized.payment_method;
  }
  if (normalized.payment_status && !normalized.paymentStatus) {
    normalized.paymentStatus = normalized.payment_status;
  }
  if (normalized.payment_details && !normalized.paymentDetails) {
    normalized.paymentDetails = normalized.payment_details;
  }
  if (normalized.total_amount && !normalized.totalAmount) {
    normalized.totalAmount = normalized.total_amount;
  }
  if (normalized.paid_at && !normalized.paidAt) {
    normalized.paidAt = normalized.paid_at;
  }
  if (normalized.shipped_at && !normalized.shippedAt) {
    normalized.shippedAt = normalized.shipped_at;
  }
  if (normalized.delivered_at && !normalized.deliveredAt) {
    normalized.deliveredAt = normalized.delivered_at;
  }
  if (normalized.created_at && !normalized.createdAt) {
    normalized.createdAt = normalized.created_at;
  }
  if (normalized.updated_at && !normalized.updatedAt) {
    normalized.updatedAt = normalized.updated_at;
  }
  if (normalized.user_id && !normalized.user) {
    normalized.user = normalized.user_id;
  }

  // Normalize nested items (e.g. for cart, wishlist, or orders)
  if (Array.isArray(normalized.items)) {
    normalized.items = normalized.items.map(item => normalize(item));
  }
  return normalized;
};

const normalizeList = (list) => {
  if (!list) return [];
  return list.map(doc => normalize(doc));
};

// Database Service Interface
const dbService = {
  // --- USERS ---
  findUserByEmail: async (email) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const user = global.dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return normalize(user);
    }
  },

  findUserById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const user = global.dbStore.users.find(u => u._id.toString() === id.toString());
      return normalize(user);
    }
  },

  createUser: async (userData) => {
    if (supabase) {
      const payload = {
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role || 'user',
        wishlist: userData.wishlist || [],
        cart: userData.cart || []
      };

      if (userData.id) {
        payload.id = userData.id;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const newUser = {
        _id: userData.id || new Date().getTime().toString(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password,
        role: userData.role || 'user',
        wishlist: userData.wishlist || [],
        cart: userData.cart || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.dbStore.users.push(newUser);
      return normalize(newUser);
    }
  },

  updateUser: async (id, updateData) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const idx = global.dbStore.users.findIndex(u => u._id.toString() === id.toString());
      if (idx !== -1) {
        global.dbStore.users[idx] = {
          ...global.dbStore.users[idx],
          ...updateData,
          updatedAt: new Date()
        };
        return normalize(global.dbStore.users[idx]);
      }
      return null;
    }
  },

  // --- PRODUCTS ---
  findProducts: async (filters = {}) => {
    if (supabase) {
      let query = supabase.from('products').select('*');

      if (filters.keyword) {
        query = query.or(`name.ilike.%${filters.keyword}%,sku.ilike.%${filters.keyword}%`);
      }
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }
      if (filters.purity && filters.purity !== 'All') {
        query = query.eq('purity', filters.purity);
      }
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.minWeight) query = query.gte('weight', filters.minWeight);
      if (filters.maxWeight) query = query.lte('weight', filters.maxWeight);

      // Sorting
      if (filters.sort) {
        if (filters.sort === 'priceAsc') query = query.order('price', { ascending: true });
        else if (filters.sort === 'priceDesc') query = query.order('price', { ascending: false });
        else if (filters.sort === 'weightAsc') query = query.order('weight', { ascending: true });
        else if (filters.sort === 'weightDesc') query = query.order('weight', { ascending: false });
        else if (filters.sort === 'oldest') query = query.order('created_at', { ascending: true });
        else query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return normalizeList(data);
    } else {
      let list = [...global.dbStore.products];

      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(kw) || p.sku.toLowerCase().includes(kw));
      }
      if (filters.category && filters.category !== 'All') {
        list = list.filter(p => p.category === filters.category);
      }
      if (filters.purity && filters.purity !== 'All') {
        list = list.filter(p => p.purity === filters.purity);
      }
      if (filters.minPrice) list = list.filter(p => p.price >= Number(filters.minPrice));
      if (filters.maxPrice) list = list.filter(p => p.price <= Number(filters.maxPrice));
      if (filters.minWeight) list = list.filter(p => p.weight >= Number(filters.minWeight));
      if (filters.maxWeight) list = list.filter(p => p.weight <= Number(filters.maxWeight));

      // Sorting
      if (filters.sort) {
        if (filters.sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
        else if (filters.sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
        else if (filters.sort === 'weightAsc') list.sort((a, b) => a.weight - b.weight);
        else if (filters.sort === 'weightDesc') list.sort((a, b) => b.weight - a.weight);
        else if (filters.sort === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return normalizeList(list);
    }
  },

  findProductById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const prod = global.dbStore.products.find(p => p._id.toString() === id.toString());
      return normalize(prod);
    }
  },

  findProductBySku: async (sku) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const prod = global.dbStore.products.find(p => p.sku === sku);
      return normalize(prod);
    }
  },

  createProduct: async (productData) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const newProd = {
        _id: new Date().getTime().toString(),
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.dbStore.products.push(newProd);
      return normalize(newProd);
    }
  },

  updateProduct: async (id, productData) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const idx = global.dbStore.products.findIndex(p => p._id.toString() === id.toString());
      if (idx !== -1) {
        global.dbStore.products[idx] = {
          ...global.dbStore.products[idx],
          ...productData,
          updatedAt: new Date()
        };
        return normalize(global.dbStore.products[idx]);
      }
      return null;
    }
  },

  deleteProduct: async (id) => {
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    } else {
      const idx = global.dbStore.products.findIndex(p => p._id.toString() === id.toString());
      if (idx !== -1) {
        global.dbStore.products.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  bulkUpsertProducts: async (productsList) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .upsert(productsList, { onConflict: 'sku' })
        .select();

      if (error) throw new Error(error.message);
      return normalizeList(data);
    } else {
      let modifiedCount = 0;
      let insertedCount = 0;
      const results = [];

      for (const p of productsList) {
        const idx = global.dbStore.products.findIndex(item => item.sku === p.sku);
        if (idx !== -1) {
          global.dbStore.products[idx] = {
            ...global.dbStore.products[idx],
            ...p,
            updatedAt: new Date()
          };
          results.push(global.dbStore.products[idx]);
          modifiedCount++;
        } else {
          const newDoc = {
            _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 4),
            ...p,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          global.dbStore.products.push(newDoc);
          results.push(newDoc);
          insertedCount++;
        }
      }
      return normalizeList(results);
    }
  },

  // --- ORDERS ---
  createOrder: async (orderData) => {
    if (supabase) {
      const payload = {
        user_id: orderData.user_id || orderData.user,
        items: orderData.items,
        shipping_address: orderData.shippingAddress || orderData.shipping_address,
        payment_method: orderData.paymentMethod || 'Razorpay',
        payment_status: orderData.paymentStatus || 'Pending',
        payment_details: orderData.paymentDetails || {},
        order_status: orderData.orderStatus || 'Pending',
        total_amount: orderData.totalAmount || orderData.total_amount,
        paid_at: orderData.paidAt || null,
        shipped_at: orderData.shippedAt || null,
        delivered_at: orderData.deliveredAt || null
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const newOrder = {
        _id: new Date().getTime().toString(),
        user: orderData.user_id || orderData.user,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress || orderData.shipping_address,
        paymentMethod: orderData.paymentMethod || 'Razorpay',
        paymentStatus: orderData.paymentStatus || 'Pending',
        paymentDetails: orderData.paymentDetails || {},
        orderStatus: orderData.orderStatus || 'Pending',
        totalAmount: orderData.totalAmount || orderData.total_amount,
        paidAt: orderData.paidAt || null,
        shippedAt: orderData.shippedAt || null,
        deliveredAt: orderData.deliveredAt || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.dbStore.orders.push(newOrder);
      return normalize(newOrder);
    }
  },

  findOrders: async (filters = {}) => {
    if (supabase) {
      let query = supabase
        .from('orders')
        .select('*, user:users(name, email)');

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return normalizeList(data);
    } else {
      let list = [...global.dbStore.orders];
      if (filters.user_id) {
        list = list.filter(o => o.user.toString() === filters.user_id.toString());
      }
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Populate user info from users store
      const populated = list.map(order => {
        const userObj = global.dbStore.users.find(u => u._id.toString() === order.user.toString());
        return {
          ...order,
          user: userObj ? { name: userObj.name, email: userObj.email } : null
        };
      });

      return normalizeList(populated);
    }
  },

  findOrderById: async (id) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, user:users(name, email)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const order = global.dbStore.orders.find(o => o._id.toString() === id.toString());
      if (order) {
        const userObj = global.dbStore.users.find(u => u._id.toString() === order.user.toString());
        return normalize({
          ...order,
          user: userObj ? { name: userObj.name, email: userObj.email } : null
        });
      }
      return null;
    }
  },

  updateOrder: async (id, updateData) => {
    if (supabase) {
      // Map properties between MongoDB standard and Supabase column names
      const payload = {};
      if (updateData.orderStatus !== undefined) payload.order_status = updateData.orderStatus;
      if (updateData.paymentStatus !== undefined) payload.payment_status = updateData.paymentStatus;
      if (updateData.paymentDetails !== undefined) payload.payment_details = updateData.paymentDetails;
      if (updateData.paidAt !== undefined) payload.paid_at = updateData.paidAt;
      if (updateData.shippedAt !== undefined) payload.shipped_at = updateData.shippedAt;
      if (updateData.deliveredAt !== undefined) payload.delivered_at = updateData.deliveredAt;

      const { data, error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return normalize(data);
    } else {
      const idx = global.dbStore.orders.findIndex(o => o._id.toString() === id.toString());
      if (idx !== -1) {
        global.dbStore.orders[idx] = {
          ...global.dbStore.orders[idx],
          ...updateData,
          updatedAt: new Date()
        };
        return normalize(global.dbStore.orders[idx]);
      }
      return null;
    }
  }
};

export default dbService;
