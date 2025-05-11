// public/scripts/app.js

// Global variables (zachowaj istniejące)
let editId = null;
let currentTab = 'dashboard'; // Default active tab

// Chart instances (global to be accessed by theme updater and render functions)
let runsChart, workoutsChart, otherActivitiesChart, dashboardChart, statsChart1, statsChart2;

// Helper function to apply styles for common form elements dynamically
const formInputClasses = "w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50 px-3 py-2.5 rounded-lg shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50 transition-colors";
const formLabelClasses = "block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300";
const formTextareaClasses = `${formInputClasses} min-h-[80px]`; // For textareas

// Theme switching logic (zachowaj istniejące)
const toggleTheme = () => {
  const body = document.getElementById('body');
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('toggleTheme').innerHTML = isDark ? '<i class="fas fa-sun text-xl"></i>' : '<i class="fas fa-moon text-xl"></i>';
  updateChartsTheme(isDark);
};

// Apply stored theme on load (zachowaj istniejące)
const applyInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const body = document.getElementById('body');
    let isDark;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        body.classList.add('dark');
        isDark = true;
    } else {
        body.classList.remove('dark');
        isDark = false;
    }
    document.getElementById('toggleTheme').innerHTML = isDark ? '<i class="fas fa-sun text-xl"></i>' : '<i class="fas fa-moon text-xl"></i>';
    updateChartsTheme(isDark); // Initial chart theme
};

// Update charts theme (zachowaj istniejące)
const updateChartsTheme = (isDark) => {
    const gridColor = isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.7)'; // slate-500/slate-300
    const ticksColor = isDark ? '#cbd5e1' : '#475569'; // slate-300/slate-600
    const legendColor = isDark ? '#e2e8f0' : '#1e293b'; // slate-200/slate-800
    const tooltipBgColor = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const tooltipTitleColor = isDark ? '#f1f5f9' : '#0f172a';
    const tooltipBodyColor = isDark ? '#e2e8f0' : '#334155';

    Chart.defaults.color = legendColor;
    Chart.defaults.borderColor = gridColor;

    // Update options for existing charts if they exist
    const chartInstances = [runsChart, workoutsChart, otherActivitiesChart, dashboardChart, statsChart1, statsChart2];
    chartInstances.forEach(chart => {
        if (chart) {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = ticksColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = ticksColor;
            chart.options.plugins.legend.labels.color = legendColor;

            if (chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.backgroundColor = tooltipBgColor;
                chart.options.plugins.tooltip.titleColor = tooltipTitleColor;
                chart.options.plugins.tooltip.bodyColor = tooltipBodyColor;
            }
            chart.update();
        }
    });
};

const commonChartOptions = (isDark) => { // zachowaj istniejące
    const gridColor = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.7)';
    const ticksColor = isDark ? '#94a3b8' : '#475569';
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';
    const tooltipBgColor = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const tooltipTitleColor = isDark ? '#f1f5f9' : '#0f172a';
    const tooltipBodyColor = isDark ? '#cbd5e1' : '#334155';

    return {
        responsive: true,
        maintainAspectRatio: false,
        color: legendColor,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: ticksColor, padding: 8 }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: ticksColor, padding: 8 }
            }
        },
        plugins: {
            legend: {
                labels: { color: legendColor, font: { size: 13 } },
                position: 'bottom',
                align: 'center'
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: tooltipBgColor,
                titleColor: tooltipTitleColor,
                titleFont: { weight: 'bold', size: 14 },
                bodyColor: tooltipBodyColor,
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                borderColor: gridColor,
                borderWidth: 1,
                boxPadding: 4
            }
        },
        animation: {
            duration: 400,
            easing: 'easeInOutQuad'
        }
    };
};

