<script setup>
import useOrderDetails from '../js/orderDetails.js'
import '../css/orderDetails.css'

const { columns, rows, getInitials } = useOrderDetails()
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
          <span :class="['status-badge', (props.row.status || 'Unknown').toLowerCase()]">
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
