let web3;
let contract;
let account;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getRoleMember",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleMemberCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_location",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_area",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_parcelId",
          "type": "string"
        }
      ],
      "name": "mintLand",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferLand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "listForSale",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "delist",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "buyLand",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "getLandDetails",
      "outputs": [
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "area",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isVerified",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "parcelId",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "getTransactionHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "transactionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct LandRegistry.Transaction[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "getLandsByOwner",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
];

const REGISTRAR_ROLE = "0x2db35252033621419a4e414c776034e34e565985860d5c0b06f8c77f0d0e7e9f";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
let isRegistrar = false;
let isAdmin = false;
let marketData = [];

// UI Helpers
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `terminal-toast`;
    
    const colors = {
        success: 'var(--accent-success)',
        error: 'var(--accent-danger)',
        info: 'var(--accent-primary)'
    };
    
    toast.style.borderLeftColor = colors[type] || colors.info;
    
    toast.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
            <i class="fas fa-terminal" style="color: ${colors[type]}"></i>
            <span style="color: #fff;">${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function setBtnLoading(btnId, isLoading, text = '') {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<div class="cyber-loader"></div>`;
    } else {
        btn.disabled = false;
        btn.innerHTML = text || btn.dataset.originalText;
    }
}

// Core Functions
async function connectWallet() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            account = accounts[0];
            
            contract = new web3.eth.Contract(contractABI, contractAddress);
            
            // Check roles
            try {
                const results = await Promise.all([
                    contract.methods.hasRole(REGISTRAR_ROLE, account).call(),
                    contract.methods.hasRole(DEFAULT_ADMIN_ROLE, account).call()
                ]);
                isRegistrar = results[0];
                isAdmin = results[1];
            } catch(e) { 
                isRegistrar = false;
                isAdmin = false; 
            }

            updateWalletUI();
            showToast('SECURE CONNECTION ESTABLISHED', 'success');
            
            await refreshData();
        } catch (error) {
            showToast('CONNECTION REFUSED: ' + error.message, 'error');
        }
    } else {
        showToast('NEURAL LINK NOT FOUND (Install MetaMask)', 'error');
    }
}

function updateWalletUI() {
    const walletInfo = document.getElementById('walletInfo');
    const registerTabBtn = document.querySelector('.nav-item[onclick="showTab(\'register\')"]');
    const adminTabBtn = document.querySelector('.nav-item[onclick="showTab(\'admin\')"]');

    if (account) {
        let roleText = 'VERIFIED_USER';
        if (isAdmin) roleText = 'SYSTEM_ADMIN';
        else if (isRegistrar) roleText = 'REGISTRAR_AUTHORIZED';

        walletInfo.innerHTML = `
            <div class="status-dot"></div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700;">${account.slice(0, 6)}...${account.slice(-4)}</span>
                <span style="font-size: 0.6rem; color: ${isAdmin ? 'var(--accent-danger)' : 'var(--accent-primary)'}; letter-spacing: 1px; font-weight: 800;">
                    ${roleText}
                </span>
            </div>
        `;
        const ownerInput = document.getElementById('ownerAddress');
        if (ownerInput) ownerInput.value = account;

        // Manage sidebar tabs visibility
        if (registerTabBtn) {
            registerTabBtn.style.display = 'flex';
            if (!isRegistrar && !isAdmin) { // Admins can also register
                registerTabBtn.innerHTML = '<i class="fas fa-lock" style="font-size: 0.8rem; opacity: 0.5;"></i> <span>Registration</span>';
                document.getElementById('registerContent').style.display = 'none';
                document.getElementById('unauthorizedView').style.display = 'flex';
            } else {
                registerTabBtn.innerHTML = '<i class="fas fa-plus-circle"></i> <span>Registration</span>';
                document.getElementById('registerContent').style.display = 'block';
                document.getElementById('unauthorizedView').style.display = 'none';
            }
        }

        if (adminTabBtn) {
            adminTabBtn.style.display = isAdmin ? 'flex' : 'none';
        }
    }
}

async function refreshData() {
    if (!contract) return;
    
    await Promise.all([
        loadStats(),
        loadMyLands(),
        loadMarketplace(),
        isAdmin ? refreshRoleMembers() : Promise.resolve()
    ]);
}

async function refreshRoleMembers() {
    if (!contract || !isAdmin) return;
    
    const list = document.getElementById('roleMembersList');
    list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;"><div class="cyber-loader" style="margin: 0 auto;"></div></td></tr>';
    
    try {
        const roles = [
            { name: 'SYSTEM_ADMIN', hash: DEFAULT_ADMIN_ROLE },
            { name: 'REGISTRAR', hash: REGISTRAR_ROLE }
        ];
        
        let html = '';
        for (const role of roles) {
            const count = await contract.methods.getRoleMemberCount(role.hash).call();
            for (let i = 0; i < count; i++) {
                const member = await contract.methods.getRoleMember(role.hash, i).call();
                const isYou = member.toLowerCase() === account.toLowerCase();
                
                html += `
                    <tr class="data-row">
                        <td class="data-cell">
                            <span style="font-family: 'JetBrains Mono', monospace;">${member}</span>
                            ${isYou ? '<span style="color: var(--accent-primary); font-size: 0.7rem; margin-left: 8px;">(YOU)</span>' : ''}
                        </td>
                        <td class="data-cell">
                            <span style="font-size: 0.7rem; padding: 4px 8px; border-radius: 4px; background: ${role.name === 'SYSTEM_ADMIN' ? 'rgba(247, 37, 133, 0.1)' : 'rgba(76, 201, 240, 0.1)'}; color: ${role.name === 'SYSTEM_ADMIN' ? 'var(--accent-danger)' : 'var(--accent-primary)'};">
                                ${role.name}
                            </span>
                        </td>
                        <td class="data-cell">
                            <span style="color: var(--accent-success);"><i class="fas fa-check-circle"></i> ACTIVE</span>
                        </td>
                        <td class="data-cell" style="text-align: right;">
                            ${!isYou ? `
                                <button class="cyber-btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-color: var(--accent-danger); color: var(--accent-danger);" onclick="revokeFromList('${role.hash}', '${member}', '${role.name}')">
                                    REVOKE ACCESS
                                </button>
                            ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">IMMUTABLE</span>'}
                        </td>
                    </tr>
                `;
            }
        }
        list.innerHTML = html || '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">NO MEMBERS DETECTED</td></tr>';
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--accent-danger);">FAILED TO LOAD PERSONNEL DATA</td></tr>';
    }
}