const renderCharts = (activities) => { // zachowaj istniejące, ale zniszcz i utwórz na nowo
  const isDark = document.getElementById('body').classList.contains('dark');
  const baseChartOptions = commonChartOptions(isDark);

  // Destroy existing charts before re-rendering
  [runsChart, workoutsChart, otherActivitiesChart, dashboardChart, statsChart1, statsChart2].forEach(chart => {
    if (chart) chart.destroy();
  });

  // Render runs chart
  if (document.getElementById('runsChart')) {
    const ctx = document.getElementById('runsChart').getContext('2d');
    const runActivities = activities.filter(a => a.type === 'run').sort((a,b) => new Date(a.date) - new Date(b.date));
    runsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: runActivities.map(a => new Date(a.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })),
        datasets: [{
          label: 'Dystans (km)',
          data: runActivities.map(a => a.distance),
          backgroundColor: isDark ? 'rgba(2, 132, 199, 0.3)' : 'rgba(59, 130, 246, 0.2)',
          borderColor: isDark ? '#0284c7' : '#3b82f6',
          borderWidth: 2.5,
          pointBackgroundColor: isDark ? '#0284c7' : '#3b82f6',
          pointBorderColor: isDark ? '#0f172a' : '#fff',
          pointHoverBackgroundColor: isDark ? '#0f172a' : '#fff',
          pointHoverBorderColor: isDark ? '#0284c7' : '#3b82f6',
          tension: 0.4,
          fill: true
        }]
      },
      options: {...baseChartOptions}
    });
  }

  // Render workouts chart
  if (document.getElementById('workoutsChart')) {
    const ctx = document.getElementById('workoutsChart').getContext('2d');
    const workoutActivities = activities.filter(a => a.type === 'workout').sort((a,b) => new Date(a.date) - new Date(b.date));
    workoutsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: workoutActivities.map(a => new Date(a.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })),
        datasets: [{
          label: 'Czas trwania (min)',
          data: workoutActivities.map(a => a.duration),
          backgroundColor: isDark ? 'rgba(5, 150, 105, 0.6)' : 'rgba(16, 185, 129, 0.7)',
          borderColor: isDark ? '#059669' : '#10b981',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: isDark ? 'rgba(5, 150, 105, 0.8)' : 'rgba(16, 185, 129, 0.9)',
        }]
      },
      options: {...baseChartOptions}
    });
  }

  // Render other activities chart
  if (document.getElementById('otherActivitiesChart')) {
    const ctx = document.getElementById('otherActivitiesChart').getContext('2d');
    const otherFilteredActivities = activities.filter(a => a.type === 'other').sort((a,b) => new Date(a.date) - new Date(b.date));
    otherActivitiesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: otherFilteredActivities.map(a => new Date(a.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })),
        datasets: [{
          label: 'Czas trwania (min)',
          data: otherFilteredActivities.map(a => a.duration),
          backgroundColor: isDark ? 'rgba(220, 38, 38, 0.3)' : 'rgba(239, 68, 68, 0.2)',
          borderColor: isDark ? '#dc2626' : '#ef4444',
          borderWidth: 2.5,
          pointBackgroundColor: isDark ? '#dc2626' : '#ef4444',
          pointBorderColor: isDark ? '#0f172a' : '#fff',
          tension: 0.4,
          fill: true
        }]
      },
      options: {...baseChartOptions}
    });
  }

  // Render dashboard chart (Doughnut)
  if (document.getElementById('dashboardChart')) {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    dashboardChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Biegi', 'Treningi', 'Inne'],
        datasets: [{
          data: [
            activities.filter(a => a.type === 'run').length,
            activities.filter(a => a.type === 'workout').length,
            activities.filter(a => a.type === 'other').length
          ],
          backgroundColor: [
            isDark ? '#0284c7' : '#3b82f6',
            isDark ? '#059669' : '#10b981',
            isDark ? '#ca8a04' : '#eab308'
          ],
          borderColor: isDark ? '#1e293b' : '#fff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateScale: true, animateRotate: true, duration: 600 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
                color: commonChartOptions(isDark).plugins.legend.labels.color,
                padding: 20,
                font: {size: 13}
            }
          },
          tooltip: commonChartOptions(isDark).plugins.tooltip
        }
      }
    });
  }

  // Render stats charts (zachowaj istniejące)
  if (document.getElementById('statsChart1')) {
    const ctx1 = document.getElementById('statsChart1').getContext('2d');
    // TODO: Użyj rzeczywistych danych z backendu dla statystyk
    statsChart1 = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
        datasets: [{
          label: 'Dystans (km)',
          data: [12, 19, 3, 5, 2, 3, 15, 8, 6, 10, 4, 7],
          backgroundColor: isDark ? 'rgba(2, 132, 199, 0.7)' : 'rgba(59, 130, 246, 0.75)',
          borderColor: isDark ? '#0284c7' : '#3b82f6',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {...baseChartOptions, plugins: {...baseChartOptions.plugins, legend: {display: false}}}
    });
  }
  if (document.getElementById('statsChart2')) {
    const ctx2 = document.getElementById('statsChart2').getContext('2d');
     // TODO: Użyj rzeczywistych danych z backendu dla statystyk
    statsChart2 = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
        datasets: [{
          label: 'Czas (min)',
          data: [500, 800, 200, 300, 400, 150, 600, 350, 250, 450, 180, 320],
          borderColor: isDark ? '#059669' : '#10b981',
          backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: isDark ? '#059669' : '#10b981',
          pointBorderColor: isDark ? '#1e293b' : '#fff',
        }]
      },
      options: {...baseChartOptions, plugins: {...baseChartOptions.plugins, legend: {display: false}}}
    });
  }
};


const exportData = async (endpoint) => { // zachowaj istniejące
  try {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.length === 0) {
      alert('Brak danych do eksportu.');
      return;
    }
    const csv = convertToCSV(data);
    downloadCSV(csv, `${endpoint.split('?')[0].replace('activities?filter=','')}.csv`);
  } catch (error) {
    console.error('Błąd podczas eksportowania danych:', error);
    alert('Wystąpił błąd podczas eksportowania danych.');
  }
};

