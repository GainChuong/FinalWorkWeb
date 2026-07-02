/* ==========================================================================
   Seller Dashboard JS
   Data loaded via AJAX from: datasets/products.json
   ========================================================================== */

// AJAX helper
function ajaxGetJSON(url, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try { onSuccess(JSON.parse(xhr.responseText)); }
      catch (e) { onError(e); }
    } else {
      onError(new Error('AJAX Error ' + xhr.status + ': ' + url));
    }
  };
  xhr.onerror = function () { onError(new Error('Network error: ' + url)); };
  xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    // Tab Switching Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and sections
            navButtons.forEach(b => b.classList.remove('active'));
            viewSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding section
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Mock Interactions for Buttons
    const editorialButtons = document.querySelectorAll('.btn-editorial');
    editorialButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Prevent default form submission if it's in a form
            if (this.type !== 'submit') {
                e.preventDefault();
            }
            
            // Add a small click effect class temporarily
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Sub-tabs in Orders View
    const orderTabs = document.querySelectorAll('.tabs-editorial .tab-item');
    orderTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            orderTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Chat Contacts switching
    const chatContacts = document.querySelectorAll('.chat-contact');
    chatContacts.forEach(contact => {
        contact.addEventListener('click', () => {
            chatContacts.forEach(c => c.classList.remove('active'));
            contact.classList.add('active');
            // Update chat header name (mock)
            const name = contact.querySelector('strong').innerText;
            document.querySelector('.chat-header strong').innerText = name;
        });
    });

    // ==========================================
    // CHART.JS DASHBOARD CHARTS
    // ==========================================
    
    // Global configurations
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.color = '#555';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: 'bold' };
        Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        
        // Chart 1: Revenue Over Time
        const revenueCtx = document.getElementById('revenueChart');
        let revenueChart;
        
        const revenueData = {
            weekly: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'],
                data: [1200000, 1800000, 1500000, 2200000, 1900000, 3100000, 2600000]
            },
            monthly: {
                labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                data: [2800000, 3200000, 3800000, 2700000]
            }
        };
        
        if (revenueCtx) {
            revenueChart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: revenueData.weekly.labels,
                    datasets: [{
                        label: 'Doanh Thu (đ)',
                        data: revenueData.weekly.data,
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5, 150, 105, 0.08)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#059669',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(15, 23, 42, 0.05)' },
                            ticks: {
                                callback: function(value) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                }
                            }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        // Chart tabs interaction
        const chartTabs = document.querySelectorAll('.chart-tabs .chart-tab');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                chartTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const period = tab.getAttribute('data-period');
                if (revenueChart && revenueData[period]) {
                    revenueChart.data.labels = revenueData[period].labels;
                    revenueChart.data.datasets[0].data = revenueData[period].data;
                    revenueChart.update('active');
                }
            });
        });
        
        // Chart 2: Product Category Sales
        const categoryCtx = document.getElementById('categoryChart');
        let categoryChart;
        if (categoryCtx) {
            categoryChart = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Denim Jacket', 'Patchwork Bag', 'Restyled Tops', 'Phụ Kiện Khác'],
                    datasets: [{
                        data: [45, 25, 20, 10],
                        backgroundColor: ['#059669', '#10B981', '#D97706', '#84CC16'],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: { size: 11 }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }
        
        // Chart 3: Environmental Impact & Upcycling Collection Stats
        const environmentalCtx = document.getElementById('environmentalChart');
        let environmentalChart;
        if (environmentalCtx) {
            environmentalChart = new Chart(environmentalCtx, {
                type: 'bar',
                data: {
                    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                    datasets: [
                        {
                            label: 'Số Lượng Đồ Cũ Thu Nhận (chiếc)',
                            data: [12, 18, 15, 22],
                            backgroundColor: '#10B981',
                            borderRadius: 6,
                            barPercentage: 0.5
                        },
                        {
                            label: 'Lượng CO₂ Tiết Kiệm (Kg CO₂)',
                            data: [25, 38, 30, 45],
                            backgroundColor: '#D97706',
                            borderRadius: 6,
                            barPercentage: 0.5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { boxWidth: 12, font: { size: 11 } }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(15, 23, 42, 0.05)' },
                            beginAtZero: true
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        // ==========================================
        // REAL-TIME SIMULATOR LOGIC
        // ==========================================
        
        // State values (matching current mock data)
        let currentRevenue = 12500000;
        let currentOrders = 24;
        let currentCO2 = 45;
        let currentGreenCoins = 1250;
        let simulationInterval = null;
        let isSimulating = false;
        
        // Target DOM Elements
        const statRevenueEl = document.getElementById('stat-revenue');
        const statOrdersEl = document.getElementById('stat-orders');
        const statEnvironmentEl = document.getElementById('stat-environment');
        const statGreencoinEl = document.getElementById('stat-greencoin');
        const walletBalanceEl = document.querySelector('.greencoin-wallet span.text-mono');
        const btnToggleSimulation = document.getElementById('btn-toggle-simulation');
        const indicatorEl = btnToggleSimulation ? btnToggleSimulation.querySelector('.realtime-indicator') : null;
        const textSimulationEl = document.getElementById('simulation-text');
        const toastContainer = document.getElementById('toast-container');
        
        // Load mock orders via AJAX from datasets/products.json
        var mockOrders = [];

        ajaxGetJSON(
            '../datasets/products.json',
            function (data) {
                mockOrders = data.mockOrders || [];
            },
            function (err) {
                console.warn('[seller.js] AJAX failed, using inline fallback:', err.message);
                mockOrders = [
                    { customer: 'Trần Thị Mai', product: 'Upcycled Denim Totebag', price: 350000, co2: 1.8, gc: 35 },
                    { customer: 'Lê Hoàng Long', product: 'Reworked Denim Jacket', price: 1200000, co2: 4.5, gc: 120 },
                    { customer: 'Phạm Minh Đức', product: 'Restyled Flannel Shirt', price: 450000, co2: 2.2, gc: 45 },
                    { customer: 'Vũ Thanh Hằng', product: 'Patchwork Denim Jeans', price: 850000, co2: 3.1, gc: 85 },
                    { customer: 'Nguyễn Duy Anh', product: 'Corduroy Upcycled Cap', price: 250000, co2: 1.2, gc: 25 },
                    { customer: 'Đặng Kim Ngân', product: 'Refashioned Summer Dress', price: 680000, co2: 2.8, gc: 68 }
                ];
            }
        );
        
        // Toast alert function
        function showToast(title, message, icon = 'fa-shopping-bag') {
            if (!toastContainer) return;
            
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            
            toast.innerHTML = `
                <div class="toast-icon"><i class="fas ${icon}"></i></div>
                <div class="toast-body">
                    <div class="toast-title">${title}</div>
                    <div class="toast-msg">${message}</div>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                toast.classList.add('closing');
                toast.addEventListener('animationend', () => {
                    toast.remove();
                });
            }, 5000);
        }
        
        // Number Formatter helper
        function formatVND(num) {
            return num.toLocaleString('vi-VN') + 'đ';
        }
        
        // Main simulation tick
        function runSimulationStep() {
            // 1. Pick a random order
            const randOrder = mockOrders[Math.floor(Math.random() * mockOrders.length)];
            
            // 2. Increment stats
            currentRevenue += randOrder.price;
            currentOrders += 1;
            currentCO2 += randOrder.co2;
            currentGreenCoins += randOrder.gc;
            
            // 3. Update dashboard text with brief flash effect
            if (statRevenueEl) {
                statRevenueEl.innerText = formatVND(currentRevenue);
                flashElement(statRevenueEl);
            }
            if (statOrdersEl) {
                statOrdersEl.innerText = currentOrders.toString();
                flashElement(statOrdersEl);
            }
            if (statEnvironmentEl) {
                statEnvironmentEl.innerText = `-${currentCO2.toFixed(1)} Kg CO₂`;
                flashElement(statEnvironmentEl);
            }
            if (statGreencoinEl) {
                statGreencoinEl.innerText = `${currentGreenCoins.toLocaleString('en-US')} GC`;
                flashElement(statGreencoinEl);
            }
            if (walletBalanceEl) {
                walletBalanceEl.innerText = `${currentGreenCoins.toLocaleString('en-US')} GC`;
                flashElement(walletBalanceEl);
            }
            
            // 4. Update Charts
            // For revenue chart: append the price to the last active period
            if (revenueChart) {
                // Add progress to the last data item or distribute dynamically
                const lastIndex = revenueChart.data.datasets[0].data.length - 1;
                if (lastIndex >= 0) {
                    revenueChart.data.datasets[0].data[lastIndex] += randOrder.price;
                    revenueChart.update('active');
                }
            }
            
            // For product chart: update category shares slightly based on item type
            if (categoryChart) {
                let catIndex = 3; // default phụ kiện
                if (randOrder.product.includes('Jacket')) catIndex = 0;
                else if (randOrder.product.includes('Bag')) catIndex = 1;
                else if (randOrder.product.includes('Shirt') || randOrder.product.includes('Dress') || randOrder.product.includes('Jeans')) catIndex = 2;
                
                categoryChart.data.datasets[0].data[catIndex] += 1;
                categoryChart.update('active');
            }
            
            // For environmental chart: update the latest bar
            if (environmentalChart) {
                const lastIndex = environmentalChart.data.labels.length - 1;
                if (lastIndex >= 0) {
                    environmentalChart.data.datasets[0].data[lastIndex] += 1; // 1 more piece of clothing
                    environmentalChart.data.datasets[1].data[lastIndex] += randOrder.co2; // added CO2 savings
                    environmentalChart.update('active');
                }
            }
            
            // 5. Trigger Toast alert
            showToast(
                `Đơn Hàng Mới Từ ${randOrder.customer}`,
                `Mua <strong>${randOrder.product}</strong> - Trị giá: <strong>${formatVND(randOrder.price)}</strong> (Tiết kiệm ${randOrder.co2} Kg CO₂, Tích lũy +${randOrder.gc} GreenCoins)`,
                'fa-shopping-bag'
            );
        }
        
        // Quick flash animation for DOM elements
        function flashElement(el) {
            el.style.transition = 'none';
            el.style.color = 'var(--accent-highlight)';
            el.style.transform = 'scale(1.05)';
            setTimeout(() => {
                el.style.transition = 'all 0.4s ease';
                el.style.color = '';
                el.style.transform = '';
            }, 300);
        }
        
        // Toggle Simulator button click handler
        if (btnToggleSimulation) {
            btnToggleSimulation.addEventListener('click', () => {
                isSimulating = !isSimulating;
                
                if (isSimulating) {
                    // Turn on
                    btnToggleSimulation.classList.add('btn-primary-editorial');
                    if (indicatorEl) indicatorEl.classList.add('active');
                    if (textSimulationEl) textSimulationEl.innerText = 'Mô Phỏng Live: BẬT';
                    
                    showToast('Mô Phỏng Hoạt Động', 'Hệ thống đã kích hoạt luồng đơn hàng thời gian thực giả lập.', 'fa-plug');
                    
                    // Immediately trigger one step, then loop every 12 seconds
                    runSimulationStep();
                    simulationInterval = setInterval(runSimulationStep, 12000);
                } else {
                    // Turn off
                    btnToggleSimulation.classList.remove('btn-primary-editorial');
                    if (indicatorEl) indicatorEl.classList.remove('active');
                    if (textSimulationEl) textSimulationEl.innerText = 'Mô Phỏng Live: Tắt';
                    
                    showToast('Mô Phỏng Đã Dừng', 'Đã tạm dừng mô phỏng đơn hàng tự động.', 'fa-pause');
                    
                    if (simulationInterval) {
                        clearInterval(simulationInterval);
                        simulationInterval = null;
                    }
                }
            });
        }
        
        // Report download button logic - Export CSV
        const btnDownload = document.getElementById('btn-download-report');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const originalText = btnDownload.innerHTML;
                btnDownload.innerHTML = 'Đang xuất CSV <i class="fas fa-spinner fa-spin"></i>';
                btnDownload.disabled = true;
                
                setTimeout(() => {
                    btnDownload.innerHTML = originalText;
                    btnDownload.disabled = false;
                    
                    // Generate CSV content
                    let csvContent = "\ufeff"; // UTF-8 BOM
                    csvContent += "Chỉ Số,Giá Trị\n";
                    csvContent += `Tổng Doanh Thu (VND),${currentRevenue}\n`;
                    csvContent += `Đơn Hàng Mới,${currentOrders}\n`;
                    csvContent += `Giảm Phát CO2 (Kg CO2),${currentCO2.toFixed(1)}\n`;
                    csvContent += `GreenCoins Tích Lũy,${currentGreenCoins}\n\n`;
                    
                    csvContent += "Lịch Sử Doanh Thu Theo Tuần\n";
                    csvContent += "Tuần,Doanh Thu (VND),Số Lượng Thu Nhận Đồ Cũ (Chiếc),CO2 Tiết Kiệm (Kg)\n";
                    
                    const weekLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
                    const weekRevenues = [2800000, 3200000, 3800000, 2700000];
                    const weekItems = [12, 18, 15, 22];
                    const weekCO2 = [25, 38, 30, 45];
                    
                    for(let i = 0; i < 4; i++) {
                        let rev = weekRevenues[i];
                        if (i === 3) {
                            // Update last week with current simulated orders
                            rev += (currentRevenue - 12500000);
                        }
                        csvContent += `${weekLabels[i]},${rev},${weekItems[i]},${weekCO2[i]}\n`;
                    }
                    
                    // Trigger Download
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Bao_Cao_Doanh_Thu_ReFashion_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showToast(
                        'Tải Báo Cáo Thành Công',
                        `Bản báo cáo CSV đã được tải xuống máy của bạn!`,
                        'fa-file-csv'
                    );
                }, 1000);
            });
        }

        // Logo Drag and Drop & File Upload Logic
        const logoUploadArea = document.getElementById('logo-upload-area');
        const logoFileInput = document.getElementById('logo-file-input');
        const logoPlaceholder = document.getElementById('logo-upload-placeholder');
        const logoPreviewContainer = document.getElementById('logo-upload-preview-container');
        const logoPreviewImg = document.getElementById('logo-preview-img');
        const avatarImg = document.querySelector('.user-profile img.avatar');

        if (logoUploadArea && logoFileInput) {
            // Click to trigger file input
            logoUploadArea.addEventListener('click', () => {
                logoFileInput.click();
            });

            // Handle file selection
            logoFileInput.addEventListener('change', (e) => {
                handleLogoFile(e.target.files[0]);
            });

            // Drag and drop event listeners
            ['dragenter', 'dragover'].forEach(eventName => {
                logoUploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logoUploadArea.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                logoUploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logoUploadArea.classList.remove('drag-over');
                }, false);
            });

            logoUploadArea.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const file = dt.files[0];
                handleLogoFile(file);
            }, false);
        }

        function handleLogoFile(file) {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    const base64data = reader.result;
                    // Show preview
                    if (logoPreviewImg) logoPreviewImg.src = base64data;
                    if (logoPlaceholder) logoPlaceholder.style.display = 'none';
                    if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
                    // Update user profile avatar image top-right
                    if (avatarImg) avatarImg.src = base64data;
                    
                    showToast('Đã Cập Nhật Logo', 'Logo cửa hàng đã được cập nhật thành công (nội bộ).', 'fa-image');
                };
            } else {
                showToast('Lỗi Tệp Tin', 'Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, v.v.)', 'fa-exclamation-circle');
            }
        }

        // Product Modal & Dynamic Publishing Logic
        const addProductModal = document.getElementById('add-product-modal');
        const btnAddProduct = document.getElementById('btn-add-product');
        const btnCloseProductModal = document.getElementById('btn-close-product-modal');
        const btnCancelProductModal = document.getElementById('btn-cancel-product-modal');
        const addProductForm = document.getElementById('add-product-form');
        
        // Modal Upload fields
        const productUploadArea = document.getElementById('product-upload-area');
        const productFileInput = document.getElementById('product-file-input');
        const productPlaceholder = document.getElementById('product-upload-placeholder');
        const productPreviewContainer = document.getElementById('product-upload-preview-container');
        const productPreviewImg = document.getElementById('product-preview-img');
        let uploadedProductImageBase64 = '';

        if (btnAddProduct && addProductModal) {
            // Open modal
            btnAddProduct.addEventListener('click', () => {
                addProductModal.classList.add('show');
            });

            // Close modal functions
            const closeModal = () => {
                addProductModal.classList.remove('show');
                // Reset form
                if (addProductForm) addProductForm.reset();
                // Reset preview
                if (productPreviewImg) productPreviewImg.src = '';
                if (productPlaceholder) productPlaceholder.style.display = 'block';
                if (productPreviewContainer) productPreviewContainer.style.display = 'none';
                uploadedProductImageBase64 = '';
            };

            if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeModal);
            if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeModal);

            // Close modal when clicking outside content
            addProductModal.addEventListener('click', (e) => {
                if (e.target === addProductModal) {
                    closeModal();
                }
            });

            // Modal Drag & Drop Image
            if (productUploadArea && productFileInput) {
                productUploadArea.addEventListener('click', () => {
                    productFileInput.click();
                });

                productFileInput.addEventListener('change', (e) => {
                    handleProductImageFile(e.target.files[0]);
                });

                ['dragenter', 'dragover'].forEach(eventName => {
                    productUploadArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        productUploadArea.classList.add('drag-over');
                    }, false);
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    productUploadArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        productUploadArea.classList.remove('drag-over');
                    }, false);
                });

                productUploadArea.addEventListener('drop', (e) => {
                    const dt = e.dataTransfer;
                    const file = dt.files[0];
                    handleProductImageFile(file);
                }, false);
            }

            function handleProductImageFile(file) {
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onloadend = () => {
                        uploadedProductImageBase64 = reader.result;
                        if (productPreviewImg) productPreviewImg.src = uploadedProductImageBase64;
                        if (productPlaceholder) productPlaceholder.style.display = 'none';
                        if (productPreviewContainer) productPreviewContainer.style.display = 'flex';
                    };
                }
            }

            // Handle Product Form Submit
            if (addProductForm) {
                addProductForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const prodName = document.getElementById('new-product-name').value;
                    const prodCategory = document.getElementById('new-product-category').value;
                    const prodVariant = document.getElementById('new-product-variant').value;
                    const prodPrice = parseInt(document.getElementById('new-product-price').value);
                    const prodStock = parseInt(document.getElementById('new-product-stock').value);

                    // If no image uploaded, use a colored placeholder based on category
                    let imageStyle = '';
                    if (uploadedProductImageBase64) {
                        imageStyle = `background-image: url('${uploadedProductImageBase64}');`;
                    } else {
                        // random placeholder background color
                        const colors = ['#1e3a8a', '#831843', '#065f46', '#701a75'];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        imageStyle = `background-color: ${randomColor};`;
                    }

                    // Table Body select
                    const tableBody = document.getElementById('products-table-body');
                    if (tableBody) {
                        const newRow = document.createElement('tr');
                        // Fade in animation helper for new row
                        newRow.style.opacity = '0';
                        newRow.style.transform = 'translateY(-10px)';
                        newRow.style.transition = 'all 0.5s ease';

                        newRow.innerHTML = `
                            <td>
                                <div class="product-info-cell">
                                    <div class="product-img" style="${imageStyle}"></div>
                                    <div>
                                        <strong>${prodName}</strong><br>
                                        <span class="text-sans">${prodVariant}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="text-mono">${prodPrice.toLocaleString('vi-VN')}đ</td>
                            <td>${prodStock}</td>
                            <td><span class="badge-editorial badge-accent">Đang Bán</span></td>
                            <td>
                                <button class="icon-btn"><i class="fas fa-edit"></i></button>
                                <button class="icon-btn delete" onclick="this.closest('tr').remove();"><i class="fas fa-trash"></i></button>
                            </td>
                        `;

                        // Prepend row
                        tableBody.insertBefore(newRow, tableBody.firstChild);
                        
                        // Trigger animation reflow
                        setTimeout(() => {
                            newRow.style.opacity = '1';
                            newRow.style.transform = 'translateY(0)';
                        }, 50);

                        // Increment product category count in Doughnut Chart
                        if (categoryChart) {
                            let catIndex = 3;
                            if (prodCategory.includes('Jacket')) catIndex = 0;
                            else if (prodCategory.includes('Bag')) catIndex = 1;
                            else if (prodCategory.includes('Tops')) catIndex = 2;
                            
                            categoryChart.data.datasets[0].data[catIndex] += 1;
                            categoryChart.update('active');
                        }

                        // Close Modal
                        closeModal();

                        // Notify user
                        showToast(
                            'Đăng Sản Phẩm Thành Công',
                            `Sản phẩm <strong>${prodName}</strong> đã được đăng bán với giá <strong>${prodPrice.toLocaleString('vi-VN')}đ</strong>.`,
                            'fa-check-circle'
                        );
                    }
                });
            }
        }
    }
});
