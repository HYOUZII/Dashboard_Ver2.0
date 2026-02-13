// 자산 (베이스라인) 탭 관리

async function initAssetsTab(container) {
    showPermissionInfo(container, SESSION.permission);
    
    // RESEARCHER, ADMIN만 베이스라인 생성 가능
    if (SESSION.permission === 'RESEARCHER' || SESSION.permission === 'ADMIN') {
        container.innerHTML += `
            <div class="card">
                <div class="card-title">📁 베이스라인 & 자산 관리</div>
                <p style="color: #666; margin-bottom: 15px;">
                    제품별 버전 관리, 파일 이력 추적, 생산팀 공유
                </p>
                <button class="btn btn-primary" onclick="showBaselineCreateForm()">
                    ➕ 새 베이스라인 생성
                </button>
            </div>
        `;
    }
    
    // 베이스라인 목록
    loadBaselinesList(container);
}

function showBaselineCreateForm() {
    const formCard = document.createElement('div');
    formCard.className = 'card';
    formCard.id = 'baseline-create-form';
    formCard.innerHTML = `
        <div class="card-title">➕ 새 베이스라인 생성</div>
        
        <div id="baseline-alert"></div>
        
        <form id="baseline-form">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">제품 모델명 *</label>
                    <input type="text" class="form-input" id="baseline-product" required 
                           placeholder="예: AC-7KW-V1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">버전명 *</label>
                    <input type="text" class="form-input" id="baseline-version" required 
                           placeholder="예: v1.0.0">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">확정일 *</label>
                    <input type="date" class="form-input" id="baseline-date" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">확정자</label>
                    <input type="text" class="form-input" id="baseline-confirmer" 
                           placeholder="예: 정큐에">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">상태 *</label>
                    <select class="form-select" id="baseline-status" required>
                        <option value="준비중">준비중</option>
                        <option value="검증중">검증중</option>
                        <option value="양산중">양산중</option>
                        <option value="단종">단종</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">용도</label>
                    <input type="text" class="form-input" id="baseline-purpose" 
                           placeholder="예: A사 납품용">
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" id="baseline-submit-btn" style="flex: 1;">
                    ➕ 베이스라인 생성
                </button>
                <button type="button" class="btn btn-danger" onclick="hideBaselineCreateForm()" style="flex: 0 0 auto;">
                    취소
                </button>
            </div>
        </form>
    `;
    
    const container = document.getElementById('tab-assets');
    const firstCard = container.querySelector('.card');
    
    if (firstCard) {
        firstCard.after(formCard);
    } else {
        container.appendChild(formCard);
    }
    
    document.getElementById('baseline-form').addEventListener('submit', handleBaselineSubmit);
}

function hideBaselineCreateForm() {
    const form = document.getElementById('baseline-create-form');
    if (form) {
        form.remove();
    }
}

async function handleBaselineSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('baseline-submit-btn');
    const alertDiv = document.getElementById('baseline-alert');
    
    submitBtn.disabled = true;
    submitBtn.textContent = '생성 중...';
    
    try {
        const baselineData = {
            productModel: document.getElementById('baseline-product').value,
            version: document.getElementById('baseline-version').value,
            confirmDate: document.getElementById('baseline-date').value,
            confirmer: document.getElementById('baseline-confirmer').value,
            status: document.getElementById('baseline-status').value,
            purpose: document.getElementById('baseline-purpose').value,
            selectedAssets: [] // 실제로는 파일 선택 UI 필요
        };
        
        const result = await createBaseline(baselineData);
        
        if (result && result.success) {
            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ ${result.message} (${result.id})
                </div>
            `;
            
            document.getElementById('baseline-form').reset();
            
            setTimeout(() => {
                hideBaselineCreateForm();
                refreshAssetsTab();
            }, 2000);
            
        } else {
            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ❌ ${result?.error || '베이스라인 생성에 실패했습니다.'}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('베이스라인 생성 오류:', error);
        alertDiv.innerHTML = `
            <div class="alert alert-danger">
                ❌ 서버 연결에 실패했습니다.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '➕ 베이스라인 생성';
    }
}