async function revokeFromList(roleHash, member, roleName) {
    if (!contract || !isAdmin) return;
    
    if (confirm(`Are you sure you want to revoke ${roleName} access from ${member}?`)) {
        try {
            showToast(`REVOKING ${roleName} ACCESS...`, 'info');
            await contract.methods.revokeRole(roleHash, member).send({ from: account });
            showToast('ACCESS REVOKED SUCCESSFULLY', 'success');
            await refreshRoleMembers();
        } catch (e) {
            showToast('REVOKE FAILED: ' + e.message, 'error');
        }
    }
}

async function loadStats() {
    if (!contract || !account) return;
    try {
        const lands = await contract.methods.getLandsByOwner(account).call();
        document.getElementById('yourLands').innerHTML = lands.length.toString().padStart(2, '0');
        
        let listedCount = 0;
        let totalCount = 0;
        
        let emptyStreak = 0;
        for (let i = 1; i <= 500; i++) {
            try {
                const land = await contract.methods.getLandDetails(i).call();
                if (land.owner !== "0x0000000000000000000000000000000000000000") {
                    totalCount++;
                    if (land.price > 0) listedCount++;
                    emptyStreak = 0;
                } else {
                    emptyStreak++;
                }
            } catch(e) { 
                emptyStreak++;
            }
            if (emptyStreak >= 3) break;
        }
        
        document.getElementById('totalLands').innerHTML = totalCount.toString().padStart(2, '0');
        document.getElementById('listedLands').innerHTML = listedCount.toString().padStart(2, '0');
    } catch(e) {
        console.error('Stats error:', e);
    }
}

async function registerLand() {
    if (!contract) { showToast('AUTH_REQUIRED: Connect wallet', 'error'); return; }
    
    const owner = document.getElementById('ownerAddress').value;
    const location = document.getElementById('location').value;
    const area = document.getElementById('area').value;
    const parcelId = document.getElementById('parcelId').value;
    
    if (!owner || !location || !area || !parcelId) {
        showToast('DATA_INCOMPLETE: Fill all fields', 'error');
        return;
    }
    
    try {
        setBtnLoading('registerBtn', true);
        const ipfsHash = "Qm" + Math.random().toString(36).substring(7);
        await contract.methods.mintLand(owner, location, area, ipfsHash, parcelId).send({ from: account });
        
        showToast('ASSET_PROVISIONED_SUCCESSFULLY', 'success');
        
        document.getElementById('location').value = '';
        document.getElementById('area').value = '';
        document.getElementById('parcelId').value = '';
        
        await refreshData();
    } catch (error) {
        showToast('PROVISION_FAILED: ' + error.message, 'error');
    } finally {
        setBtnLoading('registerBtn', false);
    }
}

