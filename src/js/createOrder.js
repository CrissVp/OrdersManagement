import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

export default function useCreateOrder(initialId = null) {
  const customers = ref([])
  const managers = ref([])
  const products = ref([])
  const shippers = ref([])
  const shippersRaw = ref([])
  const router = useRouter()

  const addressStatus = ref(null)
  let lastValidated = ''
  const orderId = ref(initialId || null)

  const form = ref({
    customer: null,
    address: '',
    date: new Date().toISOString().substring(0, 10),
    manager: null,
    shipper: null,
  })

  const shipperDetails = ref({ id: '', name: '', phone: '' })

  function onShipperChange(val) {
    const s = shippersRaw.value.find((x) => x.shipperID === val)
    if (s) {
      shipperDetails.value = {
        id: s.shipperID,
        name: s.companyName,
        phone: s.phone,
      }
    }
  }

  async function validateAddress() {
    if (!form.value.address || form.value.address === lastValidated) return

    lastValidated = form.value.address

    try {
      const res = await api.post('/address/validate', {
        address: form.value.address,
      })

      const data = res.data

      logistics.value = {
        street: data.street || '',
        city: data.city || '',
        state: data.state || '',
        postal: data.postal || '',
        country: data.country || '',
        gps: `${data.latitude}, ${data.longitude}`,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      }

      addressStatus.value = true
    } catch (err) {
      addressStatus.value = false
      console.log({ err })
    }
  }

  async function saveOrder() {
    if (addressStatus.value !== true) {
      console.warn('Address not validated')
      return
    }

    try {
      const payload = {
        customerID: form.value.customer,
        employeeID: form.value.manager,
        shipVia: form.value.shipper,
        orderDate: form.value.date,

        shipAddress: logistics.value.street,
        shipCity: logistics.value.city,
        shipRegion: logistics.value.state,
        shipPostalCode: logistics.value.postal,
        shipCountry: logistics.value.country,

        orderDetails: items.value
          .filter((item) => item.productId)
          .map((item) => ({
            productID: item.productId,
            unitPrice: item.price,
            quantity: item.qty,
            discount: 0,
          })),
      }

      let res
      if (orderId.value) {
        // update existing order
        res = await api.put(`/orders/${orderId.value}`, payload)
      } else {
        res = await api.post('/orders/create', payload)
      }

      console.log({ res })

      router.push('/')
    } catch (err) {
      console.error('Error saving order', err)
    }
  }

  async function loadOrder(id) {
    if (!id) return
    try {
      const res = await api.get(`/orders/${id}`)
      const data = res.data

      // mark current order id
      orderId.value = id

      // populate form fields if present
      form.value.customer = data.customerID || form.value.customer
      form.value.manager = data.employeeID || form.value.manager
      form.value.shipper = data.shipVia || form.value.shipper
      form.value.date = data.orderDate ? data.orderDate.substring(0, 10) : form.value.date

      // populate address (concise single-line) and logistics
      form.value.address =
        (data.shipAddress || '') +
        (data.shipCity ? ', ' + data.shipCity : '') +
        (data.shipRegion ? ', ' + data.shipRegion : '') +
        (data.shipPostalCode ? ' ' + data.shipPostalCode : '')

      logistics.value = {
        street: data.shipAddress || '',
        city: data.shipCity || '',
        state: data.shipRegion || '',
        postal: data.shipPostalCode || '',
        country: data.shipCountry || '',
        gps: data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      }

      // populate items: support either detailed `orderDetails` or simple `products` list
      if (Array.isArray(data.orderDetails) && data.orderDetails.length) {
        items.value = data.orderDetails.map((d) => ({
          productId: d.productID,
          desc: d.productName || '',
          qty: d.quantity || d.qty || 1,
          price: d.unitPrice || d.price || 0,
        }))

        // sync with products options (set desc/price if available)
        items.value.forEach((it, idx) => {
          try {
            if (it.productId) updateProduct(idx, it.productId)
          } catch (e) {
            console.warn('Failed to sync product details for item', it, e)
          }
        })
      } else if (Array.isArray(data.products) && data.products.length) {
        // `products` may be an array of product names; try to map to known products
        items.value = data.products.map((pName) => {
          const name = String(pName || '').trim()
          const found = products.value.find((pr) => pr.label === name)
          return {
            productId: found ? found.value : null,
            desc: name,
            qty: 1,
            price: found ? found.price : 0,
          }
        })
      }

      // populate shipper details if available
      if (shippersRaw.value && shippersRaw.value.length) {
        const s = shippersRaw.value.find((x) => x.shipperID === (data.shipVia || data.shipperID))
        if (s) {
          shipperDetails.value = { id: s.shipperID, name: s.companyName, phone: s.phone }
        }
      }

      addressStatus.value = true
    } catch (err) {
      console.error('Failed to load order', err)
    }
  }

  function clearOrder() {
    orderId.value = null
    // reset form and items
    form.value = {
      customer: null,
      address: '',
      date: new Date().toISOString().substring(0, 10),
      manager: null,
      shipper: null,
    }
    items.value = [{ productId: null, desc: '', qty: 1, price: 0 }]
    logistics.value = {
      street: '',
      city: '',
      state: '',
      postal: '',
      country: '',
      gps: '',
    }
    addressStatus.value = null
  }

  onMounted(async () => {
    const [c, e, p, s] = await Promise.all([
      api.get('/customers'),
      api.get('/employees'),
      api.get('/products'),
      api.get('/shippers'),
    ])

    customers.value = c.data.map((x) => ({ label: x.companyName, value: x.customerID }))
    managers.value = e.data.map((x) => ({
      label: `${x.firstName} ${x.lastName}`,
      value: x.employeeID,
    }))
    products.value = p.data.map((x) => ({
      label: x.productName,
      value: x.productID,
      price: x.unitPrice,
    }))
    shippers.value = s.data.map((x) => ({ label: x.companyName, value: x.shipperID }))
    shippersRaw.value = s.data
    // if an initial id was provided, attempt to load it
    if (orderId.value) {
      await loadOrder(orderId.value)
    }
  })

  const items = ref([{ productId: null, desc: '', qty: 1, price: 0 }])

  function addLine() {
    items.value.push({ productId: null, desc: '', qty: 1, price: 0 })
  }

  function updateProduct(index, productId) {
    const p = products.value.find((p) => p.value === productId)
    if (p) {
      items.value[index].desc = p.label
      items.value[index].price = p.price
    }
  }

  const selected = ref([])
  const selectAll = ref(false)

  function toggleAll() {
    selected.value = selectAll.value ? items.value.map((_, i) => i) : []
  }

  watch(selected, () => {
    selectAll.value = selected.value.length === items.value.length
  })

  function deleteSelected() {
    items.value = items.value.filter((_, i) => !selected.value.includes(i))
    selected.value = []
    selectAll.value = false
  }

  const total = computed(() => items.value.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2))

  const logistics = ref({
    street: '',
    city: '',
    state: '',
    postal: '',
    country: '',
    gps: '',
  })

  return {
    customers,
    managers,
    products,
    shippers,
    shippersRaw,
    addressStatus,
    form,
    shipperDetails,
    onShipperChange,
    validateAddress,
    saveOrder,
    loadOrder,
    orderId,
    clearOrder,
    items,
    addLine,
    updateProduct,
    selected,
    selectAll,
    toggleAll,
    deleteSelected,
    total,
    logistics,
  }
}
