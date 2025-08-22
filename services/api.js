import { supabase } from '../lib/supabase';

// Dashboard API servisleri (değişiklik yok)
export const dashboardAPI = {
  async getDashboardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [
        { count: animalsCount },
        { count: feedsCount },
        recentTransactions,
        lowStockItems
      ] = await Promise.all([
        supabase.from('animals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('feed_inventory').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
        supabase.from('feed_inventory').select('*').eq('user_id', user.id).lt('quantity', 10).limit(5)
      ]);

      return {
        stats: {
          animalsCount: animalsCount || 0,
          feedsCount: feedsCount || 0,
        },
        recentTransactions: recentTransactions.data || [],
        lowStockItems: lowStockItems.data || [],
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  async getFinancialSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentMonth = new Date().toISOString().slice(0, 7);

      const [
        { data: income },
        { data: expenses }
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'income')
          .gte('date', `${currentMonth}-01`),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .gte('date', `${currentMonth}-01`)
      ]);

      const totalIncome = income?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;

      return {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
      };
    } catch (error) {
      console.error('Financial summary error:', error);
      throw error;
    }
  }
};

// Basitleştirilmiş Çiftlik API (farm_members olmadan)
export const farmAPI = {
  // Kullanıcının çiftlik bilgilerini getir (tek çiftlik)
  async getUserFarm() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('farm_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        return null; // No farm found
      }
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get user farm error:', error);
      throw error;
    }
  },

  // Çiftlik oluştur (basitleştirilmiş)
  async createFarm(farmData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already has a farm
      const existingFarm = await this.getUserFarm();
      if (existingFarm) {
        throw new Error('User already has a farm');
      }

      const { data, error } = await supabase
        .from('farm_info')
        .insert([{
          ...farmData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create farm error:', error);
      throw error;
    }
  },

  // Çiftlik güncelle
  async updateFarm(farmData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('farm_info')
        .update({ ...farmData, updated_at: new Date() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update farm error:', error);
      throw error;
    }
  },

  // Çiftlik sil
  async deleteFarm() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('farm_info')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete farm error:', error);
      throw error;
    }
  }
};

// Kullanıcı API (basitleştirilmiş)
export const userAPI = {
  async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [userResult, farmResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single(),
        farmAPI.getUserFarm()
      ]);

      if (userResult.error && userResult.error.code !== 'PGRST116') {
        throw userResult.error;
      }

      return {
        ...userResult.data,
        farm: farmResult
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  async updateUserProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
};

// Hayvan API (değişiklik yok - zaten user_id bazlı)
export const animalsAPI = {
  async getAnimals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get animals error:', error);
      throw error;
    }
  },

  async getAnimal(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get animal error:', error);
      throw error;
    }
  },

  async addAnimal(animalData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Hayvanı ekle
      const { data: animal, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Eğer purchase_price varsa, otomatik olarak transaction oluştur
      if (animalData.purchase_price && animalData.purchase_price > 0) {
        const transactionData = {
          type: 'expense',
          category: 'animal_purchase',
          amount: animalData.purchase_price,
          description: `${animalData.name} - ${animalData.tag_number} Hayvan Alımı`,
          date: animalData.purchase_date || new Date().toISOString().split('T')[0],
          animal_id: animal.id,
          user_id: user.id,
          is_automatic: true
        };

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (transactionError) {
          console.error('Transaction creation error:', transactionError);
          // Transaction oluşturulamazsa bile hayvan eklenmişse devam et
        }
      }

      return animal;
    } catch (error) {
      console.error('Add animal error:', error);
      throw error;
    }
  },

  async updateAnimal(id, animalData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('animals')
        .update(animalData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update animal error:', error);
      throw error;
    }
  },

  async deleteAnimal(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete related transactions first
      await supabase
        .from('transactions')
        .delete()
        .eq('animal_id', id);

      // Then delete animal
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete animal error:', error);
      throw error;
    }
  }
};

// Yem API (değişiklik yok - zaten user_id bazlı)
export const feedAPI = {
  async getFeeds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feed_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get feeds error:', error);
      throw error;
    }
  },

  async getFeed(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feed_inventory')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get feed error:', error);
      throw error;
    }
  },

  async addFeed(feedData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feed_inventory')
        .insert([{ ...feedData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add feed error:', error);
      throw error;
    }
  },

  async updateFeed(id, feedData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feed_inventory')
        .update(feedData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update feed error:', error);
      throw error;
    }
  },

  async deleteFeed(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete related transactions first
      await supabase
        .from('transactions')
        .delete()
        .eq('feed_id', id);

      // Then delete feed
      const { error } = await supabase
        .from('feed_inventory')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete feed error:', error);
      throw error;
    }
  }
};

