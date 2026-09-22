/**
 * StudyFlow Kanban - Modern, Stable & Animated Study Management System
 * Features:
 * - Thonburi Font Aesthetic & Micro-animations
 * - All Tasks Overview vs. My Individual Tasks View
 * - Pure Vector Icons (Lucide Icons) - ZERO Emojis
 * - Overall Study Progress Bar with Animated Shimmer
 * - Quick Filter Chips for Fast Access
 * - Dual Mode Drag & Drop + 1-Click Status Shift Arrows
 * - LocalStorage Persistence & Rich Sample Coursework
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY_TASKS = 'studyflow_tasks_v3';
  const STORAGE_KEY_THEME = 'studyflow_theme';

  const STATUS_ORDER = ['todo', 'in-progress', 'review', 'done'];

  const STATUS_CONFIG = {
    'todo': { label: 'รอดำเนินการ', icon: 'clipboard-list' },
    'in-progress': { label: 'กำลังทำ', icon: 'play-circle' },
    'review': { label: 'รอตรวจ / ตรวจทาน', icon: 'check-square' },
    'done': { label: 'ส่งแล้ว / เสร็จสิ้น', icon: 'check-circle-2' }
  };

  const PRIORITY_CONFIG = {
    'urgent': { label: 'ด่วนมาก', class: 'badge-priority-urgent', icon: 'alert-triangle', weight: 4 },
    'high': { label: 'สูง', class: 'badge-priority-high', icon: 'arrow-up', weight: 3 },
    'medium': { label: 'ปานกลาง', class: 'badge-priority-medium', icon: 'minus', weight: 2 },
    'low': { label: 'ต่ำ', class: 'badge-priority-low', icon: 'arrow-down', weight: 1 }
  };

  // --- App State ---
  let state = {
    tasks: [],
    currentView: 'all', // 'all' | 'my' (individual tasks)
    theme: 'dark',
    searchQuery: '',
    activeChip: 'all', // 'all' | 'individual' | 'group' | 'urgent' | 'overdue' | 'today'
    filterSubject: 'all',
    filterType: 'all', // 'all' | 'individual' | 'group'
    filterPriority: 'all',
    filterDeadline: 'all',
    sortBy: 'deadline-asc',
    draggedTaskId: null,
    editingTaskId: null,
    viewingTaskId: null
  };

  // --- Sample Study Data Generator ---
  function getSampleStudyTasks() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 2);

    const todayDate = new Date(today);

    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 2);

    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 5);

    const futureDate3 = new Date(today);
    futureDate3.setDate(today.getDate() + 9);

    return [
      {
        id: 'study-101',
        title: 'อ่านหนังสือและทำสรุปสูตรเตรียมสอบ Midterm',
        subject: 'Calculus 1',
        taskType: 'individual',
        description: 'ทบทวนหัวข้อ Integration by Parts และ Differential Equations พร้อมทำโจทย์ท้ายบท 20 ข้อ',
        createdDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4)),
        deadline: formatDate(futureDate1),
        status: 'in-progress',
        priority: 'urgent'
      },
      {
        id: 'study-102',
        title: 'ส่งแบบฝึกหัด Lab: Binary Search Trees & Heap',
        subject: 'Data Structures & Algorithms',
        taskType: 'individual',
        description: 'เขียนโค้ดภาษา C++ ส่งผ่านระบบ Grader ของอาจารย์ พร้อมแนบรายงานการวิเคราะห์ Time Complexity',
        createdDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2)),
        deadline: formatDate(todayDate), // Due Today!
        status: 'review',
        priority: 'high'
      },
      {
        id: 'study-103',
        title: 'ทำรายงานกลุ่มและสไลด์วิเคราะห์ AI Ethics & Data Privacy',
        subject: 'AI & Society',
        taskType: 'group',
        description: 'ประชุมกลุ่มเพื่อแบ่งหัวข้อ Case Study กฎหมาย PDPA และการกำกับดูแล AI โมเดลขนาดใหญ่',
        createdDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)),
        deadline: formatDate(futureDate2),
        status: 'in-progress',
        priority: 'high'
      },
      {
        id: 'study-104',
        title: 'ทบทวนสรุปชีทวิชาฟิสิกส์เรื่องคลื่นและเสียง',
        subject: 'Physics for Engineers',
        taskType: 'individual',
        description: 'สรุปสูตร Doppler Effect และคลื่นนิ่ง เตรียมพร้อมสำหรับการควิซย่อยในคาบถัดไป',
        createdDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5)),
        deadline: formatDate(pastDate), // Overdue!
        status: 'todo',
        priority: 'high'
      },
      {
        id: 'study-105',
        title: 'ส่งแบบร่าง Proposal โครงงานกลุ่มวิชาสถิติประยุกต์',
        subject: 'Applied Statistics',
        taskType: 'group',
        description: 'จัดทำแบบสอบถามออนไลน์และออกแบบกลุ่มตัวอย่างเพื่อใช้วิเคราะห์การถดถอยพหุคูณ (Multiple Regression)',
        createdDate: formatDate(todayDate),
        deadline: formatDate(futureDate3),
        status: 'todo',
        priority: 'medium'
      },
      {
        id: 'study-106',
        title: 'เขียน Essay ภาษาอังกฤษ หัวข้อ Climate Technology',
        subject: 'Academic English',
        taskType: 'individual',
        description: 'บทความความยาว 800 คำ พร้อมอ้างอิงแหล่งข้อมูลรูปแบบ APA 7th Edition เรียบร้อย',
        createdDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)),
        deadline: formatDate(pastDate),
        status: 'done',
        priority: 'low'
      }
    ];
  }

  // --- Date Calculations & Formatting ---
  function parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  }

  function getDaysDiff(targetDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = parseLocalDate(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return '-';
    const date = parseLocalDate(dateStr);
    const monthsThai = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = date.getDate();
    const month = monthsThai[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }

  function getDeadlineBadge(deadlineStr, status) {
    if (status === 'done') {
      return {
        text: 'เสร็จสิ้นแล้ว',
        icon: 'check-circle-2',
        className: 'deadline-done'
      };
    }

    const diff = getDaysDiff(deadlineStr);

    if (diff < 0) {
      const daysOver = Math.abs(diff);
      return {
        text: `เกินกำหนด (${daysOver} วัน)`,
        icon: 'alert-triangle',
        className: 'deadline-overdue'
      };
    } else if (diff === 0) {
      return {
        text: 'ครบกำหนดวันนี้',
        icon: 'clock',
        className: 'deadline-today'
      };
    } else if (diff === 1) {
      return {
        text: 'ครบกำหนดพรุ่งนี้',
        icon: 'clock',
        className: 'deadline-soon'
      };
    } else if (diff <= 3) {
      return {
        text: `อีก ${diff} วัน`,
        icon: 'calendar',
        className: 'deadline-soon'
      };
    } else {
      return {
        text: formatDisplayDate(deadlineStr),
        icon: 'calendar',
        className: 'deadline-normal'
      };
    }
  }

  // --- LocalStorage & Theme ---
  function loadInitialState() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    state.theme = savedTheme;
    applyTheme(state.theme);

    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      try {
        state.tasks = JSON.parse(savedTasks);
      } catch (e) {
        state.tasks = getSampleStudyTasks();
        saveTasks();
      }
    } else {
      state.tasks = getSampleStudyTasks();
      saveTasks();
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);

    const darkIcon = document.querySelector('.theme-icon-dark');
    const lightIcon = document.querySelector('.theme-icon-light');
    const textLabel = document.getElementById('theme-toggle-text');

    if (theme === 'dark') {
      if (darkIcon) darkIcon.style.display = 'inline-block';
      if (lightIcon) lightIcon.style.display = 'none';
      if (textLabel) textLabel.textContent = 'โหมดมืด';
    } else {
      if (darkIcon) darkIcon.style.display = 'none';
      if (lightIcon) lightIcon.style.display = 'inline-block';
      if (textLabel) textLabel.textContent = 'โหมดสว่าง';
    }

    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'error') iconName = 'x-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    refreshIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px) scale(0.95)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Filtering & Sorting ---
  function getFilteredTasks() {
    let result = [...state.tasks];

    // 1. View filter: All Tasks vs My Individual Tasks
    if (state.currentView === 'my') {
      result = result.filter(t => t.taskType === 'individual');
    }

    // 2. Quick Chips Filter
    if (state.activeChip === 'individual') {
      result = result.filter(t => t.taskType === 'individual');
    } else if (state.activeChip === 'group') {
      result = result.filter(t => t.taskType === 'group');
    } else if (state.activeChip === 'urgent') {
      result = result.filter(t => t.priority === 'urgent');
    } else if (state.activeChip === 'overdue') {
      result = result.filter(t => getDaysDiff(t.deadline) < 0 && t.status !== 'done');
    } else if (state.activeChip === 'today') {
      result = result.filter(t => getDaysDiff(t.deadline) === 0 && t.status !== 'done');
    }

    // 3. Search query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // 4. Dropdown Filters
    if (state.filterSubject !== 'all') {
      result = result.filter(t => t.subject === state.filterSubject);
    }

    if (state.filterType !== 'all') {
      result = result.filter(t => t.taskType === state.filterType);
    }

    if (state.filterPriority !== 'all') {
      result = result.filter(t => t.priority === state.filterPriority);
    }

    if (state.filterDeadline !== 'all') {
      result = result.filter(t => {
        const diff = getDaysDiff(t.deadline);
        if (state.filterDeadline === 'overdue') return diff < 0 && t.status !== 'done';
        if (state.filterDeadline === 'today') return diff === 0 && t.status !== 'done';
        if (state.filterDeadline === 'week') return diff >= 0 && diff <= 7 && t.status !== 'done';
        return true;
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (state.sortBy === 'deadline-asc') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (state.sortBy === 'deadline-desc') {
        return new Date(b.deadline) - new Date(a.deadline);
      }
      if (state.sortBy === 'priority-desc') {
        const weightA = PRIORITY_CONFIG[a.priority]?.weight || 0;
        const weightB = PRIORITY_CONFIG[b.priority]?.weight || 0;
        return weightB - weightA;
      }
      if (state.sortBy === 'created-desc') {
        return new Date(b.createdDate) - new Date(a.createdDate);
      }
      if (state.sortBy === 'created-asc') {
        return new Date(a.createdDate) - new Date(b.createdDate);
      }
      return 0;
    });

    return result;
  }

  // --- Dynamic Subject Filter Population ---
  function updateSubjectFilterOptions() {
    const filterSelect = document.getElementById('filter-subject');
    if (!filterSelect) return;

    const subjects = new Set();
    state.tasks.forEach(t => {
      if (t.subject && t.subject.trim()) {
        subjects.add(t.subject.trim());
      }
    });

    const currentVal = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">ทุกรายวิชา</option>';

    Array.from(subjects).sort().forEach(subj => {
      const opt = document.createElement('option');
      opt.value = subj;
      opt.textContent = subj;
      if (subj === currentVal) opt.selected = true;
      filterSelect.appendChild(opt);
    });
  }

  // --- Render Functions ---
  function renderAll() {
    renderViewHeaders();
    renderStatsAndProgress();
    updateSubjectFilterOptions();
    renderBoard();
    refreshIcons();
  }

  function renderViewHeaders() {
    const titleEl = document.getElementById('current-view-title');
    const descEl = document.getElementById('current-view-desc');
    const tabAll = document.getElementById('tab-all-tasks');
    const tabMy = document.getElementById('tab-my-tasks');

    const totalAll = state.tasks.length;
    const totalMy = state.tasks.filter(t => t.taskType === 'individual').length;

    const allBadge = document.getElementById('all-tasks-count');
    const myBadge = document.getElementById('my-tasks-count');
    if (allBadge) allBadge.textContent = totalAll;
    if (myBadge) myBadge.textContent = totalMy;

    if (state.currentView === 'my') {
      tabAll.classList.remove('active');
      tabMy.classList.add('active');
      titleEl.innerHTML = `งานเดี่ยวของฉัน <span style="font-size:1.05rem; font-weight:normal; opacity:0.85;">(การบ้านและงานที่ต้องทำส่งเอง)</span>`;
      descEl.textContent = 'โฟกัสและจัดการเฉพาะงานเดี่ยวและการบ้านที่คุณต้องทำส่งเอง สามารถลากย้ายสถานะและทำเครื่องหมายส่งแล้วได้ทันที';
    } else {
      tabAll.classList.add('active');
      tabMy.classList.remove('active');
      titleEl.textContent = 'ภาพรวมงานเรียนทั้งหมด (All Subjects)';
      descEl.textContent = 'ติดตามการบ้าน รายงาน โปรเจกต์ และการเตรียมสอบทุกวิชาในรูปแบบ Kanban พร้อมระบบ Drag & Drop และปุ่มเลื่อนสถานะในคลิกเดียว';
    }
  }

  function renderStatsAndProgress() {
    const baseTasks = state.currentView === 'my'
      ? state.tasks.filter(t => t.taskType === 'individual')
      : state.tasks;

    const total = baseTasks.length;
    const todo = baseTasks.filter(t => t.status === 'todo').length;
    const inProgress = baseTasks.filter(t => t.status === 'in-progress').length;
    const done = baseTasks.filter(t => t.status === 'done').length;
    const overdueOrToday = baseTasks.filter(t => {
      if (t.status === 'done') return false;
      const diff = getDaysDiff(t.deadline);
      return diff <= 0;
    }).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-todo').textContent = todo;
    document.getElementById('stat-in-progress').textContent = inProgress;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-overdue').textContent = overdueOrToday;

    // Calculate Overall Progress
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    const fillEl = document.getElementById('progress-fill');
    const textEl = document.getElementById('progress-percentage-text');

    if (fillEl) fillEl.style.width = `${percentage}%`;
    if (textEl) textEl.textContent = `${percentage}% สำเร็จแล้ว (${done} จาก ${total} งาน)`;
  }

  function renderBoard() {
    const filteredTasks = getFilteredTasks();

    STATUS_ORDER.forEach(status => {
      const container = document.getElementById(`cards-${status}`);
      const counter = document.getElementById(`count-${status}`);
      if (!container) return;

      const columnTasks = filteredTasks.filter(t => t.status === status);
      if (counter) counter.textContent = columnTasks.length;

      container.innerHTML = '';

      if (columnTasks.length === 0) {
        container.innerHTML = `
          <div class="column-empty-state">
            <i data-lucide="inbox"></i>
            <span>ไม่มีงานในสถานะนี้</span>
          </div>
        `;
        return;
      }

      columnTasks.forEach(task => {
        const card = createCardElement(task);
        container.appendChild(card);
      });
    });
  }

  function createCardElement(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority || 'medium'}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);
    card.setAttribute('id', `task-card-${task.id}`);

    const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['medium'];
    const deadlineInfo = getDeadlineBadge(task.deadline, task.status);
    const isGroup = task.taskType === 'group';

    // Step Shift Logic (Previous and Next status)
    const currentStatusIndex = STATUS_ORDER.indexOf(task.status);
    const hasPrev = currentStatusIndex > 0;
    const hasNext = currentStatusIndex < STATUS_ORDER.length - 1;
    const prevStatus = hasPrev ? STATUS_ORDER[currentStatusIndex - 1] : null;
    const nextStatus = hasNext ? STATUS_ORDER[currentStatusIndex + 1] : null;

    card.innerHTML = `
      <div class="card-top-row">
        <div class="card-badges">
          ${task.subject ? `
            <span class="badge badge-subject">
              <i data-lucide="book-open"></i>
              <span>${escapeHtml(task.subject)}</span>
            </span>` : ''
          }
          <span class="badge ${isGroup ? 'badge-type-group' : 'badge-type-individual'}">
            <i data-lucide="${isGroup ? 'users' : 'user'}"></i>
            <span>${isGroup ? 'งานกลุ่ม' : 'งานเดี่ยว'}</span>
          </span>
          <span class="badge ${priorityInfo.class}">
            <i data-lucide="${priorityInfo.icon}"></i>
            <span>${priorityInfo.label}</span>
          </span>
        </div>
        <div class="card-actions-quick">
          ${hasPrev ? `
            <button class="card-action-icon-btn btn-step-action btn-step-prev" data-id="${task.id}" data-target="${prevStatus}" title="ย้อนกลับไป: ${STATUS_CONFIG[prevStatus].label}">
              <i data-lucide="chevron-left"></i>
            </button>` : ''
          }
          ${hasNext ? `
            <button class="card-action-icon-btn btn-step-action btn-step-next" data-id="${task.id}" data-target="${nextStatus}" title="เลื่อนไป: ${STATUS_CONFIG[nextStatus].label}">
              <i data-lucide="chevron-right"></i>
            </button>` : ''
          }
          <button class="card-action-icon-btn btn-quick-done" data-id="${task.id}" title="${task.status === 'done' ? 'เปลี่ยนกลับมาทำใหม่' : 'ทำเครื่องหมายว่าส่งแล้ว'}">
            <i data-lucide="${task.status === 'done' ? 'rotate-ccw' : 'check'}"></i>
          </button>
          <button class="card-action-icon-btn btn-quick-edit" data-id="${task.id}" title="แก้ไขงาน">
            <i data-lucide="edit-3"></i>
          </button>
        </div>
      </div>

      <h3 class="card-title">${escapeHtml(task.title)}</h3>
      ${task.description ? `<p class="card-desc">${escapeHtml(task.description)}</p>` : ''}

      <div class="card-bottom-row">
        <span class="deadline-pill ${deadlineInfo.className}">
          <i data-lucide="${deadlineInfo.icon}"></i>
          <span>${deadlineInfo.text}</span>
        </span>
        <span class="card-created-date" title="วันที่สั่ง: ${formatDisplayDate(task.createdDate)}">
          <i data-lucide="calendar"></i>
          <span>${formatDisplayDate(task.createdDate)}</span>
        </span>
      </div>
    `;

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    // Click to open details
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-action-icon-btn')) return;
      openDetailsModal(task.id);
    });

    // 1-Click Move Step Buttons
    const stepPrevBtn = card.querySelector('.btn-step-prev');
    if (stepPrevBtn) {
      stepPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveTaskToStatus(task.id, prevStatus);
      });
    }

    const stepNextBtn = card.querySelector('.btn-step-next');
    if (stepNextBtn) {
      stepNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveTaskToStatus(task.id, nextStatus);
      });
    }

    // Quick Done
    const quickDoneBtn = card.querySelector('.btn-quick-done');
    if (quickDoneBtn) {
      quickDoneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskDone(task.id);
      });
    }

    // Quick Edit
    const quickEditBtn = card.querySelector('.btn-quick-edit');
    if (quickEditBtn) {
      quickEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(task.id);
      });
    }

    return card;
  }

  // --- Drag & Drop Handlers ---
  function handleDragStart(e) {
    state.draggedTaskId = this.getAttribute('data-id');
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', state.draggedTaskId);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    state.draggedTaskId = null;
    document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
  }

  function initDropZones() {
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        column.classList.add('drag-over');
      });

      column.addEventListener('dragleave', (e) => {
        if (!column.contains(e.relatedTarget)) {
          column.classList.remove('drag-over');
        }
      });

      column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');
        const targetStatus = column.getAttribute('data-status');
        const taskId = e.dataTransfer.getData('text/plain') || state.draggedTaskId;

        if (taskId && targetStatus) {
          moveTaskToStatus(taskId, targetStatus);
        }
      });
    });
  }

  function moveTaskToStatus(taskId, newStatus) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === newStatus) return;

    const newStatusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
    task.status = newStatus;
    saveTasks();
    renderAll();

    showToast(`ย้าย "${task.title}" ไปที่ "${newStatusLabel}" แล้ว`, 'success');
  }

  function toggleTaskDone(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'done') {
      task.status = 'in-progress';
      showToast(`เปลี่ยนสถานะ "${task.title}" เป็นกำลังทำ`, 'info');
    } else {
      task.status = 'done';
      showToast(`ทำเครื่องหมาย "${task.title}" ส่งเสร็จเรียบร้อย!`, 'success');
    }

    saveTasks();
    renderAll();
  }

  // --- Modal Logic ---
  function openCreateModal(defaultStatus = 'todo') {
    state.editingTaskId = null;
    const modalHeading = document.getElementById('modal-heading');
    const form = document.getElementById('task-form');
    form.reset();

    modalHeading.textContent = 'เพิ่มงานเรียนใหม่';

    const today = new Date().toISOString().split('T')[0];
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 3);
    const deadlineStr = defaultDeadline.toISOString().split('T')[0];

    document.getElementById('task-id').value = '';
    document.getElementById('task-created-input').value = today;
    document.getElementById('task-deadline-input').value = deadlineStr;
    document.getElementById('task-status-select').value = defaultStatus;
    document.getElementById('task-priority-select').value = 'medium';
    document.getElementById('task-type-select').value = 'individual';

    document.getElementById('task-modal-overlay').style.display = 'flex';
    document.getElementById('task-modal-overlay').setAttribute('aria-hidden', 'false');
    document.getElementById('task-title-input').focus();
    refreshIcons();
  }

  function openEditModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.editingTaskId = taskId;
    const modalHeading = document.getElementById('modal-heading');
    modalHeading.textContent = 'แก้ไขงานเรียน';

    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title-input').value = task.title || '';
    document.getElementById('task-subject-input').value = task.subject || '';
    document.getElementById('task-type-select').value = task.taskType || 'individual';
    document.getElementById('task-desc-input').value = task.description || '';
    document.getElementById('task-created-input').value = task.createdDate || '';
    document.getElementById('task-deadline-input').value = task.deadline || '';
    document.getElementById('task-status-select').value = task.status || 'todo';
    document.getElementById('task-priority-select').value = task.priority || 'medium';

    closeDetailsModal();

    document.getElementById('task-modal-overlay').style.display = 'flex';
    document.getElementById('task-modal-overlay').setAttribute('aria-hidden', 'false');
    document.getElementById('task-title-input').focus();
    refreshIcons();
  }

  function closeTaskModal() {
    document.getElementById('task-modal-overlay').style.display = 'none';
    document.getElementById('task-modal-overlay').setAttribute('aria-hidden', 'true');
    state.editingTaskId = null;
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('task-title-input').value.trim();
    const subject = document.getElementById('task-subject-input').value.trim();
    const taskType = document.getElementById('task-type-select').value;
    const description = document.getElementById('task-desc-input').value.trim();
    const createdDate = document.getElementById('task-created-input').value;
    const deadline = document.getElementById('task-deadline-input').value;
    const status = document.getElementById('task-status-select').value;
    const priority = document.getElementById('task-priority-select').value;

    if (!title || !subject || !createdDate || !deadline) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
      return;
    }

    if (state.editingTaskId) {
      const taskIndex = state.tasks.findIndex(t => t.id === state.editingTaskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          title,
          subject,
          taskType,
          description,
          createdDate,
          deadline,
          status,
          priority
        };
        showToast('อัปเดตงานเรียนเรียบร้อยแล้ว', 'success');
      }
    } else {
      const newTask = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        title,
        subject,
        taskType,
        description,
        createdDate,
        deadline,
        status,
        priority
      };
      state.tasks.unshift(newTask);
      showToast('เพิ่มงานเรียนใหม่สำเร็จ!', 'success');
    }

    saveTasks();
    renderAll();
    closeTaskModal();
  }

  // --- Details Modal ---
  function openDetailsModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.viewingTaskId = taskId;

    const overlay = document.getElementById('task-details-overlay');
    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-desc');
    const badgesEl = document.getElementById('detail-header-badges');
    const subjectEl = document.getElementById('detail-subject');
    const typeEl = document.getElementById('detail-type');
    const createdDateEl = document.getElementById('detail-created-date');
    const deadlineEl = document.getElementById('detail-deadline');
    const statusEl = document.getElementById('detail-status');
    const priorityEl = document.getElementById('detail-priority');
    const toggleDoneBtnText = document.getElementById('btn-toggle-done-text');

    const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['medium'];
    const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
    const deadlineInfo = getDeadlineBadge(task.deadline, task.status);
    const isGroup = task.taskType === 'group';

    titleEl.textContent = task.title;
    descEl.textContent = task.description || 'ไม่มีรายละเอียดเพิ่มเติม';

    badgesEl.innerHTML = `
      <span class="badge badge-subject">
        <i data-lucide="book-open"></i>
        <span>${escapeHtml(task.subject)}</span>
      </span>
      <span class="badge ${isGroup ? 'badge-type-group' : 'badge-type-individual'}">
        <i data-lucide="${isGroup ? 'users' : 'user'}"></i>
        <span>${isGroup ? 'งานกลุ่ม' : 'งานเดี่ยว'}</span>
      </span>
      <span class="badge ${priorityInfo.class}">
        <i data-lucide="${priorityInfo.icon}"></i>
        <span>${priorityInfo.label}</span>
      </span>
      <span class="deadline-pill ${deadlineInfo.className}">
        <i data-lucide="${deadlineInfo.icon}"></i>
        <span>${deadlineInfo.text}</span>
      </span>
    `;

    subjectEl.textContent = task.subject || '-';
    typeEl.textContent = isGroup ? 'งานกลุ่ม (โปรเจกต์ร่วม)' : 'งานเดี่ยว (งานของฉัน)';
    createdDateEl.textContent = formatDisplayDate(task.createdDate);
    deadlineEl.textContent = `${formatDisplayDate(task.deadline)} (${deadlineInfo.text})`;
    statusEl.textContent = statusInfo.label;
    priorityEl.textContent = priorityInfo.label;

    if (task.status === 'done') {
      toggleDoneBtnText.textContent = 'ย้ายกลับมาทำใหม่';
    } else {
      toggleDoneBtnText.textContent = 'ทำเครื่องหมายส่งแล้ว';
    }

    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    refreshIcons();
  }

  function closeDetailsModal() {
    const overlay = document.getElementById('task-details-overlay');
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    state.viewingTaskId = null;
  }

  function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`คุณต้องการลบงาน "${task.title}" ใช่หรือไม่?`)) {
      state.tasks = state.tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderAll();
      closeDetailsModal();
      showToast('ลบงานเรียบร้อยแล้ว', 'info');
    }
  }

  // --- Event Listeners Setup ---
  function initEventListeners() {
    // Tab switching
    document.getElementById('tab-all-tasks').addEventListener('click', () => {
      state.currentView = 'all';
      renderAll();
    });

    document.getElementById('tab-my-tasks').addEventListener('click', () => {
      state.currentView = 'my';
      renderAll();
    });

    // Theme toggle button
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
      showToast(`เปลี่ยนเป็นธีม ${state.theme === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง'} แล้ว`, 'info');
    });

    // Quick Filter Chips
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.activeChip = e.currentTarget.getAttribute('data-chip');
        renderBoard();
        refreshIcons();
      });
    });

    // Global Search
    const searchInput = document.getElementById('global-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      clearSearchBtn.style.display = state.searchQuery ? 'inline-flex' : 'none';
      renderBoard();
      refreshIcons();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderBoard();
      refreshIcons();
      searchInput.focus();
    });

    // Subject Filter
    document.getElementById('filter-subject').addEventListener('change', (e) => {
      state.filterSubject = e.target.value;
      renderBoard();
      refreshIcons();
    });

    // Task Type Filter
    document.getElementById('filter-type').addEventListener('change', (e) => {
      state.filterType = e.target.value;
      renderBoard();
      refreshIcons();
    });

    // Priority Filter
    document.getElementById('filter-priority').addEventListener('change', (e) => {
      state.filterPriority = e.target.value;
      renderBoard();
      refreshIcons();
    });

    // Deadline Filter
    document.getElementById('filter-deadline').addEventListener('change', (e) => {
      state.filterDeadline = e.target.value;
      renderBoard();
      refreshIcons();
    });

    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderBoard();
      refreshIcons();
    });

    // Create Task Button
    document.getElementById('btn-create-task').addEventListener('click', () => {
      openCreateModal('todo');
    });

    // Quick Add Buttons in Columns
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const status = e.currentTarget.getAttribute('data-status') || 'todo';
        openCreateModal(status);
      });
    });

    // Form Modal Events
    document.getElementById('modal-close-btn').addEventListener('click', closeTaskModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeTaskModal);
    document.getElementById('task-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'task-modal-overlay') closeTaskModal();
    });
    document.getElementById('task-form').addEventListener('submit', handleTaskFormSubmit);

    // Details Modal Events
    document.getElementById('details-close-btn').addEventListener('click', closeDetailsModal);
    document.getElementById('task-details-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'task-details-overlay') closeDetailsModal();
    });

    document.getElementById('btn-delete-task-detail').addEventListener('click', () => {
      if (state.viewingTaskId) deleteTask(state.viewingTaskId);
    });

    document.getElementById('btn-edit-task-detail').addEventListener('click', () => {
      if (state.viewingTaskId) openEditModal(state.viewingTaskId);
    });

    document.getElementById('btn-toggle-done-detail').addEventListener('click', () => {
      if (state.viewingTaskId) {
        toggleTaskDone(state.viewingTaskId);
        openDetailsModal(state.viewingTaskId);
      }
    });

    // Load Sample Data / Reset
    document.getElementById('btn-load-sample').addEventListener('click', () => {
      if (confirm('คุณต้องการรีเซ็ตและโหลดข้อมูลตัวอย่างการบ้านและวิชาเรียนเริ่มต้นใหม่ทั้งหมดใช่หรือไม่?')) {
        state.tasks = getSampleStudyTasks();
        state.activeChip = 'all';
        document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        const allChip = document.querySelector('.chip-btn[data-chip="all"]');
        if (allChip) allChip.classList.add('active');
        saveTasks();
        renderAll();
        showToast('โหลดข้อมูลตัวอย่างวิชาเรียนและการบ้านเรียบร้อยแล้ว', 'success');
      }
    });

    // Keyboard ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTaskModal();
        closeDetailsModal();
      }
    });
  }

  // --- App Initialization ---
  function init() {
    loadInitialState();
    initDropZones();
    initEventListeners();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
