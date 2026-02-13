// 프로젝트 탭 관리

async function initProjectsTab(container) {
    showPermissionInfo(container, SESSION.permission);
    
    // ADMIN만 프로젝트 생성 가능
    if (SESSION.permission === 'ADMIN') {
        container.innerHTML += `
            <div class="card">
                <div class="card-title">📋 프로젝트 관리</div>
                <button class="btn btn-primary" onclick="showProjectCreateForm()">
                    ➕ 새 프로젝트 생성
                </button>
            </div>
        `;
    }
    
    // 프로젝트 목록
    loadProjectsList(container);
}

function showProjectCreateForm() {
    const formCard = document.createElement('div');
    formCard.className = 'card';
    formCard.id = 'project-create-form';
    formCard.innerHTML = `
        <div class="card-title">➕ 새 프로젝트 생성</div>
        
        <div id="project-alert"></div>
        
        <form id="project-form">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">프로젝트명 *</label>
                    <input type="text" class="form-input" id="project-name" required 
                           placeholder="예: A사 충전기 커스터마이징">
                </div>
                
                <div class="form-group">
                    <label class="form-label">고객사 *</label>
                    <input type="text" class="form-input" id="project-customer" required 
                           placeholder="예: A사">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">PM</label>
                    <select class="form-select" id="project-pm">
                        <option value="">선택하세요</option>
                        <option value="M001">김하드</option>
                        <option value="M005">정큐에</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">개발범위 *</label>
                    <input type="text" class="form-input" id="project-scope" required 
                           placeholder="예: APP만, Full 개발">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">착수일 *</label>
                    <input type="date" class="form-input" id="project-start" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">예상완료일 *</label>
                    <input type="date" class="form-input" id="project-end" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Git 링크</label>
                <input type="text" class="form-input" id="project-git" 
                       placeholder="https://github.com/...">
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" id="project-submit-btn" style="flex: 1;">
                    ➕ 프로젝트 생성
                </button>
                <button type="button" class="btn btn-danger" onclick="hideProjectCreateForm()" style="flex: 0 0 auto;">
                    취소
                </button>
            </div>
        </form>
    `;
    
    const container = document.getElementById('tab-projects');
    const firstCard = container.querySelector('.card');
    
    if (firstCard) {
        firstCard.after(formCard);
    } else {
        container.appendChild(formCard);
    }
    
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
}

function hideProjectCreateForm() {
    const form = document.getElementById('project-create-form');
    if (form) {
        form.remove();
    }
}

async function handleProjectSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('project-submit-btn');
    const alertDiv = document.getElementById('project-alert');
    
    submitBtn.disabled = true;
    submitBtn.textContent = '생성 중...';
    
    try {
        const projectData = {
            projectName: document.getElementById('project-name').value,
            customer: document.getElementById('project-customer').value,
            pmId: document.getElementById('project-pm').value,
            scope: document.getElementById('project-scope').value,
            startDate: document.getElementById('project-start').value,
            expectedEndDate: document.getElementById('project-end').value,
            gitLink: document.getElementById('project-git').value
        };
        
        const result = await addProject(projectData);
        
        if (result && result.success) {
            alertDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ ${result.message} (${result.id})
                </div>
            `;
            
            document.getElementById('project-form').reset();
            
            setTimeout(() => {
                hideProjectCreateForm();
                refreshProjectsTab();
            }, 2000);
            
        } else {
            alertDiv.innerHTML = `
                <div class="alert alert-danger">
                    ❌ ${result?.error || '프로젝트 생성에 실패했습니다.'}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('프로젝트 생성 오류:', error);
        alertDiv.innerHTML = `
            <div class="alert alert-danger">
                ❌ 서버 연결에 실패했습니다.
            </div>
        `;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '➕ 프로젝트 생성';
    }
}

async function loadProjectsList(container) {
    const listCard = document.createElement('div');
    listCard.className = 'card';
    listCard.id = 'projects-list-card';
    listCard.innerHTML = `
        <div class="card-title">프로젝트 목록</div>
        <div class="loading">프로젝트 데이터 로딩 중...</div>
    `;
    
    container.appendChild(listCard);
    
    try {
        const projects = await getProjects();
        
        if (!projects || projects.error) {
            listCard.innerHTML = `
                <div class="card-title">프로젝트 목록</div>
                <div class="alert alert-danger">
                    데이터를 불러오는데 실패했습니다.
                </div>
            `;
            return;
        }
        
        if (projects.length === 0) {
            listCard.innerHTML = `
                <div class="card-title">프로젝트 목록</div>
                <p style="text-align: center; padding: 40px; color: #666;">
                    등록된 프로젝트가 없습니다.
                </p>
            `;
            return;
        }
        
        let html = `
            <div class="card-title">프로젝트 목록 (총 ${projects.length}개)</div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn" style="background: var(--primary); color: white;" onclick="filterProjects('all')">
                    전체 (${projects.length})
                </button>
                <button class="btn" style="background: var(--info); color: white;" onclick="filterProjects('진행중')">
                    진행중 (${projects.filter(p => p['상태'] === '진행중').length})
                </button>
                <button class="btn" style="background: var(--success); color: white;" onclick="filterProjects('완료')">
                    완료 (${projects.filter(p => p['상태'] === '완료').length})
                </button>
                <button class="btn" style="background: var(--danger); color: white;" onclick="filterProjects('지연')">
                    지연 (${projects.filter(p => p['상태'] === '지연').length})
                </button>
            </div>
            
            <div id="projects-container">
        `;
        
        projects.forEach(project => {
            const statusClass = getProjectStatusClass(project['상태']);
            
            html += `
                <div class="project-card" data-status="${project['상태']}" style="border: 2px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <h3 style="margin: 0; flex: 1;">${project['프로젝트명']}</h3>
                        <span class="badge ${statusClass}" style="font-size: 16px;">${project['상태']}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; color: #666;">
                        <div>
                            <strong>고객사:</strong> ${project['고객사'] || '-'}
                        </div>
                        <div>
                            <strong>PM:</strong> ${project['PM_ID'] || '-'}
                        </div>
                        <div>
                            <strong>착수일:</strong> ${project['착수일'] || '-'}
                        </div>
                        <div>
                            <strong>예상완료:</strong> ${project['예상완료일'] || '-'}
                        </div>
                        <div>
                            <strong>개발범위:</strong> ${project['개발범위'] || '-'}
                        </div>
                        ${project['Git링크'] ? `
                        <div>
                            <a href="${project['Git링크']}" target="_blank" style="color: var(--primary);">
                                📎 Git 링크
                            </a>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
        `;
        
        listCard.innerHTML = html;
        
    } catch (error) {
        console.error('프로젝트 목록 로딩 오류:', error);
        listCard.innerHTML = `
            <div class="card-title">프로젝트 목록</div>
            <div class="alert alert-danger">
                데이터를 불러오는데 실패했습니다.
            </div>
        `;
    }
}

function getProjectStatusClass(status) {
    const map = {
        '진행중': 'badge-primary',
        '완료': 'badge-success',
        '지연': 'badge-danger',
        '보류': 'badge-warning'
    };
    return map[status] || 'badge-primary';
}

function filterProjects(status) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function refreshProjectsTab() {
    const container = document.getElementById('tab-projects');
    const listCard = document.getElementById('projects-list-card');
    
    if (listCard) {
        listCard.remove();
        loadProjectsList(container);
    }
}