// Finansal API (değişiklik yok - zaten user_id bazlı)
export const financialAPI = {
  async getTransactions(filters = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Debug: Son 5 transaction'ı kontrol et
      const { data: debugData } = await supabase
        .from('transactions')
        .select('id, category, animal_id, created_at, is_automatic')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('DEBUG - Son 5 transaction:', debugData);

      let query = supabase
        .from('transactions')
        .select(`
          id, type, category, amount, description, date, created_at, animal_id, feed_id,
          animals:animal_id(tag_number, name, species),
          feed_inventory:feed_id(feed_name, feed_type)
        `)
        .eq('user_id', user.id);

      // Apply filters
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.startDate) query = query.gte('date', filters.startDate);
      if (filters.endDate) query = query.lte('date', filters.endDate);
      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  async getTransaction(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *, 
          animals(*),
          feed_inventory(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  },

  async addTransaction(transactionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
          is_automatic: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add transaction error:', error);
      throw error;
    }
  },

  async updateTransaction(id, transactionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  },

  async recordTransaction(transactionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
          is_automatic: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Record transaction error:', error);
      throw error;
    }
  },

  async recordAnimalSale(animalId, saleData) {
    try {
      console.log('recordAnimalSale called with:', { animalId, saleData });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create transaction record
      console.log('Creating transaction record...');
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: 'income',
          category: 'animal_sale',
          amount: saleData.amount,
          description: saleData.description || '',
          date: saleData.date,
          animal_id: animalId,
          user_id: user.id,
          is_automatic: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Transaction insert error:', error);
        throw error;
      }

      console.log('Transaction created successfully:', data);

      // Update animal status to sold
      console.log('Updating animal status to sold...');
      const { error: updateError } = await supabase
        .from('animals')
        .update({ status: 'sold' })
        .eq('id', animalId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Animal update error:', updateError);
        throw updateError;
      }

      console.log('Animal status updated successfully');
      return data;
    } catch (error) {
      console.error('Record animal sale error:', error);
      throw error;
    }
  },

  async getFinancialReport(startDate, endDate) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      const income = data?.filter(t => t.type === 'income') || [];
      const expenses = data?.filter(t => t.type === 'expense') || [];

      const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalExpense = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalProfit = totalIncome - totalExpense;

      const categories = {};
      data?.forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
          categories[category] = { income: 0, expense: 0, count: 0 };
        }
        
        if (transaction.type === 'income') {
          categories[category].income += parseFloat(transaction.amount);
        } else if (transaction.type === 'expense') {
          categories[category].expense += parseFloat(transaction.amount);
        }
        categories[category].count += 1;
      });

      return {
        totalIncome,
        totalExpense,
        totalProfit,
        categories,
        transactions: data || []
      };
    } catch (error) {
      console.error('Get financial report error:', error);
      throw error;
    }
  },

  async getAnimalProfitReport() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Satılmış hayvanları bul
      const { data: soldAnimals, error: animalsError } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'sold');

      if (animalsError) throw animalsError;

      if (!soldAnimals || soldAnimals.length === 0) {
        return [];
      }

      // Her satılmış hayvan için kar/zarar hesapla
      const profitReports = await Promise.all(soldAnimals.map(async (animal) => {
        // Hayvan satış gelirini bul
        const { data: saleTransaction } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('animal_id', animal.id)
          .eq('type', 'income')
          .eq('category', 'animal_sale')
          .single();

        const purchasePrice = animal.purchase_price || 0;
        const salePrice = saleTransaction?.amount || 0;
        const profitLoss = salePrice - purchasePrice;

        return {
          id: animal.id,
          animals: animal,
          purchase_price: purchasePrice,
          sale_price: salePrice,
          profit_loss: profitLoss,
          sale_date: saleTransaction?.date || null
        };
      }));

      return profitReports.filter(report => report.sale_date !== null);
    } catch (error) {
      console.error('Get animal profit report error:', error);
      throw error;
    }
  }
};