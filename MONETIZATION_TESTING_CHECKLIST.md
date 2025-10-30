# 🧪 Monetization System Testing Checklist

## ⚡ Critical Path (Must Do - 1 Hour)

### **Phase 1: Setup** (10 minutes)
- [ ] Create Stripe Product in Dashboard
  - Name: NovaHelper Premium
  - Price: $19.99/month
  - Copy Price ID
- [ ] Add `STRIPE_PRICE_ID` to `.env.local`
- [ ] Restart Next.js dev server
- [ ] Configure Stripe Customer Portal
  - Enable: Update payment methods
  - Enable: View invoices
  - Enable: Cancel subscriptions (optional)
  - Set return URL: `http://localhost:9002/account`

### **Phase 2: Basic Testing** (20 minutes)
- [ ] **Test Single Checkout**
  - Login to app
  - Click checkout button
  - Enter test card: `4242 4242 4242 4242`
  - Enter billing address
  - Complete payment
  - ✅ Verify: Redirected to success page
  
- [ ] **Test Webhook**
  - Check Stripe Dashboard → Events
  - ✅ Verify: `checkout.session.completed` sent
  - Check Supabase Edge Function logs
  - ✅ Verify: Event received and processed
  - Check Supabase Database → profiles table
  - ✅ Verify: `subscription_status = 'active'`
  - ✅ Verify: `subscription_id` populated

- [ ] **Test Account Page**
  - Navigate to `/account`
  - ✅ Verify: Shows "Active" badge
  - ✅ Verify: Premium features listed
  - Click "Manage Billing"
  - ✅ Verify: Opens Customer Portal
  - ✅ Verify: Can see subscription details

### **Phase 3: Multi-Child Testing** (20 minutes)
- [ ] **Setup Test Children**
  - Create 2-3 child profiles in Supabase
  - Set `parent_id` to your user ID
  
- [ ] **Test Multi-Child Checkout**
  - Navigate to multi-child checkout page
  - Select 2 children
  - Complete checkout
  - ✅ Verify: Quantity = 2 in Stripe
  - ✅ Verify: Both children `subscription_status = 'active'`
  
- [ ] **Test Remove Child**
  - Go to account page
  - Find child subscription management
  - Click "Remove" on one child
  - ✅ Verify: Child status = 'canceled'
  - ✅ Verify: Stripe quantity decreased to 1
  - ✅ Verify: Other child still active

### **Phase 4: Edge Cases** (10 minutes)
- [ ] **Test Failed Payment**
  - Use declining card: `4000 0000 0000 0002`
  - ✅ Verify: Payment fails gracefully
  - ✅ Verify: Error message shown
  
- [ ] **Test Cancellation**
  - Go to Customer Portal
  - Cancel subscription
  - ✅ Verify: Webhook fires
  - ✅ Verify: Status updates to 'canceled'
  - ✅ Verify: Access revoked in app

- [ ] **Test Webhook with Stripe CLI**
  ```bash
  stripe trigger customer.subscription.created
  stripe trigger invoice.paid
  stripe trigger invoice.payment_failed
  stripe trigger customer.subscription.deleted
  ```
  - ✅ Verify: All events processed correctly

---

## 🔍 Production Readiness Checklist

### **Before Launch**
- [ ] Test with real card (not test mode)
- [ ] Configure tax registrations
- [ ] Set up Stripe live mode webhook
- [ ] Update webhook URL to production
- [ ] Enable Stripe Tax in live mode
- [ ] Test production checkout end-to-end
- [ ] Monitor first 10 real transactions
- [ ] Set up Stripe email notifications
- [ ] Create customer support process for billing issues

### **Optional Enhancements**
- [ ] Add analytics tracking (conversion rates)
- [ ] Add MRR dashboard
- [ ] Add promo code support
- [ ] Add annual billing option
- [ ] Add usage-based billing
- [ ] Add team/family plan tiers
- [ ] Add subscription pause/resume
- [ ] Add dunning management for failed payments

---

## 📊 Success Metrics

### **Must Work:**
- ✅ Checkout completes successfully
- ✅ Webhook updates database
- ✅ User gets premium access immediately
- ✅ Account page shows correct status
- ✅ Customer Portal allows management
- ✅ Cancellation works properly

### **Performance:**
- Checkout load time: < 2 seconds
- Webhook processing: < 5 seconds
- Database update: < 1 second
- Portal load time: < 2 seconds

### **Error Rates:**
- Payment failures: < 5% (expected)
- Webhook failures: < 0.1%
- Database sync errors: < 0.01%

---

## 🆘 Troubleshooting

### **Webhook Not Firing:**
1. Check Stripe Dashboard → Events
2. Check webhook endpoint URL
3. Check signing secret is correct
4. Check Edge Function logs
5. Test with Stripe CLI: `stripe listen --forward-to...`

### **Database Not Updating:**
1. Check Edge Function logs for errors
2. Verify RLS policies
3. Check service role key is set
4. Test database query manually

### **Payment Fails:**
1. Check test card number
2. Check Stripe API keys (test vs live)
3. Check product/price exists
4. Check billing address required

---

## ✅ When Testing is Complete

You can confidently say:
- ✅ "Checkout works end-to-end"
- ✅ "Webhooks sync database in real-time"
- ✅ "Users can manage their subscriptions"
- ✅ "Multi-child subscriptions work"
- ✅ "System handles failures gracefully"
- ✅ "Ready for production with real customers"

**Current Status: 0/6 complete** ⏳

