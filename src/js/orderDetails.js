// src/composables/useOrderDetails.js

import { ref, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'

export default function useOrderDetails() {
  const columns = ref([
    { name: 'orderID', label: 'ORDER ID', field: 'orderID', align: 'left' },
    { name: 'customer', label: 'CUSTOMER', field: 'customerName', align: 'left' },
    { name: 'orderDate', label: 'ORDER DATE', field: 'orderDate', align: 'left' },
    { name: 'products', label: 'PRODUCTS', field: 'products', align: 'left' },
    { name: 'region', label: 'REGION', field: 'region', align: 'left' },
    { name: 'status', label: 'STATUS', field: 'status', align: 'left' },
    { name: 'total', label: 'TOTALS', field: 'totalAmount', align: 'right' },
    { name: 'action', label: '', field: 'action', align: 'right' },
  ])

  const rows = ref([])
  const allRows = ref([])

  const pagination = ref({
    page: 1,
    rowsPerPage: 5,
  })

  // REGION FILTER
  const selectedRegions = ref([])
  const regionOptions = ref([])

  // DATE FILTER
  const selectedYear = ref(null)
  const selectedMonth = ref(null)
  const selectedWeek = ref(null)

  const yearOptions = ref([])

  const monthOptions = ref([
    { label: 'January', value: 0 },
    { label: 'February', value: 1 },
    { label: 'March', value: 2 },
    { label: 'April', value: 3 },
    { label: 'May', value: 4 },
    { label: 'June', value: 5 },
    { label: 'July', value: 6 },
    { label: 'August', value: 7 },
    { label: 'September', value: 8 },
    { label: 'October', value: 9 },
    { label: 'November', value: 10 },
    { label: 'December', value: 11 },
  ])

  const weekOptions = ref([
    { label: 'Week 1', value: 1 },
    { label: 'Week 2', value: 2 },
    { label: 'Week 3', value: 3 },
    { label: 'Week 4', value: 4 },
    { label: 'Week 5', value: 5 },
  ])

  // WEEK OF MONTH
  function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    return Math.ceil((date.getDate() + firstDay.getDay()) / 7)
  }

  // APPLY FILTERS
  function applyFilters() {
    const filtered = allRows.value.filter((row) => {
      const orderDate = new Date(row.orderDate)

      // REGION FILTER
      if (selectedRegions.value.length > 0 && !selectedRegions.value.includes(row.region)) {
        return false
      }

      // YEAR FILTER
      if (selectedYear.value && orderDate.getFullYear() !== selectedYear.value) {
        return false
      }

      // MONTH FILTER
      if (selectedMonth.value !== null && orderDate.getMonth() !== selectedMonth.value) {
        return false
      }

      // WEEK FILTER
      if (selectedWeek.value && getWeekOfMonth(orderDate) !== selectedWeek.value) {
        return false
      }

      return true
    })

    rows.value = filtered
    pagination.value.page = 1
  }

  // WATCH FILTERS
  watch(
    [selectedRegions, selectedYear, selectedMonth, selectedWeek],
    () => {
      applyFilters()
    },
    { deep: true },
  )

  // GENERATE ROW ID
  function generateRowId(index, row) {
    return (
      row.orderID ??
      row.orderId ??
      row._id ??
      row.id ??
      `${row.customerName ?? 'order'}-${row.orderDate ?? ''}-${index}`
    )
  }

  // FETCH DATA
  async function fetchRows() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/order-detail-views'),
        api.get('/products').catch(() => ({ data: [] })),
      ])

      const productsList = productsRes.data || []

      const productMap = new Map(productsList.map((p) => [p.productId, p.productName]))

      const formattedRows = (ordersRes.data || []).map((r, index) => {
        const rawProducts = Array.isArray(r.products) ? r.products : []

        const displayProducts = rawProducts.map((p) => {
          if (typeof p === 'string' || typeof p === 'number') {
            return productMap.get(p) || String(p)
          }

          return p.productName || ''
        })

        const productIDs = rawProducts
          .map((p) => {
            if (typeof p === 'string' || typeof p === 'number') {
              return p
            }

            return p.productId ?? null
          })
          .filter((x) => x != null)

        const generatedId = generateRowId(index, r)

        return {
          ...r,

          _id: generatedId,

          orderID: r.orderID ?? r.orderId ?? r._id ?? r.id ?? generatedId,

          products: displayProducts,
          productIDs,

          totalAmount: r.totalAmount || 0,
          status: r.status || 'Unknown',
          region: r.region || 'Unknown',
        }
      })

      allRows.value = formattedRows
      rows.value = formattedRows

      // REGION OPTIONS
      regionOptions.value = [...new Set(formattedRows.map((r) => r.region).filter(Boolean))]

      // YEAR OPTIONS
      yearOptions.value = [
        ...new Set(formattedRows.map((r) => new Date(r.orderDate).getFullYear())),
      ].sort((a, b) => b - a)
    } catch (err) {
      console.error('Failed to load order details', err)
    }
  }

  // INITIALS
  function getInitials(name) {
    if (!name) return ''

    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  onMounted(fetchRows)

  return {
    columns,
    rows,
    getInitials,

    pagination,

    // REGION
    selectedRegions,
    regionOptions,

    // DATE
    selectedYear,
    selectedMonth,
    selectedWeek,

    yearOptions,
    monthOptions,
    weekOptions,
  }
}
