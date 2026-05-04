<script>
import { api } from 'src/boot/axios'

export default {
  name: 'OrdersStyledTable',
  data() {
    return {
      columns: [
        { name: 'customer', label: 'CUSTOMER', field: 'customerName', align: 'left' },
        { name: 'orderDate', label: 'ORDER DATE', field: 'orderDate', align: 'left' },
        { name: 'products', label: 'PRODUCTS', field: 'products', align: 'left' },
        { name: 'region', label: 'REGION', field: 'region', align: 'left' },
        { name: 'status', label: 'STATUS', field: 'status', align: 'left' },
        { name: 'total', label: 'TOTALS', field: 'totalAmount', align: 'right' },
        { name: 'action', label: '', field: 'action', align: 'right' },
      ],
      rows: [],
    }
  },
  async mounted() {
    const res = await api.get('/order-detail-views')
    console.log({ res, length: res.data.length })
    this.rows = res.data
  },
  methods: {
    getInitials(name) {
      return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    },
    onPaginationChange(props) {
      this.pagination = props.pagination
    },
  },
}
</script>

<template>
  <div class="orders-card q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Order Details</div>

      <div class="row q-gutter-sm">
        <q-btn flat label="All Orders" class="tab-btn active" />
        <q-btn flat label="Delayed" class="tab-btn" />
        <q-btn flat label="Priority" class="tab-btn" />
      </div>

      <div class="row q-gutter-sm">
        <q-btn outline label="This Month" icon="event" />
        <q-btn outline label="Regions" icon="filter_list" />
        <q-btn outline label="Export to Excel" icon="download" />
        <q-btn outline label="Export to PDF" icon="picture_as_pdf" />
      </div>
    </div>

    <!-- Table -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="customerName"
      flat
      bordered
      class="custom-table q-table--striped"
    >
      <!-- CUSTOMER -->
      <template v-slot:body-cell-customer="props">
        <q-td :props="props">
          <div class="row items-center">
            <div class="avatar">
              {{ getInitials(props.row.customerName) }}
            </div>
            <div class="q-ml-sm text-weight-medium">
              {{ props.row.customerName }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- DATE -->
      <template v-slot:body-cell-orderDate="props">
        <q-td :props="props">
          <div>
            <span class="text-grey-6">
              {{
                new Date(props.row.orderDate).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              }}
            </span>
          </div>
        </q-td>
      </template>

      <!-- PRODUCTS -->
      <template v-slot:body-cell-products="props">
        <q-td :props="props">
          <div>
            {{ props.row.products?.length || 0 }} Items
            <span class="text-grey-6"> ({{ props.row.products?.slice(-2).join(',') }}) </span>
          </div>
        </q-td>
      </template>

      <!-- REGION -->
      <template v-slot:body-cell-region="props">
        <q-td :props="props">
          <div class="row items-center">
            <span class="dot"></span>
            <span class="q-ml-xs">{{ props.row.region || 'Unknown' }}</span>
          </div>
        </q-td>
      </template>

      <!-- STATUS -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props" class="">
          <span :class="['status-badge', (props.row.status || 'Delivered').toLowerCase()]">
            {{ props.row.status || 'Unknown' }}
          </span>
        </q-td>
      </template>

      <!-- TOTAL -->
      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="text-right text-weight-medium">
          ${{ (props.row.totalAmount || 0).toLocaleString() }}
        </q-td>
      </template>

      <!-- ACTION -->
      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-right">
          <q-icon name="chevron_right" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<style scoped>
.orders-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

/* Tabs */
.tab-btn {
  background: #f3f4f6;
  font-size: 12px;
}
.tab-btn.active {
  background: #e5e7eb;
  font-weight: 600;
}

.custom-table tbody tr {
  border-top: 1px solid #f0f0f0;
}

.custom-table tbody tr:hover {
  background: #fafafa;
}

/* Avatar */
.avatar {
  width: 32px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

/* Region dot */
.dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

/* Status badges */
.status-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.status-badge.delivered {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.in\ transit {
  background: #e0f2fe;
  color: #0369a1;
}

.status-badge.processing {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.on\ hold {
  background: #fee2e2;
  color: #b91c1c;
}

.custom-table tbody tr:nth-child(odd) td {
  background-color: #edf1f2 !important;
}

.custom-table tbody tr:nth-child(even) td {
  background-color: #ffffff !important;
}

.custom-table tbody tr:hover td {
  background-color: #eaf2ff !important;
  transition: 0.2s;
}

.custom-table td {
  transition: background-color 0.15s ease;
}
</style>
