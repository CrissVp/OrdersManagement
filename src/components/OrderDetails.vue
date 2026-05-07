<script setup>
import useOrderDetails from '../js/orderDetails.js'
import '../css/orderDetails.css'

const {
  columns,
  rows,
  getInitials,

  pagination,

  toggleCurrentMonthFilter,
  isMonthFilterActive,

  selectedRegions,
  regionOptions,
  isRegionFilterActive,
} = useOrderDetails()
</script>

<template>
  <div class="orders-card q-pa-md">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Order Details</div>

      <!-- TABS -->
      <div class="row q-gutter-sm">
        <q-btn flat label="All Orders" class="tab-btn active" />
        <q-btn flat label="Delayed" class="tab-btn" />
        <q-btn flat label="Priority" class="tab-btn" />
      </div>

      <!-- FILTERS -->
      <div class="row q-gutter-sm">
        <!-- THIS MONTH FILTER -->
        <q-btn
          outline
          icon="event"
          label="This Month"
          @click="toggleCurrentMonthFilter"
          :class="{ 'active-filter-btn': isMonthFilterActive }"
        />

        <!-- REGION FILTER (FULLY REACTIVE) -->
        <q-btn-dropdown
          outline
          icon="filter_list"
          label="Regions"
          :class="{ 'active-filter-btn': isRegionFilterActive }"
        >
          <div class="q-pa-md" style="min-width: 250px">
            <q-option-group
              v-model="selectedRegions"
              :options="
                regionOptions.map((r) => ({
                  label: r,
                  value: r,
                }))
              "
              type="checkbox"
            />
          </div>
        </q-btn-dropdown>

        <!-- EXPORT BUTTONS -->
        <q-btn outline label="Export to Excel" icon="download" />
        <q-btn outline label="Export to PDF" icon="picture_as_pdf" />
      </div>
    </div>

    <!-- TABLE -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="orderID"
      flat
      bordered
      class="custom-table q-table--striped"
      v-model:pagination="pagination"
    >
      <template v-slot:header-cell="props">
        <q-th :props="props" class="th-left">{{
          (props.header && props.header.label) || (props.col && props.col.label) || ''
        }}</q-th>
      </template>
      <!-- CUSTOMER -->
      <template v-slot:body-cell-customer="props">
        <q-td :props="props" class="td-left">
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
        <q-td :props="props" class="td-left">
          <span class="text-grey-6">
            {{
              new Date(props.row.orderDate).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            }}
          </span>
        </q-td>
      </template>

      <!-- PRODUCTS -->
      <template v-slot:body-cell-products="props">
        <q-td :props="props" class="td-left">
          <div>
            {{ props.row.products?.length || 0 }} Items
            <span class="text-grey-6"> ({{ props.row.products?.slice(-2).join(', ') }}) </span>
          </div>
        </q-td>
      </template>

      <!-- REGION -->
      <template v-slot:body-cell-region="props">
        <q-td :props="props" class="td-left">
          <div class="row items-center">
            <span class="dot"></span>
            <span class="q-ml-xs">{{ props.row.region || 'Unknown' }}</span>
          </div>
        </q-td>
      </template>

      <!-- STATUS -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props" class="td-left">
          <span :class="['status-badge', (props.row.status || 'unknown').toLowerCase()]">
            {{ props.row.status || 'Unknown' }}
          </span>
        </q-td>
      </template>

      <!-- TOTAL -->
      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="td-left text-weight-medium">
          ${{ (props.row.totalAmount || 0).toLocaleString() }}
        </q-td>
      </template>

      <!-- ACTION -->
      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="td-left">
          <q-btn
            flat
            dense
            round
            icon="chevron_right"
            :to="{ path: '/create-order', query: { id: props.row.orderID } }"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>
