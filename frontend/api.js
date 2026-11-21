/*
 * Momin Chicken frontend API adapter.
 * Include Supabase JS v2 before this file, then config.js.
 * Example:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * <script src="./config.js"></script>
 * <script src="./api.js"></script>
 */
(function () {
  "use strict";

  const cfg = window.MOMIN_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    console.warn("Momin Chicken: configure frontend/config.js first.");
    return;
  }
  if (!window.supabase?.createClient) {
    throw new Error("Supabase JS v2 must be loaded before api.js");
  }

  const client = window.supabase.createClient(
    cfg.supabaseUrl,
    cfg.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  async function unwrap(result) {
    if (result.error) throw result.error;
    return result.data;
  }

  window.MominAPI = Object.freeze({
    // Authentication is handled by Supabase Auth; never store passwords yourself.
    async signUp(email, password, fullName) {
      return unwrap(await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || "" } }
      }));
    },

    async signIn(email, password) {
      return unwrap(await client.auth.signInWithPassword({ email, password }));
    },

    async signOut() {
      return unwrap(await client.auth.signOut());
    },

    async currentUser() {
      const data = await unwrap(await client.auth.getUser());
      return data.user || null;
    },

    async products() {
      return unwrap(await client
        .from("products")
        .select("id,name,description,price_minor,unit,category,image_url,in_stock")
        .eq("active", true)
        .order("sort_order", { ascending: true }));
    },

    // Prices are intentionally not sent. The server calculates the order total.
    async createOrder(order) {
      return unwrap(await client.functions.invoke("create-order", {
        body: {
          customer_name: order.customerName,
          phone: order.phone,
          delivery_mode: order.deliveryMode,
          address: order.address || "",
          items: (order.items || []).map(item => ({
            product_id: item.productId,
            quantity: item.quantity
          })),
          payment_method: "cod"
        }
      }));
    },

    async trackGuestOrder(orderId, trackingToken) {
      return unwrap(await client.functions.invoke("track-order", {
        body: { order_id: orderId, tracking_token: trackingToken }
      }));
    },

    async myOrders() {
      return unwrap(await client
        .from("orders")
        .select("id,created_at,status,total_minor,payment_method,delivery_mode")
        .order("created_at", { ascending: false }));
      // RLS restricts this query to the signed-in customer's own orders.
    },

    async adminUpdateOrder(orderId, status) {
      return unwrap(await client.functions.invoke("admin-update-order", {
        body: { order_id: orderId, status }
      }));
    }
  });

  // Expose no raw service credentials or unrestricted admin client.
  window.MominSupabase = client;
})();
