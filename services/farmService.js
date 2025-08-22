import { supabase } from '../lib/supabase';

// Alternative farm creation service using Supabase RPC or direct SQL
export const farmService = {
  // Create farm with RLS bypass using service role (only for initial farm creation)
  async createInitialFarm(farmData, userId) {
    try {
      // Call a Supabase Edge Function or RPC function that has elevated privileges
      const { data, error } = await supabase.rpc('create_initial_farm', {
        p_user_id: userId,
        p_farm_name: farmData.farm_name,
        p_farm_type: farmData.farm_type,
        p_owner_name: farmData.owner_name,
        p_phone: farmData.phone,
        p_email: farmData.email,
        p_city: farmData.city,
        p_address: farmData.address,
        p_established_date: farmData.established_date,
        p_total_area: farmData.total_area,
        p_livestock_capacity: farmData.livestock_capacity,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create initial farm error:', error);
      
      // Fallback to regular insert if RPC doesn't exist
      return this.createFarmWithRetry(farmData, userId);
    }
  },

  // Retry logic for farm creation
  async createFarmWithRetry(farmData, userId, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        // First ensure user exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .upsert([{
            id: userId,
            name: farmData.owner_name,
            email: farmData.email,
          }], {
            onConflict: 'id',
            ignoreDuplicates: true,
          });

        // Try to create farm
        const { data: farm, error: farmError } = await supabase
          .from('farm_info')
          .insert([{
            ...farmData,
            user_id: userId,
          }])
          .select()
          .single();

        if (!farmError) {
          // Success - farm created (no farm_members table anymore)
          return farm;
        }

        // If RLS error, wait and retry
        if (farmError.code === '42501' && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }

        throw farmError;
      } catch (error) {
        if (i === retries - 1) throw error;
      }
    }
  },
};