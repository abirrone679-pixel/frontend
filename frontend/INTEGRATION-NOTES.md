# Connect the existing Momin Chicken UI

The existing `Momin_Chicken_polished.html` is still a bundled single-file application. Its account, staff, prices and orders are currently persisted in localStorage. It is not safe to launch as-is.

Use `api.js` as the replacement data layer:
- Replace local account/password functions with `MominAPI.signUp`, `signIn`, `signOut`, and `currentUser`.
- Load the product catalogue using `MominAPI.products()`.
- Replace local order creation with `MominAPI.createOrder(...)`.
- Replace guest order lookup with `MominAPI.trackGuestOrder(orderId, token)`.
- Load signed-in customer orders using `MominAPI.myOrders()`.
- Replace admin status writes with `MominAPI.adminUpdateOrder(...)`.
- Remove `ADMIN_EMAIL` checks, local `workers` role checks, local password hashes, and localStorage persistence for orders/prices/users/staff.
- Keep cart state and display preferences in localStorage if desired; never store passwords, auth tokens manually, customer order records, or admin role decisions there.

The current bundled UI has product IDs and pricing defined inside its JavaScript. Create matching `products` rows in Supabase and map each old product to its new UUID before enabling checkout. The current file's embedded prices must not be treated as authoritative.
