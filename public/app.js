let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentStudentId = null;
const charts = {};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setupEventListeners();
    loadStudentsFromAPI();
    showPage('dashboard');
}

function setupEventListeners() {
    const studentForm = document.getElementById('studentForm');
    if (studentForm) studentForm.addEventListener('submit', handleAddStudent);

    const editForm = document.getElementById('editForm');
    if (editForm) editForm.addEventListener('submit', handleEditStudent);

    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('branchFilter')?.addEventListener('change', applyFilters);
    document.getElementById('yearFilter')?.addEventListener('change', applyFilters);
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);

    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = e.target.value;
                applyFilters();
            }
        });
    }

    document.getElementById('darkModeToggle')?.addEventListener('click', () => {
        toggleTheme();
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
}

async function loadStudentsFromAPI() {
    try {
        const response = await fetch('/students');
        if (!response.ok) throw new Error('Failed to fetch students');

        const payload = await response.json();
        allStudents = (payload.data || []).map((s) => ({
            ...s,
            email: s.email || '',
            phone: s.phone || '',
            studentId: s.studentId || '',
            status: s.status || 'active'
        }));
        filteredStudents = [...allStudents];

        updateDashboard();
        renderStudents();
        updateReportCharts();
    } catch (error) {
        showToast('Could not load students', 'error');
        console.error(error);
    }
}

async function addStudentToAPI(studentData) {
    const response = await fetch('/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to add student');
    return result.data;
}

async function updateStudentInAPI(studentId, studentData) {
    const response = await fetch(`/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to update student');
    return result.data;
}

async function deleteStudentFromAPI(studentId) {
    const response = await fetch(`/students/${studentId}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to delete student');
    return result;
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
    document.getElementById(pageName)?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    const nav = document.querySelector(`[onclick="showPage('${pageName}'); return false;"]`);
    if (nav) nav.classList.add('active');

    if (pageName === 'dashboard') updateDashboard();
    if (pageName === 'students') renderStudents();
    if (pageName === 'reports') updateReportCharts();
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('open');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(currentTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const icon = theme === 'dark' ? 'sun' : 'moon';
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.innerHTML = `<i class="fas fa-${icon}"></i>`;

    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.classList.toggle('active', theme === 'dark');

    Object.keys(charts).forEach((key) => {
        if (charts[key]) charts[key].destroy();
        delete charts[key];
    });
    updateCharts();
    updateReportCharts();
}

function updateDashboard() {
    document.getElementById('totalStudentsCount').textContent = allStudents.length;
    document.getElementById('activeStudentsCount').textContent = allStudents.filter((s) => (s.status || 'active') === 'active').length;

    const branches = [...new Set(allStudents.map((s) => s.branch))];
    document.getElementById('totalBranchesCount').textContent = branches.length;

    const branchCounts = {};
    allStudents.forEach((s) => {
        branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
    });

    const topBranch = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('topBranchName').textContent = topBranch ? topBranch[0] : '-';

    updateRecentStudents();
    updateCharts();
}

function updateRecentStudents() {
    const tbody = document.getElementById('recentStudents');
    const recent = [...allStudents].slice(-5).reverse();

    if (!recent.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;">No students yet</td></tr>';
        return;
    }

    tbody.innerHTML = recent.map((s) => {
        const status = s.status || 'active';
        const statusClass = status === 'active' ? 'badge-active' : 'badge-inactive';
        const avatar = `<div class="avatar">${s.name.slice(0, 2).toUpperCase()}</div>`;
        return `
            <tr>
                <td>
                    <div class="student-cell">
                        ${avatar}
                        <div>
                            <div class="name">${s.name}</div>
                            <div class="email">${s.email || s.branch}</div>
                        </div>
                    </div>
                </td>
                <td>${s.studentId || s.id}</td>
                <td>${s.branch}</td>
                <td>Year ${s.year}</td>
                <td><span class="badge-status ${statusClass}"><span class="badge-dot"></span>${status === 'active' ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn view" onclick="viewStudentProfile(${s.id})" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit" onclick="editStudent(${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function applyFilters() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const branch = document.getElementById('branchFilter')?.value || '';
    const year = document.getElementById('yearFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';

    filteredStudents = allStudents.filter((s) => {
        const hay = `${s.name} ${s.id} ${s.studentId || ''} ${s.email || ''}`.toLowerCase();
        const matchSearch = !search || hay.includes(search);
        const matchBranch = !branch || s.branch === branch;
        const matchYear = !year || String(s.year) === year;
        const matchStatus = !status || (s.status || 'active') === status;
        return matchSearch && matchBranch && matchYear && matchStatus;
    });

    currentPage = 1;
    renderStudents();
}

function clearFilters() {
    ['searchInput', 'branchFilter', 'yearFilter', 'statusFilter'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    applyFilters();
}

function sortTable(column) {
    filteredStudents.sort((a, b) => {
        const av = a[column] ?? '';
        const bv = b[column] ?? '';
        if (typeof av === 'number' && typeof bv === 'number') return av - bv;
        return String(av).localeCompare(String(bv));
    });
    renderStudents();
}

function renderStudents() {
    const tbody = document.getElementById('studentsList');
    if (!filteredStudents.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No matching students found.</p>
                    </div>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const pageStudents = filteredStudents.slice(start, start + itemsPerPage);

    tbody.innerHTML = pageStudents.map((s) => {
        const status = s.status || 'active';
        const statusClass = status === 'active' ? 'badge-active' : 'badge-inactive';
        const avatar = `<div class="avatar">${s.name.slice(0, 2).toUpperCase()}</div>`;
        return `
            <tr>
                <td>
                    <div class="student-cell">
                        ${avatar}
                        <div>
                            <div class="name">${s.name}</div>
                            <div class="email">${s.email || '-'}</div>
                        </div>
                    </div>
                </td>
                <td>${s.studentId || s.id}</td>
                <td>${s.branch}</td>
                <td>Year ${s.year}</td>
                <td><span class="badge-status ${statusClass}"><span class="badge-dot"></span>${status === 'active' ? 'Active' : 'Inactive'}</span></td>
                <td style="text-align:center;">
                    <div class="actions-cell" style="justify-content:center;">
                        <button class="action-btn view" onclick="viewStudentProfile(${s.id})" title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit" onclick="openEditModal(${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="action-btn delete" onclick="deleteStudent(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updatePagination();
}

function updatePagination() {
    const total = filteredStudents.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, total);

    document.getElementById('pageStart').textContent = String(start);
    document.getElementById('pageEnd').textContent = String(end);
    document.getElementById('pageTotal').textContent = String(total);

    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    for (let p = 1; p <= totalPages; p += 1) {
        const btn = document.createElement('button');
        btn.className = `page-btn${p === currentPage ? ' active' : ''}`;
        btn.textContent = String(p);
        btn.onclick = () => {
            currentPage = p;
            renderStudents();
        };
        pageNumbers.appendChild(btn);
    }
}

function nextPage() {
    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
    if (currentPage < totalPages) {
        currentPage += 1;
        renderStudents();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage -= 1;
        renderStudents();
    }
}

async function handleAddStudent(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const branch = document.getElementById('branch').value;
    const year = document.getElementById('year').value;
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const status = document.getElementById('status').value;

    if (!name || !branch || !year) {
        showToast('Name, course, and year are required.', 'error');
        return;
    }

    try {
        const created = await addStudentToAPI({
            name,
            branch,
            year,
            email,
            phone,
            studentId,
            status
        });

        allStudents.push({ ...created, email, phone, studentId, status });
        filteredStudents = [...allStudents];

        document.getElementById('studentForm').reset();
        document.getElementById('previewAvatar').innerHTML = '<i class="fas fa-user"></i>';

        showToast('Student added successfully.', 'success');
        showPage('students');
        renderStudents();
        updateDashboard();
    } catch (error) {
        showToast(error.message || 'Failed to add student.', 'error');
    }
}

function openEditModal(studentId) {
    const s = allStudents.find((x) => x.id === studentId);
    if (!s) return;
    currentStudentId = studentId;

    document.getElementById('editName').value = s.name || '';
    document.getElementById('editEmail').value = s.email || '';
    document.getElementById('editBranch').value = s.branch || 'CSE';
    document.getElementById('editYear').value = String(s.year || '1');
    document.getElementById('editStatus').value = s.status || 'active';

    document.getElementById('editModalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('editModalOverlay').classList.remove('active');
}

async function handleEditStudent(e) {
    e.preventDefault();
    if (!currentStudentId) return;

    const payload = {
        name: document.getElementById('editName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        branch: document.getElementById('editBranch').value,
        year: document.getElementById('editYear').value,
        status: document.getElementById('editStatus').value
    };

    if (!payload.name || !payload.branch || !payload.year) {
        showToast('Name, course, and year are required.', 'error');
        return;
    }

    try {
        await updateStudentInAPI(currentStudentId, payload);
        const i = allStudents.findIndex((s) => s.id === currentStudentId);
        if (i >= 0) allStudents[i] = { ...allStudents[i], ...payload };
        filteredStudents = [...allStudents];

        closeModal();
        showToast('Student updated successfully.', 'success');
        renderStudents();
        updateDashboard();
    } catch (error) {
        showToast(error.message || 'Failed to update student.', 'error');
    }
}

function viewStudentProfile(studentId) {
    const s = allStudents.find((x) => x.id === studentId);
    if (!s) return;

    currentStudentId = s.id;
    document.getElementById('profileAvatar').innerHTML = `<span>${s.name.slice(0, 2).toUpperCase()}</span>`;

    document.getElementById('profileName').textContent = s.name;
    document.getElementById('profileId').textContent = s.studentId || s.id;
    document.getElementById('profileEmail').textContent = s.email || '-';
    document.getElementById('profilePhone').textContent = s.phone || '-';

    document.getElementById('detailName').textContent = s.name;
    document.getElementById('detailStudentId').textContent = s.studentId || s.id;
    document.getElementById('detailBranch').textContent = s.branch;
    document.getElementById('detailYear').textContent = `Year ${s.year}`;
    document.getElementById('detailEmail').textContent = s.email || '-';
    document.getElementById('detailPhone').textContent = s.phone || '-';

    showPage('student-profile');
}

function editStudent(studentId = currentStudentId) {
    openEditModal(studentId);
}

async function deleteStudent(studentId = currentStudentId) {
    if (!studentId) return;
    if (!window.confirm('Delete this student record?')) return;

    try {
        await deleteStudentFromAPI(studentId);
        allStudents = allStudents.filter((s) => s.id !== studentId);
        filteredStudents = [...allStudents];
        showToast('Student deleted successfully.', 'success');
        showPage('students');
        renderStudents();
        updateDashboard();
    } catch (error) {
        showToast(error.message || 'Failed to delete student.', 'error');
    }
}

function switchTab(tabName, triggerEl) {
    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));

    document.getElementById(tabName)?.classList.add('active');
    if (triggerEl) triggerEl.classList.add('active');
}

function exportData(format) {
    if (format === 'csv') exportAsCSV();
    if (format === 'pdf') exportAsPDF();
}

function exportAsCSV() {
    const header = 'ID,Name,Course,Year,Status,Email,Phone\n';
    const rows = filteredStudents.map((s) => {
        return `${escapeCSV(s.studentId || s.id)},${escapeCSV(s.name)},${escapeCSV(s.branch)},${escapeCSV(s.year)},${escapeCSV(s.status || 'active')},${escapeCSV(s.email || '')},${escapeCSV(s.phone || '')}`;
    });

    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully.', 'success');
}

function exportAsPDF() {
    const table = document.querySelector('#students .data-table');
    if (!table) return;

    const opts = {
        margin: 10,
        filename: `students_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opts).from(table).save();
    showToast('PDF exported successfully.', 'success');
}

function escapeCSV(value) {
    const s = String(value ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const icon = type === 'success' ? 'check-circle' : 'triangle-exclamation';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i class="fas fa-${icon}"></i></span>
        <span>${message}</span>
        <button class="toast-close" aria-label="Close"><i class="fas fa-xmark"></i></button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);
    setTimeout(() => removeToast(toast), 4000);
}

function removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
}

function updateCharts() {
    updateBranchChart();
    updateYearChart();
}

function updateBranchChart() {
    const canvas = document.getElementById('branchChart');
    if (!canvas) return;

    const counts = {};
    allStudents.forEach((s) => {
        counts[s.branch] = (counts[s.branch] || 0) + 1;
    });

    if (charts.branch) charts.branch.destroy();
    charts.branch = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#4F46E5', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
                borderWidth: 2,
                borderColor: isDarkTheme() ? '#1E293B' : '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getChartColor(),
                        font: { family: 'Inter' }
                    }
                }
            }
        }
    });
}

function updateYearChart() {
    const canvas = document.getElementById('yearChart');
    if (!canvas) return;

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    allStudents.forEach((s) => {
        const y = Number(s.year);
        if (counts[y] !== undefined) counts[y] += 1;
    });

    if (charts.year) charts.year.destroy();
    charts.year = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
            datasets: [{
                label: 'Students',
                data: [counts[1], counts[2], counts[3], counts[4]],
                backgroundColor: '#4F46E5',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: getChartColor(), font: { family: 'Inter' } } }
            },
            scales: {
                x: { ticks: { color: getChartColor() }, grid: { color: getGridColor() } },
                y: { ticks: { color: getChartColor() }, grid: { color: getGridColor() } }
            }
        }
    });
}

function updateReportCharts() {
    const branchCanvas = document.getElementById('reportBranchChart');
    const yearCanvas = document.getElementById('reportYearChart');
    if (!branchCanvas || !yearCanvas) return;

    const branchCounts = {};
    const yearCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

    allStudents.forEach((s) => {
        branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
        const y = Number(s.year);
        if (yearCounts[y] !== undefined) yearCounts[y] += 1;
    });

    if (charts.reportBranch) charts.reportBranch.destroy();
    charts.reportBranch = new Chart(branchCanvas, {
        type: 'pie',
        data: {
            labels: Object.keys(branchCounts),
            datasets: [{
                data: Object.values(branchCounts),
                backgroundColor: ['#4F46E5', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
                borderWidth: 2,
                borderColor: isDarkTheme() ? '#1E293B' : '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: getChartColor(), font: { family: 'Inter' } } }
            }
        }
    });

    if (charts.reportYear) charts.reportYear.destroy();
    charts.reportYear = new Chart(yearCanvas, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
            datasets: [{
                label: 'Students',
                data: [yearCounts[1], yearCounts[2], yearCounts[3], yearCounts[4]],
                backgroundColor: '#8B5CF6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: getChartColor(), font: { family: 'Inter' } } }
            },
            scales: {
                x: { ticks: { color: getChartColor() }, grid: { color: getGridColor() } },
                y: { ticks: { color: getChartColor() }, grid: { color: getGridColor() } }
            }
        }
    });
}

function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

function getChartColor() {
    return isDarkTheme() ? '#94A3B8' : '#6B7280';
}

function getGridColor() {
    return isDarkTheme() ? '#334155' : '#E5E7EB';
}