async function listForSale() {
    if (!contract) { showToast('AUTH_REQUIRED', 'error'); return; }
    
    const tokenId = document.getElementById('listTokenId').value;
    const price = document.getElementById('listPrice').value;
    
    if (!tokenId || !price) {
        showToast('INPUT_REQUIRED: ID and Price', 'error');
        return;
    }
    
    try {
        setBtnLoading('listBtn', true);
        const priceWei = web3.utils.toWei(price, 'ether');
        await contract.methods.listForSale(tokenId, priceWei).send({ from: account });
        
        showToast(`ASSET #${tokenId} LISTED @ ${price} ETH`, 'success');
        document.getElementById('listTokenId').value = '';
        document.getElementById('listPrice').value = '';
        
        await refreshData();
    } catch (error) {
        showToast('LIST_FAILED: ' + error.message, 'error');
    } finally {
        setBtnLoading('listBtn', false);
    }
}

async function delistLand() {
    if (!contract) { showToast('AUTH_REQUIRED', 'error'); return; }
    
    const tokenId = document.getElementById('listTokenId').value;
    if (!tokenId) { showToast('ID_REQUIRED', 'error'); return; }
    
    try {
        setBtnLoading('delistBtn', true);
        await contract.methods.delist(tokenId).send({ from: account });
        showToast(`ASSET #${tokenId} DELISTED`, 'success');
        await refreshData();
    } catch (error) {
        showToast('DELIST_FAILED: ' + error.message, 'error');
    } finally {
        setBtnLoading('delistBtn', false);
    }
}

async function buyLand(tokenId) {
    if (!contract) { showToast('AUTH_REQUIRED', 'error'); return; }
    
    const id = tokenId || document.getElementById('buyTokenId').value;
    if (!id) { showToast('ID_REQUIRED', 'error'); return; }
    
    try {
        const land = await contract.methods.getLandDetails(id).call();
        if (land.price == 0) { showToast('ASSET_NOT_FOR_SALE', 'error'); return; }
        
        showToast('ACQUIRING_ASSET...', 'info');
        await contract.methods.buyLand(id).send({ from: account, value: land.price });
        
        showToast(`ACQUISITION_COMPLETE: Asset #${id}`, 'success');
        await refreshData();
    } catch (error) {
        showToast('ACQUISITION_FAILED: ' + error.message, 'error');
    }
}

async function transferLand() {
    if (!contract) { showToast('AUTH_REQUIRED', 'error'); return; }
    
    const tokenId = document.getElementById('transferTokenId').value;
    const newOwner = document.getElementById('newOwner').value;
    
    if (!tokenId || !newOwner) {
        showToast('DATA_REQUIRED: ID and Recipient', 'error');
        return;
    }
    
    try {
        setBtnLoading('transferBtn', true);
        await contract.methods.transferLand(newOwner, tokenId).send({ from: account });
        showToast(`HANDSHAKE_COMPLETE: Asset #${tokenId} transferred`, 'success');
        
        document.getElementById('transferTokenId').value = '';
        document.getElementById('newOwner').value = '';
        
        await refreshData();
    } catch (error) {
        showToast('TRANSFER_FAILED: ' + error.message, 'error');
    } finally {
        setBtnLoading('transferBtn', false);
    }
}

