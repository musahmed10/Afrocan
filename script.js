// Cart functionality with debounced save
let cart = []
let saveTimeout
let cartModal // Add this line at the top
const bootstrap = window.bootstrap

// Initialize the cart modal
function initializeCartModal() {
  cartModal = new bootstrap.Modal(document.getElementById("cartModal"))
}

// Debounced save function
function debouncedSave() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, 300) // Wait 300ms after last change before saving
}

// Load cart from localStorage if available
function loadCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    cart = JSON.parse(savedCart)
    updateCartCount()
    updateCartDisplay()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize cart modal
  initializeCartModal()

  // Load saved cart
  loadCart()

  // Initialize Bootstrap components
  const toastElList = document.querySelectorAll(".toast")
  const toasts = [...toastElList].map((toastEl) => new bootstrap.Toast(toastEl))

  // Initialize carousel with auto-play if it exists
  const carouselElement = document.querySelector("#heroCarousel")
  if (carouselElement) {
    new bootstrap.Carousel(carouselElement, {
      interval: 5000,
      fade: true,
    })
  }

  // Add to cart functionality
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id")
      const productName = this.getAttribute("data-product-name")

      addToCart(productId, productName)

      // Show toast notification
      const toast = document.getElementById("addToCartToast")
      const bsToast = new bootstrap.Toast(toast)
      bsToast.show()
    })
  })

  // Cart link click handler
  document.querySelector(".cart-link").addEventListener("click", (e) => {
    e.preventDefault()
    updateCartDisplay() // Update cart display before showing modal
    cartModal.show()
  })

  // Checkout via WhatsApp
  const checkoutBtn = document.getElementById("checkoutBtn")
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Your cart is empty!")
        return
      }

      const phoneNumber = "+12897883419" // Replace with actual WhatsApp number
      let message = "Hello! I would like to order the following items:\n\n"
      cart.forEach((item) => {
        message += `- ${item.name} (Quantity: ${item.quantity})\n`
      })

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
      cartModal.hide() // Hide modal after checkout
    })
  }

  // Handle quantity changes in cart
  document.getElementById("cartItems")?.addEventListener("click", (e) => {
    const target = e.target.closest(".quantity-btn")
    if (!target) return

    const index = Number.parseInt(target.getAttribute("data-index"))
    const action = target.getAttribute("data-action")

    if (action === "increase" || action === "decrease") {
      updateQuantity(index, action)
    }
  })
})

function addToCart(productId, productName) {
  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id: productId,
      name: productName,
      quantity: 1,
    })
  }

  updateCartDisplay()
  updateCartCount()
  debouncedSave()
}

function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems")
  if (!cartItems) return

  cartItems.innerHTML = ""

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>'
    return
  }

  cart.forEach((item, index) => {
    const itemElement = document.createElement("div")
    itemElement.className = "cart-item d-flex justify-content-between align-items-center p-2 border-bottom"
    itemElement.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-3">${item.name}</span>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" 
                            class="btn btn-outline-secondary quantity-btn" 
                            data-index="${index}" 
                            data-action="decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="btn btn-outline-secondary disabled quantity-display">
                        ${item.quantity}
                    </span>
                    <button type="button" 
                            class="btn btn-outline-secondary quantity-btn" 
                            data-index="${index}" 
                            data-action="increase">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="btn btn-danger btn-sm ms-2" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `
    cartItems.appendChild(itemElement)
  })
}

function updateCartCount() {
  const cartCount = document.querySelector(".cart-count")
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
  }
}

function removeFromCart(index) {
  cart.splice(index, 1)
  updateCartDisplay()
  updateCartCount()
  debouncedSave()
}

function updateQuantity(index, action) {
  if (action === "increase") {
    cart[index].quantity += 1
  } else if (action === "decrease") {
    cart[index].quantity -= 1
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1)
    }
  }

  updateCartDisplay()
  updateCartCount()
  debouncedSave()
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      })
    }
  })
})

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.95)"
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.8)"
      navbar.style.boxShadow = "none"
    }
  }
})

// Category filter functionality
const categoryFilter = document.getElementById("categoryFilter")
if (categoryFilter) {
  categoryFilter.addEventListener("change", function () {
    const selectedCategory = this.value.toLowerCase()
    const productCards = document.querySelectorAll(".product-card")

    productCards.forEach((card) => {
      const cardContainer = card.closest(".col-6")
      if (!selectedCategory || card.getAttribute("data-category") === selectedCategory) {
        cardContainer.style.display = "block"
        // Add a fade-in animation
        card.style.opacity = "0"
        setTimeout(() => {
          card.style.opacity = "1"
        }, 50)
      } else {
        cardContainer.style.display = "none"
      }
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the shop page
  if (window.location.pathname.includes("shop.html")) {
    // Get the category from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const category = urlParams.get("category")

    // If there's a category parameter, select it in the dropdown
    if (category) {
      const categoryFilter = document.getElementById("categoryFilter")
      if (categoryFilter) {
        categoryFilter.value = category
        // Trigger the change event to filter the products
        categoryFilter.dispatchEvent(new Event("change"))
      }
    }
  }
})

