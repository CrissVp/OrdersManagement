<template>
  <q-page class="page-wrap">
    <!-- HEADER -->
    <div class="header">
      <div class="header-left">
        <div class="order-icon"></div>
        <div class="order-title">Order #10248</div>
      </div>

      <div class="header-actions">
        <q-btn label="New" flat dense class="btn-muted" />
        <q-btn label="Save" flat dense class="btn-muted" />
        <q-btn label="Delete" flat dense class="btn-danger" />
        <q-btn label="GENERATE INVOICE" unelevated class="btn-dark" />
      </div>
    </div>

    <!-- ORDER INFO -->
    <div class="block">
      <div class="block-title">ORDER INFORMATION</div>

      <div class="grid">
        <q-input v-model="form.customer" label="Customer" outlined dense>
          <template #append><q-icon name="person" size="16px" /></template>
        </q-input>

        <q-input v-model="form.address" label="Shipping Address" outlined dense>
          <template #append>
            <q-icon name="check_circle" size="16px" color="positive" />
          </template>
        </q-input>

        <q-input v-model="form.date" label="Order Date" outlined dense>
          <template #append><q-icon name="event" size="16px" /></template>
        </q-input>

        <q-input v-model="form.manager" label="Account Manager" outlined dense>
          <template #append><q-icon name="badge" size="16px" /></template>
        </q-input>
      </div>
    </div>

    <!-- LINE ITEMS -->
    <div class="block">
      <div class="row justify-between items-center q-mb-sm">
        <div class="block-title">Line Items <span class="item-count">3 ITEMS</span></div>

        <div class="row q-gutter-sm">
          <q-btn label="ADD LINE" dense outline class="btn-outline" />
          <q-btn label="DELETE SELECTED" dense class="btn-dark" />
        </div>
      </div>

      <table class="custom-table">
        <thead>
          <tr>
            <th class="left">PRODUCT DESCRIPTION</th>
            <th>QUANTITY</th>
            <th class="right">UNIT PRICE</th>
            <th class="right">EXT. TOTAL</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in items" :key="item.name">
            <td>
              <div class="item-title">{{ item.name }}</div>
              <div class="item-sub">{{ item.desc }}</div>
            </td>

            <td class="center">
              <input class="qty-input" type="number" v-model="item.qty" />
            </td>

            <td class="right">${{ item.price.toFixed(2) }}</td>
            <td class="right total-cell">${{ (item.qty * item.price).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-row">
        ORDER TOTAL <span>${{ total }}</span>
      </div>
    </div>

    <!-- LOGISTICS -->
    <div class="block">
      <div class="row justify-between items-center q-mb-md">
        <div class="block-title">VALIDATED LOGISTICS ADDRESS</div>
        <div class="verified">VERIFIED</div>
      </div>

      <div class="grid-3">
        <q-input v-model="logistics.street" label="Street" outlined dense />
        <q-input v-model="logistics.city" label="City" outlined dense />
        <q-input v-model="logistics.state" label="State / Prov." outlined dense />
        <q-input v-model="logistics.postal" label="Postal Code" outlined dense />
        <q-input v-model="logistics.country" label="Country" outlined dense />
        <q-input v-model="logistics.gps" label="GPS Coordinates" outlined dense />
      </div>

      <!-- Map placeholder -->
      <div class="map-box"></div>
    </div>

    <!-- HELP BUTTON -->
    <div class="help">
      <q-icon name="support_agent" size="18px" />
      <span>Help Desk</span>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const form = ref({
  customer: 'Alfreds Futterkiste',
  address: 'Obere Str. 57, 12209 Berlin, Germany',
  date: '10/27/2023',
  manager: 'Andrew Fuller',
})

const items = ref([
  { name: 'Chai', desc: 'Beverages | 10 boxes x 20 bags', qty: 12, price: 18 },
  { name: 'Chang', desc: 'Beverages | 24 - 12 oz bottles', qty: 10, price: 19 },
  { name: 'Aniseed Syrup', desc: 'Condiments | 12 - 550 ml bottles', qty: 5, price: 10 },
])

const logistics = ref({
  street: 'Obere Str. 57',
  city: 'Berlin',
  state: 'Berlin (BE)',
  postal: '12209',
  country: 'Germany',
  gps: '52.5200° N, 13.4050° E',
})

const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2))
</script>

<style scoped>
.page-wrap {
  background: #f6f8fb;
  padding: 20px 28px;
  font-family: Inter, sans-serif;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-icon {
  width: 28px;
  height: 28px;
  background: #1e3a5f;
  border-radius: 6px;
}

.order-title {
  font-weight: 600;
  font-size: 18px;
  color: #2b2f33;
}

.header-actions .q-btn {
  font-size: 12px;
}

/* BUTTONS */
.btn-muted {
  color: #6b7280;
}

.btn-danger {
  color: #d64545;
}

.btn-dark {
  background: #1f2937;
  color: white;
  font-size: 12px;
  padding: 6px 14px;
}

.btn-outline {
  border: 1px solid #d1d5db;
  font-size: 12px;
}

/* BLOCK */
.block {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.block-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* TABLE */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.custom-table th {
  text-align: left;
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
  padding-bottom: 8px;
}

.custom-table td {
  padding: 10px 0;
  border-top: 1px solid #f1f1f1;
}

.item-title {
  font-weight: 600;
}

.item-sub {
  font-size: 11px;
  color: #9ca3af;
}

.qty-input {
  width: 50px;
  padding: 4px;
  text-align: center;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.right {
  text-align: right;
}

.center {
  text-align: center;
}

.total-cell {
  font-weight: 600;
}

.total-row {
  text-align: right;
  margin-top: 10px;
  font-weight: 600;
}

.total-row span {
  margin-left: 10px;
}

/* VERIFIED */
.verified {
  background: #e6f7ee;
  color: #22a06b;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
}

/* MAP */
.map-box {
  height: 220px;
  background: #e5e7eb;
  border-radius: 6px;
  margin-top: 14px;
}

/* HELP BUTTON */
.help {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #2563eb;
  color: white;
  padding: 10px 14px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
</style>
