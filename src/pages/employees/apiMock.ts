import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid'; // need to generate uuid? maybe not, supabase does it

export const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : input.toString();
  
  if (!urlStr.startsWith('/api/')) {
    return fetch(input, init);
  }

  const method = init?.method || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : null;
  const urlObj = new URL(urlStr, window.location.origin);
  const path = urlObj.pathname; 
  const searchParams = urlObj.searchParams;
  
  const segments = path.split('/').filter(Boolean);
  
  const createResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    // ----------------------------------------------------------------------
    // /api/employees
    // ----------------------------------------------------------------------
    if (path === '/api/employees') {
      if (method === 'GET') {
        const { data } = await supabase.from('employees').select('*');
        return createResponse(data || []);
      }
      if (method === 'POST') {
        const { data, error } = await supabase.from('employees').insert([body]).select().single();
        if (error) console.error(error);
        return createResponse(data || {});
      }
    }
    
    if (path.startsWith('/api/employees/')) {
      const id = segments[2];
      if (method === 'GET') {
        const { data } = await supabase.from('employees').select('*').eq('id', id).single();
        return createResponse(data || {});
      }
      if (method === 'PUT') {
        const { data } = await supabase.from('employees').update(body).eq('id', id).select().single();
        return createResponse(data || {});
      }
      if (method === 'DELETE') {
        await supabase.from('employees').delete().eq('id', id);
        return createResponse({ success: true });
      }
    }

    // ----------------------------------------------------------------------
    // /api/salary
    // ----------------------------------------------------------------------
    if (path === '/api/salary') {
      if (method === 'GET') {
        const { data } = await supabase.from('salary_slips').select('*, employee:employees(*)');
        return createResponse(data || []);
      }
      if (method === 'POST') {
        const { data } = await supabase.from('salary_slips').insert([body]).select().single();
        return createResponse(data || {});
      }
    }

    // ----------------------------------------------------------------------
    // /api/permissions
    // ----------------------------------------------------------------------
    if (path === '/api/permissions') {
      if (method === 'GET') {
        const employeeId = searchParams.get('employeeId');
        let query = supabase.from('permissions').select('*, employee:employees(*)');
        if (employeeId) query = query.eq('employeeId', employeeId);
        const { data } = await query;
        return createResponse(data || []);
      }
      if (method === 'POST') {
        const { data } = await supabase.from('permissions').insert([body]).select().single();
        return createResponse(data || {});
      }
    }
    
    if (path.startsWith('/api/permissions/')) {
      const id = segments[2];
      if (method === 'PUT') {
        const { data } = await supabase.from('permissions').update(body).eq('id', id).select().single();
        return createResponse(data || {});
      }
    }

    // ----------------------------------------------------------------------
    // /api/advanced/leaves
    // ----------------------------------------------------------------------
    if (path === '/api/advanced/leaves') {
      if (method === 'GET') {
        const { data } = await supabase.from('leave_requests').select('*, employee:employees(*)');
        return createResponse(data || []);
      }
      if (method === 'POST') {
        const { data } = await supabase.from('leave_requests').insert([body]).select().single();
        return createResponse(data || {});
      }
    }

    if (path.startsWith('/api/advanced/leaves/')) {
      const id = segments[3];
      // if it's PUT, it updates a specific leave request
      if (method === 'PUT') {
        const { data } = await supabase.from('leave_requests').update(body).eq('id', id).select().single();
        return createResponse(data || {});
      }
      // if it's GET, maybe it gets leaves by employeeId?
      if (method === 'GET') {
        const { data } = await supabase.from('leave_requests').select('*, employee:employees(*)').eq('employeeId', id);
        return createResponse(data || []);
      }
    }

    // ----------------------------------------------------------------------
    // /api/attendance
    // ----------------------------------------------------------------------
    if (path === '/api/attendance') {
      if (method === 'GET') {
        const { data } = await supabase.from('attendance').select('*, employee:employees(*)');
        return createResponse(data || []);
      }
      if (method === 'POST') {
        const { data } = await supabase.from('attendance').insert([body]).select().single();
        return createResponse(data || {});
      }
    }

    // ----------------------------------------------------------------------
    // Employee Details Advanced
    // ----------------------------------------------------------------------
    if (path === '/api/advanced/assets') {
      if (method === 'POST') {
        const { data } = await supabase.from('assets').insert([body]).select().single();
        return createResponse(data || {});
      }
    }
    if (path.startsWith('/api/advanced/assets/')) {
      if (method === 'GET') {
        const { data } = await supabase.from('assets').select('*').eq('employeeId', segments[3]);
        return createResponse(data || []);
      }
    }
    
    if (path === '/api/advanced/performance') {
      if (method === 'POST') {
        const { data } = await supabase.from('performance_reviews').insert([body]).select().single();
        return createResponse(data || {});
      }
    }
    if (path.startsWith('/api/advanced/performance/')) {
      if (method === 'GET') {
        const { data } = await supabase.from('performance_reviews').select('*').eq('employeeId', segments[3]);
        return createResponse(data || []);
      }
    }
    
    if (path === '/api/advanced/documents') {
      if (method === 'POST') {
        const { data } = await supabase.from('documents').insert([body]).select().single();
        return createResponse(data || {});
      }
    }
    if (path.startsWith('/api/advanced/documents/')) {
      if (method === 'GET') {
        const { data } = await supabase.from('documents').select('*').eq('employeeId', segments[3]);
        return createResponse(data || []);
      }
    }

  } catch (error) {
    console.error('Mock API Error:', error);
    return createResponse({ error: 'Internal Server Error' }, 500);
  }

  return createResponse({ error: 'Not Found' }, 404);
};