async function viewLand() {
    if (!contract) { showToast('AUTH_REQUIRED', 'error'); return; }
    
    const tokenId = document.getElementById('viewTokenId').value;
    if (!tokenId) { showToast('ID_REQUIRED', 'error'); return; }
    
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
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--accent-primary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px;">
                        [ ARCHIVED_LOGS ]
                    </h4>
                    <div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead>
                                <tr style="color: var(--text-dim); text-align: left; font-size: 0.7rem; text-transform: uppercase;">
                                    <th style="padding: 0.5rem;">Source</th>
                                    <th style="padding: 0.5rem;">Dest</th>
                                    <th style="padding: 0.5rem;">Val</th>
                                    <th style="padding: 0.5rem;">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.map(tx => `
                                    <tr class="data-row">
                                        <td class="data-cell id-tag" style="font-size: 0.7rem;">${tx.from.slice(0,6)}...</td>
                                        <td class="data-cell id-tag" style="font-size: 0.7rem;">${tx.to.slice(0,6)}...</td>
                                        <td class="data-cell" style="font-size: 0.7rem; color: var(--accent-success);">${web3.utils.fromWei(tx.price, 'ether')}</td>
                                        <td class="data-cell" style="font-size: 0.7rem; color: var(--text-dim);">${new Date(Number(tx.timestamp) * 1000).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        document.getElementById('landDetails').innerHTML = `
            <div class="cyber-card" style="margin-top: 1.5rem; border-left: 2px solid var(--accent-primary);">
                <div class="card-header">
                    <span class="id-tag">ASSET_ID: #${tokenId}</span>
                    <span style="color: var(--accent-success); font-weight: 800;">${priceEth} ETH</span>
                </div>
                <div class="form-grid" style="font-size: 0.85rem;">
                    <div><span style="color: var(--text-dim);">LOC:</span> ${land.location}</div>
                    <div><span style="color: var(--text-dim);">AREA:</span> ${land.area} m²</div>
                    <div><span style="color: var(--text-dim);">ROOT:</span> ${land.owner.slice(0,10)}...</div>
                    <div><span style="color: var(--text-dim);">PID:</span> ${land.parcelId}</div>
                    <div><span style="color: var(--text-dim);">VERIF:</span> ${land.isVerified ? 'YES' : 'NO'}</div>
                    <div><span style="color: var(--text-dim);">SYNC:</span> ${date}</div>
                </div>
                ${historyHtml}
            </div>
        `;
    } catch (error) {
        showToast('QUERY_FAILED: Asset not found', 'error');
    }
}

async function loadMyLands() {
    if (!contract || !account) return;
    
    const container = document.getElementById('myLandsList');
    container.innerHTML = '<div class="cyber-loader" style="margin: 2rem auto;"></div>';
    
    try {
        const lands = await contract.methods.getLandsByOwner(account).call();
        
        if (lands.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 2rem; grid-column: span 2;">NO ASSETS DETECTED</p>';
            return;
        }
        
        let html = '';
        for (const id of lands) {
            const land = await contract.methods.getLandDetails(id).call();
            const priceEth = web3.utils.fromWei(land.price, 'ether');
            html += createLandItemHTML(id, land, priceEth, false);
        }
        container.innerHTML = html;
    } catch(e) { 
        container.innerHTML = '<p style="text-align: center; color: var(--accent-danger);">SYNC_ERROR</p>';
    }
}

async function loadMarketplace() {
    if (!contract) return;
    
    const container = document.getElementById('marketplaceList');
    container.innerHTML = '<div class="cyber-loader" style="margin: 2rem auto;"></div>';
    
    marketData = [];
    
    try {
        for (let i = 1; i <= 100; i++) {
            try {
                const land = await contract.methods.getLandDetails(i).call();
                if (land.owner !== "0x0000000000000000000000000000000000000000" && land.price > 0) {
                    marketData.push({
                        id: i,
                        ...land,
                        priceEth: web3.utils.fromWei(land.price, 'ether')
                    });
                }
            } catch(e) { 
                if (i > 10 && marketData.length === 0) break;
                if (i > 50) break;
            }
        }
        
        filterMarketplace();
    } catch(e) {
        container.innerHTML = '<p style="text-align: center; color: var(--accent-danger);">TERMINAL_SYNC_FAILED</p>';
    }
}

function filterMarketplace() {
    const search = document.getElementById('marketSearch').value.toLowerCase();
    const sort = document.getElementById('marketSort').value;
    const container = document.getElementById('marketplaceList');
    
    let filtered = marketData.filter(item => 
        item.location.toLowerCase().includes(search) || 
        item.parcelId.toLowerCase().includes(search) ||
        item.id.toString().includes(search)
    );
    
    if (sort === 'priceLow') filtered.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'priceHigh') filtered.sort((a, b) => Number(b.price) - Number(a.price));
    else filtered.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 2rem;">NO_MATCHING_DATA</p>';
        return;
    }
    
    let html = '';
    for (const item of filtered) {
        html += createLandItemHTML(item.id, item, item.priceEth, true);
    }
    container.innerHTML = html;
}

function createLandItemHTML(id, land, price, isMarketplace) {
    return `
        <div class="asset-card">
            <div class="asset-header">
                <span class="id-tag">TOKEN_ID: #${id}</span>
                <span class="price-tag">${price} ETH</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-map-marker-alt" style="color: var(--accent-primary); width: 14px;"></i>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${land.location}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    <i class="fas fa-barcode" style="color: var(--accent-primary); width: 14px;"></i>
                    <span>PID: ${land.parcelId}</span>
                </div>
            </div>
            ${isMarketplace ? `
                <button class="cyber-btn btn-glow-primary" style="padding: 0.75rem; font-size: 0.85rem; width: 100%; border-radius: 12px;" onclick="buyLand(${id})">
                    ACQUIRE ASSET
                </button>
            ` : ''}
        </div>
    `;
}

async function manageRole(action) {
    if (!contract || !isAdmin) { showToast('ADMIN_PRIVILEGE_REQUIRED', 'error'); return; }
    
    const accountAddr = document.getElementById('roleAccount').value;
    const roleType = document.getElementById('roleSelect').value;
    const roleHash = roleType === 'ADMIN' ? DEFAULT_ADMIN_ROLE : REGISTRAR_ROLE;
    
    if (!web3.utils.isAddress(accountAddr)) {
        showToast('INVALID_ADDRESS', 'error');
        return;
    }
    
    try {
        setBtnLoading(action === 'grant' ? 'grantBtn' : 'revokeBtn', true);
        const method = action === 'grant' ? 'grantRole' : 'revokeRole';
        
        await contract.methods[method](roleHash, accountAddr).send({ from: account });
        
        showToast(`${roleType}_ROLE ${action.toUpperCase()}ED TO ${accountAddr.slice(0,6)}...`, 'success');
        
        const log = document.getElementById('adminLogs');
        const entry = document.createElement('div');
        entry.style.color = action === 'grant' ? 'var(--accent-success)' : 'var(--accent-danger)';
        entry.innerHTML = `> ROLE_${action.toUpperCase()}: ${roleType} -> ${accountAddr.slice(0,10)}...`;
        log.prepend(entry);
        
        document.getElementById('roleAccount').value = '';
    } catch (error) {
        showToast('ADMIN_OPERATION_FAILED: ' + error.message, 'error');
    } finally {
        setBtnLoading(action === 'grant' ? 'grantBtn' : 'revokeBtn', false);
    }
}

function showTab(tabName) {
    const sections = ['register', 'marketplace', 'mylands', 'transfer', 'admin'];
    const titles = {
        register: 'Property Registration',
        marketplace: 'Premium Real Estate Market',
        mylands: 'Asset Portfolio',
        transfer: 'Secure Asset Transfer',
        admin: 'System Administration'
    };
    const descs = {
        register: 'Initialize new digital property titles with administrative blockchain verification.',
        marketplace: 'Explore and acquire verified land parcels within the decentralized network.',
        mylands: 'Monitor your current real estate holdings and manage verified titles.',
        transfer: 'Execute high-security ownership migration to authorized recipient wallets.',
        admin: 'Manage system-level roles and administrative privileges.'
    };

    sections.forEach(s => {
        const el = document.getElementById(s + 'Tab');
        if (el) el.style.display = 'none';
    });
    
    const activeEl = document.getElementById(tabName + 'Tab');
    if (activeEl) activeEl.style.display = 'block';
    
    const titleEl = document.getElementById('activeTabTitle');
    const descEl = document.getElementById('activeTabDesc');
    if (titleEl) titleEl.innerText = titles[tabName];
    if (descEl) descEl.innerText = descs[tabName];

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const onclick = item.getAttribute('onclick');
        if (onclick && onclick.includes(`'${tabName}'`)) {
            item.classList.add('active');
        }
    });
    
    if (tabName === 'marketplace') loadMarketplace();
    if (tabName === 'mylands') loadMyLands();
}

// Event Listeners
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            account = accounts[0];
            updateWalletUI();
            refreshData();
        } else {
            location.reload();
        }
    });
    window.ethereum.on('chainChanged', () => location.reload());
}

document.addEventListener('DOMContentLoaded', () => {
    showTab('register');
});
