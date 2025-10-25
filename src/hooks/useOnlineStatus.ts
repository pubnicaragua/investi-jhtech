import { useEffect } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../supabase';

export function useOnlineStatus(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    
    supabase.rpc('update_user_online_status', {
      p_user_id: userId,
      p_is_online: true
    });
    
    const subscription = AppState.addEventListener('change', (state) => {
      supabase.rpc('update_user_online_status', {
        p_user_id: userId,
        p_is_online: state === 'active'
      });
    });
    
    return () => {
      subscription.remove();
      supabase.rpc('update_user_online_status', {
        p_user_id: userId,
        p_is_online: false
      });
    };
  }, [userId]);
}