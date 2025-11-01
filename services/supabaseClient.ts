import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const errorHTML = `
      <div style="background-color: #1e1b4b; color: #e2e8f0; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; text-align: center;">
        <div style="max-width: 600px;">
          <h1 style="font-size: 2rem; font-weight: bold; color: #c4b5fd; margin-bottom: 1rem;">Venti Configuration Error</h1>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #cbd5e1; margin-bottom: 1.5rem;">The application cannot connect to its backend services. This is likely due to missing environment variables.</p>
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 0.5rem; text-align: left; font-family: monospace; line-height: 1.5; font-size: 0.875rem;">
            <p style="margin: 0;">Please ensure the following environment variables are set:</p>
            <ul style="margin: 0.5rem 0 0 1rem; padding: 0; list-style-type: disc;">
              <li><strong>SUPABASE_URL</strong>: Your Supabase project URL.</li>
              <li><strong>SUPABASE_ANON_KEY</strong>: Your Supabase project anon key.</li>
            </ul>
          </div>
          <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #94a3b8;">If you are running this project locally, you may need to create a configuration file (e.g., .env) for these variables.</p>
        </div>
      </div>
    `;
    document.body.innerHTML = errorHTML;
    throw new Error("Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set. Application cannot start.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);