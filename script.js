const form = document.getElementById("study-form");
const addBtn = document.getElementById("add-subject");
const resultBox = document.getElementById("result");

// Add new subject row
addBtn.addEventListener("click", () => {
  const subject = document.querySelector(".subject").cloneNode(true);
  subject.querySelectorAll("input, select").forEach(i => i.value = "");
  form.insertBefore(subject, addBtn);

  // Add remove button for extra rows
  if (document.querySelectorAll(".subject").length > 1) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "🗑️ حذف";
    removeBtn.style.cssText = "grid-column: 1/-1; background: #fee; color: #c00; border: none; padding: 8px; border-radius: 8px; cursor: pointer;";
    removeBtn.onclick = () => {
      subject.remove();
    };
    subject.appendChild(removeBtn);
  }
});

// Main calculation logic
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const subjectElements = document.querySelectorAll(".subject");
  const totalHours = Number(document.getElementById("time").value);

  // Validation
  if (!totalHours || totalHours <= 0) {
    showToast("⚠️ من فضلك أدخل وقت مذاكرة صحيح");
    return;
  }

  const totalMinutes = totalHours * 60;
  let subjects = [];

  subjectElements.forEach(sub => {
    const name = sub.querySelector(".name")?.value?.trim();
    const difficulty = Number(sub.querySelector(".difficulty")?.value) || 1;
    const urgency = Number(sub.querySelector(".urgency")?.value) || 1;
    const confidence = Number(sub.querySelector(".confidence")?.value) || 2;

    if (name) {
      // Priority formula: higher difficulty + urgency + lower confidence = higher priority
      const priority = difficulty * urgency * (4 - confidence);
      subjects.push({ name, priority });
    }
  });

  if (subjects.length === 0) {
    showToast("⚠️ أضف مادة واحدة على الأقل");
    return;
  }

  // Sort by priority (highest first)
  subjects.sort((a, b) => b.priority - a.priority);

  // Take top 3 to focus on
  const focus = subjects.slice(0, 3);
  const skip = subjects.slice(3);

  // Calculate time distribution
  const totalPriority = focus.reduce((sum, s) => sum + s.priority, 0);

  // Build result HTML (FIXED template literals)
  let resultHTML = `
    <div style="text-align:center; margin-bottom:15px;">
      <i class="fas fa-check-circle" style="color:var(--success); font-size:1.5rem;"></i>
      <h3 style="margin:10px 0 5px;">✅ ركز على دول النهاردة:</h3>
    </div>
  `;

  focus.forEach((s, index) => {
    const minutes = totalPriority > 0
      ? Math.round((s.priority / totalPriority) * totalMinutes)
      : Math.round(totalMinutes / focus.length);

    resultHTML += `
      <div class="focus">
        ${index + 1}. <strong>${escapeHtml(s.name)}</strong>
        <span style="float:right; color:var(--primary); font-weight:600;">${minutes} دقيقة</span>
      </div>
    `;
  });

  if (skip.length > 0) {
    resultHTML += `
      <div class="skip">
        <strong>🧠 تقدر تؤجل دول:</strong><br>
        ${skip.map(s => escapeHtml(s.name)).join(" • ")}
      </div>
    `;
  }

  resultHTML += `
    <p style="margin-top:20px; padding-top:15px; border-top:2px solid #f0f0f0; text-align:center;">
      <strong>💡 مش لازم تعمل كل حاجة — بس اللي مهم صح.</strong>
    </p>
  `;

  resultBox.innerHTML = resultHTML;
  resultBox.classList.add('show');
  resultBox.style.display = "block";

  // Show toast + animate share button
  showToast("✅ تم حساب خطة المذاكرة!");

  setTimeout(() => {
    const shareBox = document.querySelector('.share-box');
    if (shareBox) {
      shareBox.style.animation = 'pulse 1s ease';
      setTimeout(() => { shareBox.style.animation = ''; }, 1000);
    }
  }, 800);
});

// Helper: Prevent XSS
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Allow Enter key to submit
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    form.requestSubmit();
  }
});

// WhatsApp Share
function shareOnWhatsApp() {
  const url = window.location.href;
  const msg = `مخطط المذاكرة اليومي 🎯\nركز على اللي مهم النهاردة!\n${url}\n\n#مذاكرة #طلاب_مصر`;
  const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  showToast("تم فتح واتساب! 📱");
  window.open(wa, '_blank');
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Pulse share button after result
const originalSubmit = form.onsubmit;
form.addEventListener('submit', function(e) {
  setTimeout(() => {
    const shareBox = document.querySelector('.share-box');
    if (shareBox && resultBox.style.display === 'block') {
      shareBox.style.animation = 'pulse 1s ease';
      setTimeout(() => shareBox.style.animation = '', 1000);
    }
  }, 800);
});

// Add pulse keyframes if not in CSS
if (!document.querySelector('#pulse-keyframes')) {
  const style = document.createElement('style');
  style.id = 'pulse-keyframes';
  style.textContent = `@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }`;
  document.head.appendChild(style);
}