import { supabase } from '../lib/supabase';

// Dashboard API servisleri
export const dashboardAPI = {
  // Genel istatistikleri getir
  async getDashboardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Paralel API çağrıları
      const [
        { count: animalsCount },
        { count: feedsCount },
        { count: tasksCount },
        { count: pendingTasksCount },
        recentTransactions,
        lowStockItems
      ] = await Promise.all([
        supabase.from('animals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('feed_inventory').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
        supabase.from('inventory').select('*').eq('user_id', user.id).filter('quantity', 'lte', 'min_threshold').limit(5)
      ]);

      return {
        stats: {
          animalsCount: animalsCount || 0,
          feedsCount: feedsCount || 0,
          tasksCount: tasksCount || 0,
          pendingTasksCount: pendingTasksCount || 0,
        },
        recentTransactions: recentTransactions.data || [],
        lowStockItems: lowStockItems.data || [],
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  // Finansal özet getir
  async getFinancialSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

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
  },

  // Yaklaşan görevleri getir
  async getUpcomingTasks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7); // Önümüzdeki 7 gün

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lte('due_date', tomorrow.toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Upcoming tasks error:', error);
      throw error;
    }
  }
};

// Kullanıcı API servisleri
export const userAPI = {
  // Kullanıcı profilini getir
  async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('name, farm_name')
        .eq('id', user.id)
        .single();

      // Profil bulunamazsa hata vermemeli, sadece null dönebilir.
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },
};

// Hayvan API servisleri
export const animalsAPI = {
  // Tüm hayvanları getir
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

  // Hayvan ekle
  async addAnimal(animalData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add animal error:', error);
      throw error;
    }
  },

  // Hayvan güncelle
  async updateAnimal(id, animalData) {
    try {
      const { data, error } = await supabase
        .from('animals')
        .update(animalData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update animal error:', error);
      throw error;
    }
  },

  // Hayvan sil
  async deleteAnimal(id) {
    try {
      // Önce bu hayvana ait işlemleri sil
      await supabase
        .from('transactions')
        .delete()
        .eq('animal_id', id);

      // Sonra hayvanı sil
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete animal error:', error);
      throw error;
    }
  }
};

