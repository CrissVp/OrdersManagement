<script setup>
import { ref } from 'vue'
import useOrderDetails from '../js/orderDetails.js'
import '../css/orderDetails.css'

const { columns, filteredRows, regions, selectedRegion, setRegion, clearRegion, getInitials } =
  useOrderDetails()

const showRegionsMenu = ref(false)
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
        <q-btn outline :label="selectedMonth ? selectedMonth : 'THIS MONTH'" icon="event" />

        <q-dialog v-model="showMonthDialog">
          <q-card>
            <q-card-section>
              <div class="q-pa-sm">
                <input type="month" v-model="monthModel" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Clear" @click="clearMonthAndClose" />
              <q-btn flat label="OK" @click="applyMonth" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-btn outline icon="filter_list" :label="selectedRegion || 'REGION'" />
        <q-menu v-model="showRegionsMenu">
          <q-list style="min-width: 200px">
            <q-item clickable v-ripple>
              <q-item-section>All regions</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="selectRegion('North America')">
              <q-item-section>North America</q-item-section>
            </q-item>
          </q-list>
        </q-menu>

        <q-btn outline label="Export to Excel" icon="download" />
        <q-btn outline label="Export to PDF" icon="picture_as_pdf" />
      </div>
    </div>

    <!-- Table -->
    <q-table
      :rows="filteredRows || rows"
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
            <div class="row q-gutter-sm">
              <q-btn outline label="This Month" icon="event" />

              <q-btn
                outline
                icon="filter_list"
                :label="selectedRegion || 'REGION'"
                @click="showRegionsMenu = !showRegionsMenu"
              />

              <q-menu v-model="showRegionsMenu">
                <q-list style="min-width: 200px">
                  <!-- ALL -->
                  <q-item clickable v-ripple @click="clearRegion">
                    <q-item-section>All regions</q-item-section>
                  </q-item>

                  <q-separator />

                  <!-- REGIONS -->
                  <q-item v-for="r in regions" :key="r" clickable v-ripple @click="setRegion(r)">
                    <q-item-section>{{ r }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>

              <q-btn outline label="Export to Excel" icon="download" />
              <q-btn outline label="Export to PDF" icon="picture_as_pdf" />
            </div>
            <template v-slot:body-cell-products="props"> </template></div></q-td></template
    ></q-table>
  </div>
</template>