const convertToCSV = (objArray) => { // zachowaj istniejące
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  const headers = Object.keys(array[0]);
  str += headers.join(',') + '\r\n';
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index = 0; index < headers.length; index++) {
      if (line !== '') line += ',';
      let cellData = array[i][headers[index]];
      if (cellData !== null && cellData !== undefined) {
          if (typeof cellData === 'string' && (cellData.includes(',') || cellData.includes('"'))) {
            cellData = `"${cellData.replace(/"/g, '""')}"`;
          } else if (Array.isArray(cellData)) {
             cellData = `"${cellData.map(item => String(item).replace(/"/g, '""')).join(', ')}"`;
          } else {
             cellData = String(cellData);
          }
      } else {
        cellData = '';
      }
      line += cellData;
    }
    str += line + '\r\n';
  }
  return str;
};

const downloadCSV = (csv, filename) => { // zachowaj istniejące
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function openModal(type) { // zachowaj istniejące
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalType').value = type;
  const titleSuffix = type === 'note' ? 'Notatka' : 'Aktywność';
  const action = editId ? 'Edytuj' : 'Nowa';
  document.getElementById('modalTitle').textContent = `${action} ${titleSuffix}`;
  document.getElementById('modalForm').reset();

  const extraFields = document.getElementById('extraFields');

  if (type === 'note') {
    extraFields.innerHTML = `
      <div>
        <label for="fieldContent" class="${formLabelClasses}">Treść</label>
        <textarea id="fieldContent" name="fieldContent" class="${formTextareaClasses}" rows="5" required></textarea>
      </div>
    `;
  } else {
    extraFields.innerHTML = `
      <div>
        <label for="fieldDate" class="${formLabelClasses}">Data i czas</label>
        <input type="datetime-local" id="fieldDate" name="fieldDate" class="${formInputClasses}" required />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label for="fieldDuration" class="${formLabelClasses}">Czas trwania (min)</label>
          <input type="number" step="0.01" id="fieldDuration" name="fieldDuration" min="0" class="${formInputClasses}" placeholder="np. 50.5 lub 50,5" />
        </div>
        <div>
          <label for="fieldDistance" class="${formLabelClasses}">Dystans (km)</label>
          <input type="number" step="0.01" id="fieldDistance" name="fieldDistance" min="0" class="${formInputClasses}" placeholder="np. 5.5 lub 2,49" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
         <div>
          <label for="fieldPace" class="${formLabelClasses}">Tempo (min/km, np. 5:30)</label>
          <input type="text" id="fieldPace" name="fieldPace" class="${formInputClasses}" placeholder="np. 5:30" />
        </div>

      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
         <div>
          <label for="fieldCalories" class="${formLabelClasses}">Spalone kalorie</label>
          <input type="number" id="fieldCalories" name="fieldCalories" min="0" class="${formInputClasses}" />
        </div>
        <div>
          <label for="fieldAvgHeartRate" class="${formLabelClasses}">Średnie tętno (bpm)</label>
          <input type="number" id="fieldAvgHeartRate" name="fieldAvgHeartRate" min="0" class="${formInputClasses}" />
        </div>
      </div>
      <div>
        <label for="fieldFeeling" class="${formLabelClasses}">Samopoczucie (1-5)</label>
        <input type="number" id="fieldFeeling" name="fieldFeeling" min="1" max="5" class="${formInputClasses}" />
      </div>
       <div>
        <label for="fieldTags" class="${formLabelClasses}">Tagi (rozdzielone przecinkami)</label>
        <input type="text" id="fieldTags" name="fieldTags" class="${formInputClasses}" placeholder="np. bieg, interwały, podbiegi" />
      </div>
      <div>
        <label for="fieldNotes" class="${formLabelClasses}">Uwagi</label>
        <textarea id="fieldNotes" name="fieldNotes" class="${formTextareaClasses}" rows="3"></textarea>
      </div>
      <div>
        <label for="fieldImage" class="${formLabelClasses}">Zdjęcie</label>
        <input type="file" id="fieldImage" name="fieldImage" accept="image/*" class="w-full text-sm text-slate-500 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-sky-700 file:text-sky-700 dark:file:text-sky-100 hover:file:bg-sky-100 dark:hover:file:bg-sky-600 transition-colors" />
      </div>
    `;
  }
}

// Funkcja do parsowania formatu MM:SS (lub HH:MM:SS) na minuty dziesiętne (zachowaj istniejące)
function parsePaceInput(paceInput) {
    if (!paceInput) return null;
    const parts = paceInput.split(':').map(Number);

    if (parts.some(isNaN) || parts.some(p => p < 0)) {
        return NaN; // Invalid input
    }

    if (parts.length === 1) {
        // Assumes MM
        return parts[0];
    } else if (parts.length === 2) {
        // Assumes MM:SS
        if (parts[1] >= 60) return NaN; // Seconds must be less than 60
        return parts[0] + parts[1] / 60;
    } else if (parts.length === 3) {
        // Assumes HH:MM:SS
         if (parts[1] >= 60 || parts[2] >= 60) return NaN; // Minutes and seconds must be less than 60
        return parts[0] * 60 + parts[1] + parts[2] / 60;
    }
     return NaN; // Unsupported format
}


async function loadData() { // zachowaj istniejące z drobnymi modyfikacjami do dashboardu
  try {
    const [activitiesRes, notesRes] = await Promise.all([
        fetch('/api/activities'),
        fetch('/api/notes')
    ]);

    if (!activitiesRes.ok) throw new Error(`Nie udało się załadować aktywności: ${activitiesRes.status}`);
    const activities = await activitiesRes.json();

    if (!notesRes.ok) throw new Error(`Nie udało się załadować notatek: ${notesRes.status}`);
    const notes = await notesRes.json();

    // Update dashboard stats
    document.getElementById('activityCount').textContent = activities.length;
    document.getElementById('noteCount').textContent = notes.length;
    const totalDistance = activities.reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);
    document.getElementById('totalDistance').textContent = `${totalDistance.toFixed(2)} km`;
    const totalTime = activities.reduce((sum, a) => sum + (parseFloat(a.duration) || 0), 0); // Użyj parseFloat dla duration
    document.getElementById('totalTime').textContent = `${totalTime.toFixed(0)} min`; // Formatuj sumę do pełnych minut

    // Render recent activities - Update this section to display new fields too if desired
    const recentActivitiesContainer = document.getElementById('recentActivities');
    if (activities.length > 0) {
        recentActivitiesContainer.innerHTML = activities.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map(a => {
             const itemColor = activityTypeToColor(a.type, 'bg');
             const recentPaceSpeedHtml = (a.pace !== null && a.pace !== undefined && !isNaN(a.pace)) ? `
                &nbsp;&nbsp; <i class="fas fa-stopwatch mr-1 text-${itemColor}-600 dark:text-${itemColor}-400"></i> ${formatPace(a.pace)}
             ` : '';
            return `
                <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg shadow-sm flex items-start space-x-4">
                    <div class="bg-${itemColor}-500 w-11 h-11 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow">
                    <i class="fas ${activityTypeToIcon(a.type)} text-xl"></i>
                    </div>
                    <div class="flex-1">
                    <h3 class="font-semibold text-slate-800 dark:text-slate-100">${a.name}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${new Date(a.date).toLocaleString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p class="text-sm mt-1.5 text-slate-700 dark:text-slate-300">
                        <i class="far fa-clock mr-1 text-sky-600 dark:text-sky-400"></i> ${a.duration !== null && a.duration !== undefined ? parseFloat(a.duration).toFixed(1) : '-'} min &nbsp;&nbsp;
                        <i class="fas fa-road mr-1 text-emerald-600 dark:text-emerald-400"></i> ${a.distance !== null && a.distance !== undefined ? parseFloat(a.distance).toFixed(2) : '-'} km
                        ${recentPaceSpeedHtml}
                    </p>
                     ${a.tags && a.tags.length > 0 ? `<p class="text-xs text-slate-600 dark:text-slate-400 mt-1"><i class="fas fa-tags mr-1"></i> ${a.tags.join(', ')}</p>` : ''}
                    </div>
                    <div class="flex flex-col space-y-1.5">
                        <button class="edit p-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors" data-id="${a._id}" data-type="activity" aria-label="Edytuj">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="delete p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-500 transition-colors" data-id="${a._id}" data-type="activity" aria-label="Usuń">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        recentActivitiesContainer.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center py-4">Brak ostatnich aktywności.</p>';
    }

    renderCharts(activities);

    renderList('runs', activities.filter(a => a.type === 'run'));
    renderList('workouts', activities.filter(a => a.type === 'workout'));
    renderList('activities', activities.filter(a => a.type === 'other'));
    renderNotesList(notes);

    if (currentTab === 'stats') {
      const statsTableBody = document.getElementById('statsTable');
       // Możesz rozszerzyć tę tabelę o podsumowanie nowych pól, jeśli potrzebujesz
      statsTableBody.innerHTML = `
        <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">Biegi</td>
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${activities.filter(a => a.type === 'run').reduce((sum, act) => sum + (parseFloat(act.distance) || 0), 0).toFixed(2)} km</td>
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${activities.filter(a => a.type === 'run').reduce((sum, act) => sum + (parseFloat(act.duration) || 0), 0).toFixed(0)} min</td>
        </tr>
        <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">Treningi</td>
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${activities.filter(a => a.type === 'workout').reduce((sum, act) => sum + (parseFloat(act.distance) || 0), 0).toFixed(2)} km</td>
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${activities.filter(a => a.type === 'workout').reduce((sum, act) => sum + (parseFloat(act.duration) || 0), 0).toFixed(0)} min</td>
        </tr>
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">Inne</td>
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${activities.filter(a => a.type === 'other').reduce((sum, act) => sum + (parseFloat(act.distance) || 0), 0).toFixed(2)} km</td>
          <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${activities.filter(a => a.type === 'other').reduce((sum, act) => sum + (parseFloat(act.duration) || 0), 0).toFixed(0)} min</td>
        </tr>
      `;
    }

    // TODO: Sprawdź parametry URL po przekierowaniu ze Strava i wyświetl komunikaty
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('strava_auth_success')) {
        alert('Pomyślnie połączono ze Strava!');
         // TODO: Ukryj przycisk "Połącz Strava", pokaż "Importuj Strava"
        history.replaceState({}, '', `${window.location.origin}${window.location.pathname}`); // Usuń parametr z URL
    } else if (urlParams.has('strava_auth_error')) {
         alert('Błąd połączenia ze Strava: ' + (urlParams.get('strava_auth_error') || 'Nieznany błąd.'));
         history.replaceState({}, '', `${window.location.origin}${window.location.pathname}`); // Usuń parametr z URL
    }


  } catch (error) {
    console.error('Błąd podczas ładowania danych:', error);
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.innerHTML = `<div class="text-center py-10"><i class="fas fa-exclamation-triangle text-rose-500 text-4xl mb-4"></i><p class="text-rose-500 text-lg">Wystąpił błąd podczas ładowania danych.</p><p class="text-slate-600 dark:text-slate-400">Spróbuj odświeżyć stronę.</p></div>`;
    }
  }
}

function activityTypeToColor(type, context = 'icon') { // zachowaj istniejące
    const colors = {
        run: 'sky',
        workout: 'emerald',
        other: 'amber',
        note: 'indigo'
    };
    return colors[type] || 'slate';
}

function activityTypeToIcon(type) { // zachowaj istniejące
  switch(type) {
    case 'run': return 'fa-person-running';
    case 'workout': return 'fa-dumbbell';
    case 'other': return 'fa-heart-pulse';
    case 'note': return 'fa-solid fa-note-sticky';
    default: return 'fa-question-circle';
  }
}

// Funkcja pomocnicza do formatowania tempa (np. 5.5 -> "5:30") (zachowaj istniejące)
function formatPace(pace) {
    if (pace === null || pace === undefined || isNaN(pace) || pace <= 0) return '-'; // Dodaj warunek pace <= 0
    const totalSeconds = Math.round(pace * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min/km`;
}

// Funkcja pomocnicza do formatowania prędkości (np. 10.5 -> "10.5 km/h") (zachowaj istniejące)
function formatSpeed(speed) {
    if (speed === null || speed === undefined || isNaN(speed) || speed <= 0) return '-'; // Dodaj warunek speed <= 0
     // Ogranicz do 1 miejsca po przecinku
    return `${speed.toFixed(1)} km/h`;
}


function renderList(sectionId, items) { // zachowaj istniejące z formatowaniem duration/distance
  const container = document.getElementById(sectionId + 'List');
  if (!container) return;
  items.sort((a,b) => new Date(b.date) - new Date(a.date)); // Sort newest first

  if (items.length === 0) {
    container.innerHTML = `<p class="text-slate-500 dark:text-slate-400 col-span-full text-center py-8">Brak aktywności tego typu.</p>`;
    return;
  }
  container.innerHTML = items.map(a => {
    const itemColor = activityTypeToColor(a.type);
    const newFieldsHtml = `
        ${a.pace !== null && a.pace !== undefined && !isNaN(a.pace) && a.pace > 0 ? `<p><i class="fas fa-stopwatch w-5 text-center mr-1.5 text-${itemColor}-600 dark:text-${itemColor}-400"></i> Tempo: ${formatPace(a.pace)}</p>` : ''}
         ${a.speed !== null && a.speed !== undefined && !isNaN(a.speed) && a.speed > 0 ? `<p><i class="fas fa-tachometer-alt w-5 text-center mr-1.5 text-${itemColor}-600 dark:text-${itemColor}-400"></i> Prędkość: ${formatSpeed(a.speed)}</p>` : ''}
        ${a.calories !== null && a.calories !== undefined && a.calories > 0 ? `<p><i class="fas fa-fire w-5 text-center mr-1.5 text-rose-600 dark:text-rose-400"></i> Kalorie: ${a.calories}</p>` : ''}
        ${a.avgHeartRate !== null && a.avgHeartRate !== undefined && a.avgHeartRate > 0 ? `<p><i class="fas fa-heartbeat w-5 text-center mr-1.5 text-red-600 dark:text-red-400"></i> Tętno śr.: ${a.avgHeartRate} bpm</p>` : ''}
         ${a.feeling !== null && a.feeling !== undefined ? `<p><i class="fas fa-face-${a.feeling === 5 ? 'grin-stars' : a.feeling === 4 ? 'grin' : a.feeling === 3 ? 'meh' : a.feeling === 2 ? 'frown' : 'tired'} w-5 text-center mr-1.5 text-yellow-600 dark:text-yellow-400"></i> Samopoczucie: ${a.feeling}/5</p>` : ''}
        ${a.tags && a.tags.length > 0 ? `<p><i class="fas fa-tags w-5 text-center mr-1.5 text-purple-600 dark:text-purple-400"></i> Tagi: ${a.tags.join(', ')}</p>` : ''}
    `.trim();


    return `
    <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 group relative">
      <div class="flex items-start space-x-4">
        <div class="bg-${itemColor}-500 dark:bg-${itemColor}-600 w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-md">
          <i class="fas ${activityTypeToIcon(a.type)} text-2xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate" title="${a.name}">${a.name}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">${new Date(a.date).toLocaleString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div class="text-sm mt-2.5 space-y-1 text-slate-700 dark:text-slate-300">
            <p><i class="far fa-clock w-5 text-center mr-1.5 text-${itemColor}-600 dark:text-${itemColor}-400"></i> ${a.duration !== null && a.duration !== undefined ? parseFloat(a.duration).toFixed(1) : '-'} min</p>
            <p><i class="fas fa-road w-5 text-center mr-1.5 text-${itemColor}-600 dark:text-${itemColor}-400"></i> ${a.distance !== null && a.distance !== undefined ? parseFloat(a.distance).toFixed(2) : '-'} km</p>
            ${newFieldsHtml}
          </div>
        </div>
      </div>
      ${a.notes ? `<p class="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 whitespace-pre-wrap">${a.notes}</p>` : ''}
      ${a.image ? `<img src="${a.image}" alt="${a.name}" class="mt-4 max-h-48 w-full object-cover rounded-md shadow-inner">` : ''}
      <div class="absolute top-3 right-3 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="edit p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700 transition-all shadow-sm" data-id="${a._id}" data-type="activity" aria-label="Edytuj">
          <i class="fas fa-pencil-alt text-xs"></i>
        </button>
        <button class="delete p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-700 transition-all shadow-sm" data-id="${a._id}" data-type="activity" aria-label="Usuń">
          <i class="fas fa-trash-alt text-xs"></i>
        </button>
      </div>
    </div>
  `}).join('');
}

function renderNotesList(notes) { // zachowaj istniejące
  const container = document.getElementById('notesList');
  if (!container) return;
  notes.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (notes.length === 0) {
    container.innerHTML = `<p class="text-slate-500 dark:text-slate-400 col-span-full text-center py-8">Brak notatek.</p>`;
    return;
  }
  container.innerHTML = notes.map(n => {
    const itemColor = activityTypeToColor('note');
    return `
    <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 group relative">
      <div class="flex items-start space-x-4">
        <div class="bg-${itemColor}-500 dark:bg-${itemColor}-600 w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-md">
          <i class="fas ${activityTypeToIcon('note')} text-2xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate" title="${n.title}">${n.title}</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Utworzono: ${new Date(n.createdAt || Date.now()).toLocaleDateString('pl-PL')}</p>
        </div>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 whitespace-pre-wrap">${n.content}</p>
      <div class="absolute top-3 right-3 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="edit p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700 transition-all shadow-sm" data-id="${n._id}" data-type="note" aria-label="Edytuj">
          <i class="fas fa-pencil-alt text-xs"></i>
        </button>
        <button class="delete p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-700 transition-all shadow-sm" data-id="${n._id}" data-type="note" aria-label="Usuń">
          <i class="fas fa-trash-alt text-xs"></i>
        </button>
      </div>
    </div>
  `}).join('');
}


// DOMContentLoaded Listener (zmodyfikowany o obsługę przycisków Strava)
document.addEventListener('DOMContentLoaded', () => {
  applyInitialTheme();

  document.getElementById('toggleTheme').addEventListener('click', toggleTheme);

  // Obsługa przycisków eksportu (zachowaj istniejące)
  const exportButtonIds = ['exportRunsBtn', 'exportWorkoutsBtn', 'exportActivitiesBtn', 'exportNotesBtn'];
  exportButtonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        const filter = id.includes('Runs') ? 'run' : id.includes('Workouts') ? 'workout' : id.includes('Activities') ? 'other' : null;
        const endpoint = id.includes('Notes') ? 'notes' : `activities?filter=${filter}`;
        btn.addEventListener('click', () => exportData(endpoint));
    }
  });

  // Obsługa przycisków Strava (DODAJ)
  const connectStravaBtn = document.getElementById('connectStrava');
  const importStravaBtn = document.getElementById('importStrava');

  if (connectStravaBtn) {
      connectStravaBtn.addEventListener('click', () => {
          // Przekieruj użytkownika do punktu wejścia autoryzacji w Twoim backendzie
          window.location.href = '/api/strava/auth';
      });
  }

  if (importStravaBtn) {
      importStravaBtn.addEventListener('click', async () => {
           // Możesz dodać wizualny wskaźnik ładowania
           importStravaBtn.textContent = 'Importowanie...';
           importStravaBtn.disabled = true;

          try {
              // Wywołaj endpoint importu w Twoim backendzie
              const response = await fetch('/api/strava/import'); // TODO: W prawdziwej aplikacji: wywołaj endpoint GET /api/strava/import
              const data = await response.json();

              if (response.ok) {
                  alert(data.message); // Wyświetl komunikat o powodzeniu
                  loadData(); // Odśwież dane na stronie po imporcie
                   // TODO: Zaktualizuj UI po imporcie (np. ukryj importuj, pokaż ostatni import)
              } else {
                  alert(`Błąd importu: ${data.message || 'Nieznany błąd'}`);
              }

          } catch (error) {
              console.error('Error importing from Strava:', error);
              alert('Wystąpił błąd podczas importu danych ze Strava.');
          } finally {
               // Przywróć stan przycisku
              importStravaBtn.textContent = 'Importuj Strava';
              importStravaBtn.disabled = false;
          }
      });
  }

  // TODO: Po załadowaniu strony, wykonaj zapytanie do backendu,
  // aby sprawdzić status połączenia ze Strava dla aktualnego użytkownika
  // i dynamicznie pokaż/ukryj przyciski "Połącz Strava" i "Importuj Strava".
  // np. fetch('/api/strava/status').then(res => res.json()).then(status => { ... });


  // Obsługa zakładek (zachowaj istniejące)
  const activeTabClasses = ['bg-sky-100', 'dark:bg-sky-700/60', 'text-sky-700', 'dark:text-sky-200', 'font-semibold'];
  const inactiveTabClasses = ['text-slate-700', 'dark:text-slate-300', 'hover:bg-slate-200', 'dark:hover:bg-slate-700'];

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(x => {
        x.classList.remove(...activeTabClasses);
        x.classList.add(...inactiveTabClasses);
      });

      btn.classList.add(...activeTabClasses);
      btn.classList.remove(...inactiveTabClasses);

      document.querySelectorAll('.section').forEach(s => {
        s.id === currentTab ? s.classList.remove('hidden') : s.classList.add('hidden');
      });
      loadData();
    });
  });

  // Set initial active tab styles (zachowaj istniejące)
  const initialActiveButton = document.querySelector(`.tab-btn[data-tab="${currentTab}"]`);
  if (initialActiveButton) {
    initialActiveButton.classList.add(...activeTabClasses);
    initialActiveButton.classList.remove(...inactiveTabClasses);
  }

  // Obsługa przycisków "Dodaj" (zachowaj istniejące)
  ['addRunBtn', 'addWorkoutBtn', 'addActivityBtn', 'addNoteBtn', 'openAddActivity'].forEach(id => {
    const btn = document.getElementById(id);
    if(btn) {
        let type;
        if (id === 'addRunBtn') type = 'run';
        else if (id === 'addWorkoutBtn') type = 'workout';
        else if (id === 'addNoteBtn') type = 'note';
        else type = 'other'; // Default for addActivityBtn and openAddActivity

        btn.addEventListener('click', () => { editId = null; openModal(type); });
    }
  });

  // Obsługa formularza modalnego (zachowaj istniejące)
  document.getElementById('modalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('modalType').value;
    const payload = {};
    let hasImage = false;
    let parseError = null;

    payload.name = document.getElementById('fieldName').value;

    if (type === 'note') {
      payload.title = payload.name;
      payload.content = document.getElementById('fieldContent').value;
    } else {
      payload.type = type;
      payload.date = document.getElementById('fieldDate').value;
      payload.duration = document.getElementById('fieldDuration').value ? +document.getElementById('fieldDuration').value : null;
      payload.distance = document.getElementById('fieldDistance').value ? +document.getElementById('fieldDistance').value : null;

      const paceText = document.getElementById('fieldPace').value.trim();
      payload.pace = paceText ? parsePaceInput(paceText) : null;

      if (payload.pace !== null && isNaN(payload.pace)) {
           parseError = 'Nieprawidłowy format tempa. Użyj np. "5:30" lub "1:20:15".';
      }

      if (parseError) {
          alert(parseError);
          return;
      }

      payload.notes = document.getElementById('fieldNotes').value || '';
      payload.calories = document.getElementById('fieldCalories').value ? +document.getElementById('fieldCalories').value : null;
      payload.avgHeartRate = document.getElementById('fieldAvgHeartRate').value ? +document.getElementById('fieldAvgHeartRate').value : null;
      payload.feeling = document.getElementById('fieldFeeling').value ? +document.getElementById('fieldFeeling').value : null;
      payload.tags = document.getElementById('fieldTags').value.trim();

      const fileInput = document.getElementById('fieldImage');
      if (fileInput && fileInput.files.length > 0) {
        hasImage = true;
      }
    }

    const processAndSend = async () => {
        const url  = (type === 'note' ? '/api/notes' : '/api/activities') + (editId ? `/${editId}` : '');
        const method = editId ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Nieznany błąd serwera.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            document.getElementById('modal').classList.add('hidden');
            editId = null;
            loadData(); // Odśwież dane po zapisie
        } catch (error) {
            console.error('Błąd zapisu:', error);
            alert(`Nie udało się zapisać: ${error.message}`);
        }
    };

    if (type !== 'note' && hasImage) {
        const reader = new FileReader();
        reader.onload = function(event) {
          payload.image = event.target.result;
          processAndSend();
        };
        reader.onerror = function(error) {
            console.error("Błąd odczytu pliku:", error);
            alert("Nie udało się przetworzyć obrazu.");
        };
        reader.readAsDataURL(document.getElementById('fieldImage').files[0]);
    } else {
        processAndSend();
    }
  });

  // Obsługa przycisków edycji/usuwania (zachowaj istniejące)
  document.getElementById('app').addEventListener('click', async (e) => {
    const button = e.target.closest('button.edit, button.delete');
    if (!button) return;

    const id = button.dataset.id;
    const typeFromDataset = button.dataset.type;
    if (!id) return;

    if (button.classList.contains('delete')) {
      if (confirm('Czy na pewno chcesz usunąć ten element?')) {
        const endpoint = typeFromDataset === 'note' ? 'notes' : 'activities';
        try {
            const response = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Nie udało się usunąć: ${response.status}`);
            loadData();
        } catch (error) {
            console.error('Błąd usuwania:', error);
            alert(`Nie udało się usunąć elementu: ${error.message}`);
        }
      }
    } else if (button.classList.contains('edit')) {
      const endpoint = typeFromDataset === 'note' ? 'notes' : 'activities';
      try {
        const res = await fetch(`/api/${endpoint}/${id}`);
        if(!res.ok) throw new Error(`Nie udało się pobrać danych do edycji: ${res.status}`);
        const data = await res.json();

        editId = id;
        openModal(typeFromDataset === 'note' ? 'note' : data.type);

        document.getElementById('fieldName').value = typeFromDataset === 'note' ? data.title : data.name;
        if (typeFromDataset === 'note') {
          document.getElementById('fieldContent').value = data.content;
        } else {
          document.getElementById('fieldDate').value = data.date ? data.date.substring(0,16) : '';
          document.getElementById('fieldDuration').value = data.duration !== null && data.duration !== undefined ? data.duration : '';
          document.getElementById('fieldDistance').value = data.distance !== null && data.distance !== undefined ? data.distance : '';

           if (data.pace !== null && data.pace !== undefined) {
               const totalSeconds = Math.round(data.pace * 60);
               const minutes = Math.floor(totalSeconds / 60);
               const seconds = totalSeconds % 60;
                document.getElementById('fieldPace').value = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
           } else {
               document.getElementById('fieldPace').value = '';
           }

          document.getElementById('fieldNotes').value = data.notes || '';
          document.getElementById('fieldCalories').value = data.calories || '';
          document.getElementById('fieldAvgHeartRate').value = data.avgHeartRate || '';
          document.getElementById('fieldFeeling').value = data.feeling || '';
          document.getElementById('fieldTags').value = data.tags ? data.tags.join(', ') : '';
        }
      } catch (error) {
        console.error('Błąd edycji:', error);
        alert(`Wystąpił błąd podczas przygotowania do edycji: ${error.message}`);
      }
    }
  });

  // Obsługa zamykania modalu (zachowaj istniejące)
  const closeModalButtons = ['cancelBtn', 'closeModalBtn'];
  closeModalButtons.forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => {
        document.getElementById('modal').classList.add('hidden');
        editId = null;
    });
  });

  // Initial data load
  loadData();
  // Ensure charts are themed correctly after initial load if theme was already dark
  updateChartsTheme(document.getElementById('body').classList.contains('dark'));

  // Add Tailwind CSS class definitions (zachowaj istniejące)
  const style = document.createElement('style');
  style.textContent = `
    .btn-primary { @apply bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75; }
    .btn-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75; }
    .form-input { @apply ${formInputClasses}; }
    .form-label { @apply ${formLabelClasses}; }
    .form-textarea { @apply ${formTextareaClasses}; }
  `;
  document.head.appendChild(style);
});