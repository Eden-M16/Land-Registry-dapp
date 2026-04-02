// Global state
let web3;
let contract;
let currentAccount;
let isAdmin = false;
let isRegistrar = false;
let marketData = [];

// Configuration
const REGISTRAR_ROLE = "0x2db35252033621419a4e414c776034e34e565985860d5c0b06f8c77f0d0e7e9f";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Load contract configuration
async function loadContractConfig() {
    try {
        const response = await fetch('/contract-address.json');
        const config = await response.json();
        const address = config.address;
        
        const abiResponse = await fetch('/artifacts/contracts/LandRegistry.sol/LandRegistry.json');
        const contractJson = await abiResponse.json();
        const abi = contractJson.abi;
        
        return { address, abi };
    } catch (error) {
        console.error("Configuration error:", error);
        // Fallback for demo/dev
        return { 
            address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
            abi: [] // Should be loaded from file
        };
    }
}

// UI Helpers
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'terminal-toast';
    
    const colors = {
        success: 'var(--accent-success)',
        error: 'var(--accent-danger)',
        info: 'var(--accent-primary)'
    };
    
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: center;">
            <i class="fas fa-terminal" style="color: ${colors[type]}"></i>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Also log to admin console if it exists
    addAdminLog(message, type);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function addAdminLog(message, type = 'info') {
    const logContainer = document.getElementById('adminLogs');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const time = new Date().toLocaleTimeString();
    
    let typeClass = '';
    if (type === 'success') typeClass = 'log-success';
    else if (type === 'error') typeClass = 'log-error';

    entry.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-prefix">${type === 'error' ? 'ERR:' : 'SYS:'}</span>
        <span class="${typeClass}">${message.toUpperCase()}</span>
    `;

    logContainer.prepend(entry);
    
    // Keep only last 50 logs
    if (logContainer.children.length > 50) {
        logContainer.lastElementChild.remove();
    }
}

function setBtnLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.original = btn.innerHTML;
        btn.innerHTML = '<div class="cyber-loader"></div>';
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.original;
    }
}

// Web3 Core
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                await setupContract();
            }
        } catch (error) {
            console.error("Web3 init error:", error);
        }
    }
}

async function setupContract() {
    const config = await loadContractConfig();
    if (!config || !config.abi.length) {
        // If ABI couldn't be fetched, we can't proceed
        console.error("Contract ABI missing");
        return;
    }
    
    contract = new web3.eth.Contract(config.abi, config.address);
    document.getElementById('contractAddr').textContent = config.address;
    
    await checkRoles();
    updateWalletUI();
    await refreshData();
}

async function connectWallet() {
    if (!window.ethereum) {
        showToast("MetaMask not detected", "error");
        return;
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        await setupContract();
        showToast("Neural link established", "success");
    } catch (error) {
        showToast("Connection refused", "error");
    }
}

async function checkRoles() {
    if (!contract || !currentAccount) return;
    try {
        const [admin, registrar] = await Promise.all([
            contract.methods.hasRole(DEFAULT_ADMIN_ROLE, currentAccount).call(),
            contract.methods.hasRole(REGISTRAR_ROLE, currentAccount).call()
        ]);
        isAdmin = admin;
        isRegistrar = registrar;
    } catch (error) {
        console.error("Role check error:", error);
    }
}

function updateWalletUI() {
    const walletInfo = document.getElementById('walletInfo');
    const registerTabBtn = document.querySelector('.nav-item[onclick*="register"]');
    const adminTabLink = document.getElementById('adminTabLink');

    if (currentAccount) {
        let roleLabel = 'VERIFIED_USER';
        let roleColor = 'var(--accent-primary)';
        
        if (isAdmin) {
            roleLabel = 'SYSTEM_ADMIN';
            roleColor = 'var(--accent-danger)';
        } else if (isRegistrar) {
            roleLabel = 'REGISTRAR';
        }

        walletInfo.innerHTML = `
            <div class="status-dot"></div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'JetBrains Mono'; font-size: 0.85rem;">${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}</span>
                <span style="font-size: 0.6rem; color: ${roleColor}; letter-spacing: 1px; font-weight: 800;">${roleLabel}</span>
            </div>
        `;

        if (document.getElementById('ownerAddress')) {
            document.getElementById('ownerAddress').value = currentAccount;
        }

        // Sidebar Visibility & Restricted States
        if (isAdmin || isRegistrar) {
            document.getElementById('registerContent').style.display = 'block';
            document.getElementById('unauthorizedView').style.display = 'none';
            if (registerTabBtn) registerTabBtn.innerHTML = '<i class="fas fa-plus-circle"></i><span>Registration</span>';
        } else {
            document.getElementById('registerContent').style.display = 'none';
            document.getElementById('unauthorizedView').style.display = 'flex';
            if (registerTabBtn) registerTabBtn.innerHTML = '<i class="fas fa-lock" style="opacity: 0.5;"></i><span>Registration</span>';
        }

        if (adminTabLink) {
            adminTabLink.style.display = isAdmin ? 'flex' : 'none';
        }
    }
}

// Data Loading
async function refreshData() {
    if (!contract) return;
    await Promise.all([
        loadStats(),
        loadMyLands(),
        loadMarketplace(),
        isAdmin ? refreshRoleMembers() : Promise.resolve()
    ]);
}

async function loadStats() {
    try {
        // This is a simplified way to get total count if your contract doesn't have a direct totalLands count
        // For a real app, you'd use a Counter or a mapping
        let totalCount = 0;
        try {
            // Placeholder: Assume token IDs start from 1
            for(let i=1; i<100; i++) {
                try {
                    await contract.methods.ownerOf(i).call();
                    totalCount++;
                } catch(e) { break; }
            }
        } catch(e) {}
        
        document.getElementById('totalLands').textContent = totalCount.toString().padStart(2, '0');
        
        if (currentAccount) {
            const myLands = await contract.methods.getLandsByOwner(currentAccount).call();
            document.getElementById('yourLands').textContent = myLands.length.toString().padStart(2, '0');
        }
    } catch (e) { console.error("Stats error:", e); }
}

async function loadMarketplace() {
    const list = document.getElementById('marketplaceList');
    list.innerHTML = '<div class="cyber-loader"></div>';
    
    marketData = [];
    try {
        const listedIds = await contract.methods.getListedLands().call();
        for (const id of listedIds) {
            const land = await contract.methods.getLandDetails(id).call();
            marketData.push({
                id: id,
                location: land.location,
                area: land.area,
                parcelId: land.parcelId,
                owner: land.owner,
                priceEth: web3.utils.fromWei(land.listedPrice, 'ether'),
                timestamp: land.timestamp
            });
        }
        filterMarketplace();
    } catch (e) { console.error("Marketplace error:", e); }
}

function filterMarketplace() {
    const search = document.getElementById('marketSearch').value.toLowerCase();
    const sort = document.getElementById('marketSort').value;
    const list = document.getElementById('marketplaceList');
    
    let filtered = marketData.filter(item => 
        item.location.toLowerCase().includes(search) || 
        item.parcelId.toLowerCase().includes(search) ||
        item.id.toString().includes(search)
    );
    
    // Sort logic
    if (sort === 'priceLow') filtered.sort((a, b) => a.priceEth - b.priceEth);
    else if (sort === 'priceHigh') filtered.sort((a, b) => b.priceEth - a.priceEth);
    else filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    if (filtered.length === 0) {
        list.innerHTML = '<div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 3rem;">NO ACTIVE LISTINGS MATCH SEARCH</div>';
        return;
    }
    
    list.innerHTML = filtered.map(item => `
        <div class="asset-card">
            <div class="asset-tag">#${item.id}</div>
            <div class="asset-image-placeholder">
                <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="asset-header">
                <span class="asset-id" style="font-size: 1.1rem; color: #fff;">${item.location}</span>
                <span class="asset-price">${item.priceEth} ETH</span>
            </div>
            <div class="asset-details" style="margin-bottom: 1.5rem;">
                <div class="asset-detail-item">
                    <i class="fas fa-barcode"></i>
                    <span>PID: ${item.parcelId}</span>
                </div>
                <div class="asset-detail-item">
                    <i class="fas fa-vector-square"></i>
                    <span>${item.area} m²</span>
                </div>
            </div>
            <button class="cyber-btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 0.9rem;" onclick="buyLand(${item.id})">
                ACQUIRE ASSET
            </button>
        </div>
    `).join('');
}

async function loadMyLands() {
    const list = document.getElementById('myLandsList');
    list.innerHTML = '<div class="cyber-loader"></div>';
    try {
        const lands = await contract.methods.getLandsByOwner(currentAccount).call();
        if (lands.length === 0) {
            list.innerHTML = '<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 3rem;">PORTFOLIO EMPTY</div>';
            return;
        }
        
        let html = '';
        for (const id of lands) {
            const land = await contract.methods.getLandDetails(id).call();
            const isListed = land.isListed;
            html += `
                <div class="asset-card">
                    <div class="asset-tag" style="background: ${isListed ? 'rgba(0, 245, 212, 0.1)' : 'rgba(67, 97, 238, 0.1)'}; color: ${isListed ? 'var(--accent-primary)' : 'var(--accent-secondary)'};">
                        ${isListed ? 'LISTED' : 'SECURED'}
                    </div>
                    <div class="asset-image-placeholder">
                        <i class="fas fa-house-shield"></i>
                    </div>
                    <div class="asset-header">
                        <span class="asset-id" style="font-size: 1.1rem; color: #fff;">${land.location}</span>
                        <span class="asset-price">${isListed ? web3.utils.fromWei(land.listedPrice, 'ether') + ' ETH' : 'VALUED'}</span>
                    </div>
                    <div class="asset-details" style="margin-bottom: 1.5rem;">
                        <div class="asset-detail-item">
                            <i class="fas fa-barcode"></i>
                            <span>TOKEN_ID: #${id}</span>
                        </div>
                        <div class="asset-detail-item">
                            <i class="fas fa-vector-square"></i>
                            <span>${land.area} m²</span>
                        </div>
                    </div>
                    <button class="cyber-btn btn-outline" style="width: 100%; padding: 0.85rem; font-size: 0.9rem;" onclick="inspectAsset(${id})">
                        INSPECT CERTIFICATE
                    </button>
                </div>
            `;
        }
        list.innerHTML = html;
    } catch (e) { console.error("MyLands error:", e); }
}

// Transaction Functions
async function registerLand() {
    if (!contract) return;
    const location = document.getElementById('location').value;
    const area = document.getElementById('area').value;
    const parcelId = document.getElementById('parcelId').value;
    
    if (!location || !area || !parcelId) {
        showToast("Incomplete telemetry data", "error");
        return;
    }
    
    try {
        setBtnLoading('registerBtn', true);
        const ipfsHash = "ipfs://Qm" + Math.random().toString(36).substring(7);
        // Parameters: address to, string location, uint256 area, string parcelId, string tokenURI
        await contract.methods.registerLand(currentAccount, location, area, parcelId, ipfsHash).send({ from: currentAccount });
        showToast("Asset provisioned successfully", "success");
        await refreshData();
    } catch (e) {
        showToast("Registration failed", "error");
    } finally {
        setBtnLoading('registerBtn', false);
    }
}

async function listForSale() {
    const id = document.getElementById('listTokenId').value;
    const price = document.getElementById('listPrice').value;
    if(!id || !price) { showToast("ID and Price required", "error"); return; }
    
    try {
        setBtnLoading('listBtn', true);
        const priceWei = web3.utils.toWei(price, 'ether');
        await contract.methods.listForSale(id, priceWei).send({ from: currentAccount });
        showToast("Asset listed for trade", "success");
        await refreshData();
    } catch (e) { showToast("Listing failed", "error"); }
    finally { setBtnLoading('listBtn', false); }
}

async function delistLand() {
    const id = document.getElementById('listTokenId').value;
    if(!id) { showToast("Token ID required", "error"); return; }
    try {
        setBtnLoading('delistBtn', true);
        await contract.methods.delistLand(id).send({ from: currentAccount });
        showToast("Listing revoked", "success");
        await refreshData();
    } catch (e) { showToast("Delisting failed", "error"); }
    finally { setBtnLoading('delistBtn', false); }
}

async function buyLand(id) {
    const tokenId = id || document.getElementById('buyTokenId').value;
    if(!tokenId) { showToast("Token ID required", "error"); return; }
    
    try {
        const land = await contract.methods.getLandDetails(tokenId).call();
        if(!land.isListed) { showToast("Asset not for sale", "error"); return; }
        
        showToast("Processing acquisition...", "info");
        await contract.methods.buyLand(tokenId).send({ from: currentAccount, value: land.listedPrice });
        showToast("Asset acquired successfully", "success");
        await refreshData();
    } catch (e) { showToast("Acquisition failed", "error"); }
}

async function transferLand() {
    const id = document.getElementById('transferTokenId').value;
    const to = document.getElementById('newOwner').value;
    if(!id || !to) { showToast("ID and Recipient required", "error"); return; }
    
    try {
        setBtnLoading('transferBtn', true);
        await contract.methods.transferLand(to, id).send({ from: currentAccount });
        showToast("Ownership migration complete", "success");
        await refreshData();
    } catch (e) { showToast("Transfer failed", "error"); }
    finally { setBtnLoading('transferBtn', false); }
}

async function viewLand() {
    const id = document.getElementById('viewTokenId').value;
    if(!id) { showToast("Token ID required", "error"); return; }
    await inspectAsset(id);
}

async function inspectAsset(tokenId) {
    try {
        const [land, history] = await Promise.all([
            contract.methods.getLandDetails(tokenId).call(),
            contract.methods.getTransactionHistory(tokenId).call()
        ]);

        const priceEth = web3.utils.fromWei(land.price, 'ether');
        const date = new Date(Number(land.timestamp) * 1000).toLocaleString();
        
        let historyHtml = '';
        if (history && history.length > 0) {
            historyHtml = `
                <div style="margin-top: 3rem; border-top: 1px solid var(--border-glass); padding-top: 2rem;">
                    <div class="cert-label" style="margin-bottom: 1.5rem;">Audit Trail / History</div>
                    <div style="display: grid; gap: 1rem;">
                        ${history.map(tx => `
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px;">
                                <div>
                                    <span style="color: var(--text-muted);">FROM:</span> ${tx.from.slice(0,10)}...
                                    <span style="color: var(--text-muted); margin-left: 1rem;">TO:</span> ${tx.to.slice(0,10)}...
                                </div>
                                <div style="color: var(--accent-primary); font-family: 'JetBrains Mono';">
                                    ${web3.utils.fromWei(tx.price, 'ether')} ETH
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        document.getElementById('landDetails').innerHTML = `
            <div class="certificate-container">
                <div class="certificate-watermark">VERIFIED</div>
                <div class="cert-header">
                    <div>
                        <div class="cert-label">Certificate of Digital Title</div>
                        <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-primary); margin-top: 0.5rem;">
                            ASSET_PROTOCOL: #${tokenId}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="cert-label">Appraisal Value</div>
                        <div class="price-tag" style="font-size: 1.75rem;">${priceEth} ETH</div>
                    </div>
                </div>
                <div class="cert-grid">
                    <div class="cert-item">
                        <span class="cert-label">Legal Coordinates</span>
                        <span class="cert-value">${land.location}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Surface Area</span>
                        <span class="cert-value">${land.area} m²</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Digital Custodian</span>
                        <span class="cert-value" style="font-family: 'JetBrains Mono'; font-size: 0.9rem;">${land.owner}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Parcel Reference</span>
                        <span class="cert-value">${land.parcelId}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">System Sync</span>
                        <span class="cert-value">${date}</span>
                    </div>
                    <div class="cert-item">
                        <span class="cert-label">Security Protocol</span>
                        <span class="cert-value" style="color: var(--accent-success); display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-shield-check"></i> END_TO_END_ENCRYPTED
                        </span>
                    </div>
                </div>
                ${historyHtml}
            </div>
        `;
    } catch (e) { showToast("Asset query failed", "error"); }
}

// Admin Functions
async function refreshRoleMembers() {
    if (!isAdmin) return;
    const list = document.getElementById('roleMembersList');
    list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem;"><div class="cyber-loader" style="margin: 0 auto;"></div></td></tr>';
    
    try {
        // Since AccessControl is no longer enumerable, we can only verify specific accounts
        // We will show the current user's status and provide an interface to verify others
        const isUserAdmin = await contract.methods.hasRole(DEFAULT_ADMIN_ROLE, currentAccount).call();
        const isUserRegistrar = await contract.methods.hasRole(REGISTRAR_ROLE, currentAccount).call();
        
        let html = `
            <tr class="data-row">
                <td class="data-cell">
                    <span style="font-family: 'JetBrains Mono'; font-size: 0.9rem;">${currentAccount}</span>
                    <span style="color: var(--accent-primary); font-size: 0.7rem; margin-left: 8px; font-weight: 800;">(YOU)</span>
                </td>
                <td class="data-cell">
                    <div style="display: flex; gap: 4px;">
                        ${isUserAdmin ? '<span class="role-pill admin">ADMIN</span>' : ''}
                        ${isUserRegistrar ? '<span class="role-pill registrar">REGISTRAR</span>' : ''}
                    </div>
                </td>
                <td class="data-cell">
                    <span style="color: var(--accent-success); font-size: 0.8rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-shield-check"></i> IDENTITY_VERIFIED
                    </span>
                </td>
                <td class="data-cell" style="text-align: right;">
                    <span style="color: var(--text-muted); font-size: 0.75rem; letter-spacing: 1px;">ROOT_IMMUTABLE</span>
                </td>
            </tr>
        `;
        list.innerHTML = html;
        addAdminLog("Personnel audit synchronized with protocol state", "success");
    } catch (e) { 
        console.error("Personnel audit failed:", e); 
        addAdminLog("Personnel audit synchronization failed", "error");
    }
}

async function manageRole(action) {
    const address = document.getElementById('roleAccount').value;
    const roleType = document.getElementById('roleSelect').value;
    const roleHash = roleType === 'ADMIN' ? DEFAULT_ADMIN_ROLE : REGISTRAR_ROLE;
    
    if (!web3.utils.isAddress(address)) {
        showToast("Invalid identity address", "error");
        return;
    }
    
    try {
        setBtnLoading(action === 'grant' ? 'grantBtn' : 'revokeBtn', true);
        const method = action === 'grant' ? 'grantRole' : 'revokeRole';
        await contract.methods[method](roleHash, address).send({ from: currentAccount });
        showToast(`Authorization ${action}ed successfully`, "success");
        await refreshRoleMembers();
    } catch (e) {
        showToast("Administrative failure", "error");
    } finally {
        setBtnLoading(action === 'grant' ? 'grantBtn' : 'revokeBtn', false);
    }
}

async function revokeFromList(roleHash, member) {
    if (!isAdmin) return;
    if (confirm(`INITIATE ACCESS REVOCATION FOR ${member}?`)) {
        try {
            showToast("Revoking authorization...", "info");
            await contract.methods.revokeRole(roleHash, member).send({ from: currentAccount });
            showToast("Access revoked successfully", "success");
            await refreshRoleMembers();
        } catch (e) { showToast("Revocation failed", "error"); }
    }
}

// Tab Management
function showTab(tabName) {
    const sections = ['register', 'marketplace', 'mylands', 'transfer', 'admin'];
    const titles = {
        register: 'Property Registry',
        marketplace: 'Premium Asset Market',
        mylands: 'My Asset Portfolio',
        transfer: 'Secure Asset Migration',
        admin: 'System Command Center'
    };
    const descs = {
        register: 'Official portal for blockchain-verified land titles.',
        marketplace: 'Real-time peer-to-peer asset exchange protocol.',
        mylands: 'Monitor and manage your verified real estate holdings.',
        transfer: 'Initiate high-security ownership migration.',
        admin: 'Global protocol management and personnel audit.'
    };

    sections.forEach(s => {
        const el = document.getElementById(s + 'Tab');
        if (el) el.style.display = 'none';
    });
    
    const activeEl = document.getElementById(tabName + 'Tab');
    if (activeEl) activeEl.style.display = 'block';
    
    document.getElementById('activeTabTitle').innerText = titles[tabName];
    document.getElementById('activeTabDesc').innerText = descs[tabName];

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(`'${tabName}'`)) {
            item.classList.add('active');
        }
    });
    
    if (tabName === 'marketplace') loadMarketplace();
    if (tabName === 'mylands') loadMyLands();
    if (tabName === 'admin') refreshRoleMembers();
}

// Initialize
window.addEventListener('load', async () => {
    await initWeb3();
    showTab('register');
});

// Event Listeners
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => window.location.reload());
    window.ethereum.on('chainChanged', () => window.location.reload());
}

// Global Exports
window.connectWallet = connectWallet;
window.showTab = showTab;
window.registerLand = registerLand;
window.listForSale = listForSale;
window.delistLand = delistLand;
window.buyLand = buyLand;
window.transferLand = transferLand;
window.viewLand = viewLand;
window.inspectAsset = inspectAsset;
window.manageRole = manageRole;
window.refreshRoleMembers = refreshRoleMembers;
window.revokeFromList = revokeFromList;
window.filterMarketplace = filterMarketplace;