// Finansal İşlemler API
export const financialAPI = {
  // Tüm işlemleri getir
  async getTransactions(filters = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('getTransactions called with filters:', filters);
      console.log('User ID:', user.id);

      let query = supabase
        .from('transactions')
        .select(`
          *,
          animals:animal_id(tag_number, name, species)
        `)
        .eq('user_id', user.id);

      // Filtreleri uygula
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Query result:', data);
      return data || [];
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  // Hayvan satışı kaydet (sadece transaction oluştur, status güncellemesi trigger'da)
  async recordAnimalSale(animalId, saleData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const transactionData = {
        user_id: user.id,
        type: 'income',
        category: 'animal_sale',
        amount: saleData.amount,
        description: saleData.description || 'Hayvan satışı',
        date: saleData.date,
        animal_id: animalId,
        is_automatic: false
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Record animal sale error:', error);
      throw error;
    }
  },

  // Genel işlem kaydet
  async recordTransaction(transactionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fullTransactionData = {
        ...transactionData,
        user_id: user.id,
        is_automatic: false
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([fullTransactionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Record transaction error:', error);
      throw error;
    }
  },

  // Finansal rapor getir
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

      // Verileri kategorilere göre grupla
      const income = data?.filter(t => t.type === 'income') || [];
      const expenses = data?.filter(t => t.type === 'expense') || [];

      const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalExpense = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalProfit = totalIncome - totalExpense;

      // Kategori bazında gruplandırma - rapor ekranına uygun format
      const categories = {};
      
      // Tüm işlemleri kategorilere göre grupla
      data?.forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
          categories[category] = {
            income: 0,
            expense: 0,
            count: 0
          };
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

  // Hayvan kâr/zarar raporu getir
  async getAnimalProfitReport() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Satılan hayvanların kâr/zarar bilgilerini getir
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          animals:animal_id(
            id,
            tag_number,
            name,
            species,
            breed,
            purchase_price,
            purchase_date,
            sold_price,
            sold_date
          )
        `)
        .eq('user_id', user.id)
        .eq('category', 'animal_sale')
        .not('animals', 'is', null)
        .order('date', { ascending: false });

      if (error) throw error;

      // Kâr/zarar hesaplamalı veri döndür
      const profitReports = data?.map(transaction => {
        const animal = transaction.animals;
        const salePrice = parseFloat(transaction.amount);
        const purchasePrice = parseFloat(animal?.purchase_price || 0);
        const profitLoss = salePrice - purchasePrice;

        return {
          id: transaction.id,
          animal_id: animal?.id,
          animals: animal,
          purchase_price: purchasePrice,
          sale_price: salePrice,
          profit_loss: profitLoss,
          sale_date: transaction.date,
          purchase_date: animal?.purchase_date
        };
      }) || [];

      return profitReports;
    } catch (error) {
      console.error('Get animal profit report error:', error);
      throw error;
    }
  }
};

// Yem API servisleri
export const feedAPI = {
  // Tüm yemleri getir
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

  // Yem ekle
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

  // Yem güncelle
  async updateFeed(id, feedData) {
    try {
      const { data, error } = await supabase
        .from('feed_inventory')
        .update(feedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update feed error:', error);
      throw error;
    }
  },

  // Yem sil
  async deleteFeed(id) {
    try {
      // Önce bu yeme ait işlemleri sil
      await supabase
        .from('transactions')
        .delete()
        .eq('feed_id', id);

      // Sonra yemi sil
      const { error } = await supabase
        .from('feed_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete feed error:', error);
      throw error;
    }
  },

  // Yem istatistikleri getir
  async getFeedStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feed_inventory')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        totalFeeds: data?.length || 0,
        totalQuantity: data?.reduce((sum, feed) => sum + parseFloat(feed.quantity || 0), 0) || 0,
        totalValue: data?.reduce((sum, feed) => sum + parseFloat(feed.purchase_price || 0), 0) || 0,
      };

      return stats;
    } catch (error) {
      console.error('Get feed stats error:', error);
      throw error;
    }
  }
};

// Yem tüketim API servisleri
export const feedConsumptionAPI = {
  // Tüketim ayarlarını getir
  async getConsumptionSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('animal_feed_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('species', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get consumption settings error:', error);
      throw error;
    }
  },

  // Tüketim ayarını güncelle veya oluştur
  async updateConsumptionSetting(settingData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Önce mevcut kaydı kontrol et
      const { data: existingData } = await supabase
        .from('animal_feed_settings')
        .select('id')
        .eq('user_id', user.id)
        .eq('species', settingData.species)
        .eq('feed_type', settingData.feed_type)
        .single();

      let result;
      if (existingData) {
        // Mevcut kayıt varsa güncelle
        const { data, error } = await supabase
          .from('animal_feed_settings')
          .update({
            daily_consumption_per_animal: settingData.daily_consumption_per_animal,
            auto_deduct_enabled: settingData.auto_deduct_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Yeni kayıt oluştur
        const { data, error } = await supabase
          .from('animal_feed_settings')
          .insert([{ 
            ...settingData, 
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Update consumption setting error:', error);
      throw error;
    }
  },

  // Günlük tüketim kayıtlarını getir
  async getDailyConsumption(startDate, endDate) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('daily_feed_consumption')
        .select(`
          *,
          feed_inventory (
            feed_name,
            feed_type,
            unit,
            brand
          )
        `)
        .eq('user_id', user.id)
        .order('consumption_date', { ascending: false });

      if (startDate) {
        query = query.gte('consumption_date', startDate);
      }
      if (endDate) {
        query = query.lte('consumption_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get daily consumption error:', error);
      throw error;
    }
  },

  // Manuel tüketim kaydı ekle
  async addManualConsumption(consumptionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Supabase fonksiyonunu çağır
      const { data, error } = await supabase.rpc('add_manual_feed_consumption', {
        p_feed_id: consumptionData.feed_id,
        p_consumption_amount: consumptionData.total_consumption,
        p_animal_count: consumptionData.total_animals_count || 0,
        p_notes: consumptionData.notes || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add manual consumption error:', error);
      throw error;
    }
  },

  // Otomatik günlük tüketimi işle
  async processDailyConsumption() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Otomatik tüketim işleme fonksiyonunu çağır
      const { data, error } = await supabase.rpc('process_daily_feed_consumption');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Process daily consumption error:', error);
      throw error;
    }
  },

  // Tüketim özetini getir
  async getConsumptionSummary(startDate, endDate) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('feed_consumption_summary')
        .select('*')
        .eq('user_id', user.id)
        .order('consumption_date', { ascending: false });

      if (startDate) {
        query = query.gte('consumption_date', startDate);
      }
      if (endDate) {
        query = query.lte('consumption_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get consumption summary error:', error);
      throw error;
    }
  },

  // Hayvan türüne göre aktif hayvan sayısını getir
  async getAnimalCountBySpecies() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('animals')
        .select('species')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      // Türlere göre say
      const counts = {};
      data?.forEach(animal => {
        counts[animal.species] = (counts[animal.species] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Get animal count by species error:', error);
      throw error;
    }
  },

  // Yem stok uyarılarını getir
  async getFeedStockAlerts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('feed_inventory')
        .select('*')
        .eq('user_id', user.id)
        .filter('quantity', 'lte', 'min_stock_level')
        .order('quantity', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get feed stock alerts error:', error);
      throw error;
    }
  }
}; 