async function loadBaselinesList(container) {
    const listCard = document.createElement('div');
    listCard.className = 'card';
    listCard.id = 'baselines-list-card';
    listCard.innerHTML = `
        <div class="card-title">베이스라인 목록</div>
        <div class="loading">베이스라인 데이터 로딩 중...</div>
    `;
    
    container.appendChild(listCard);
    
    try {
        const baselines = await getBaselines();
        
        if (!baselines || baselines.error) {
            listCard.innerHTML = `
                <div class="card-title">베이스라인 목록</div>
                <div class="alert alert-danger">
                    데이터를 불러오는데 실패했습니다.
                </div>
            `;
            return;
        }
        
        if (baselines.length === 0) {
            listCard.innerHTML = `
                <div class="card-title">베이스라인 목록</div>
                <p style="text-align: center; padding: 40px; color: #666;">
                    등록된 베이스라인이 없습니다.
                </p>
            `;
            return;
        }
        
        let html = `
            <div class="card-title">베이스라인 목록 (총 ${baselines.length}개)</div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn" style="background: var(--primary); color: white;" onclick="filterBaselines('all')">
                    전체 (${baselines.length})
                </button>
                <button class="btn" style="background: var(--success); color: white;" onclick="filterBaselines('양산중')">
                    양산중 (${baselines.filter(b => b['상태'] === '양산중').length})
                </button>
                <button class="btn" style="background: var(--info); color: white;" onclick="filterBaselines('검증중')">
                    검증중 (${baselines.filter(b => b['상태'] === '검증중').length})
                </button>
                <button class="btn" style="background: var(--warning); color: white;" onclick="filterBaselines('준비중')">
                    준비중 (${baselines.filter(b => b['상태'] === '준비중').length})
                </button>
            </div>
            
            <div id="baselines-container">
        `;
        
        baselines.forEach(baseline => {
            const statusClass = getBaselineStatusClass(baseline['상태']);
            
            html += `
                <div class="baseline-card" data-status="${baseline['상태']}" style="border: 2px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 5px 0;">${baseline['제품모델명']} ${baseline['버전명']}</h3>
                            <p style="margin: 0; color: #666;">${baseline['용도'] || '-'}</p>
                        </div>
                        <span class="badge ${statusClass}" style="font-size: 16px;">${baseline['상태']}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; color: #666; margin-bottom: 15px;">
                        <div>
                            <strong>확정일:</strong> ${baseline['확정일'] || '-'}
                        </div>
                        <div>
                            <strong>확정자:</strong> ${baseline['확정자'] || '-'}
                        </div>
                        ${baseline.assets && baseline.assets.length > 0 ? `
                        <div>
                            <strong>자산:</strong> ${baseline.assets.length}개 파일
                        </div>
                        ` : ''}
                    </div>
                    
                    ${baseline.assets && baseline.assets.length > 0 ? `
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                            📦 구성 파일 보기 (${baseline.assets.length}개)
                        </summary>
                        <div style="margin-top: 10px; padding: 10px;">
                            <table style="font-size: 14px;">
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 8px;">자산유형</th>
                                    <th style="padding: 8px;">파일명</th>
                                    <th style="padding: 8px;">버전</th>
                                    <th style="padding: 8px;">경로</th>
                                </tr>
                                ${baseline.assets.map(asset => `
                                <tr>
                                    <td style="padding: 8px;">${asset['자산유형'] || '-'}</td>
                                    <td style="padding: 8px;"><strong>${asset['파일명'] || '-'}</strong></td>
                                    <td style="padding: 8px;">${asset['버전'] || '-'}</td>
                                    <td style="padding: 8px; font-size: 12px; color: #666;">${asset['파일경로'] || '-'}</td>
                                </tr>
                                `).join('')}
                            </table>
                        </div>
                    </details>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
            </div>
        `;
        
        listCard.innerHTML = html;
        
    } catch (error) {
        console.error('베이스라인 목록 로딩 오류:', error);
        listCard.innerHTML = `
            <div class="card-title">베이스라인 목록</div>
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function getBaselineStatusClass(status) {
    const map = {
        '양산중': 'badge-success',
        '검증중': 'badge-info',
        '준비중': 'badge-warning',
        '단종': 'badge-danger'
    };
    return map[status] || 'badge-primary';
}

function filterBaselines(status) {
    const baselineCards = document.querySelectorAll('.baseline-card');
    
    baselineCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function refreshAssetsTab() {
    const container = document.getElementById('tab-assets');
    const listCard = document.getElementById('baselines-list-card');
    
    if (listCard) {
        listCard.remove();
        loadBaselinesList(container);
    }
}
